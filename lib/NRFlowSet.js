const NRConfigNode = require('./NRConfigNode.js');
const NRFlow = require('./NRFlow.js');
const NRGroup = require('./NRGroup.js');
const NRNode = require('./NRNode.js');
const NRSubflow = require('./NRSubflow.js');
const NRSubflowInstance = require('./NRSubflowInstance.js');
const NRWire = require('./NRWire.js');


/**
 * NRFlowSet - Description
 * @property {object} flows - all flows
 * @property {object} nodes - all flow nodes
 * @property {object} configNodes - all config nodes
 * @property {object} subflows - all subflow definitions
 * @property {object} groups - all groups
 * @property {object} wires - all wires
 */
class NRFlowSet {
    constructor(flowConfig) {

        flowConfig = JSON.parse(JSON.stringify(flowConfig));

        this.flows = new Map();
        this.nodes = new Map();
        this.configNodes = new Map();
        this.subflows = new Map();
        this.groups = new Map();
        this.wires = [ ];

        this.globals = new NRFlow({});

        // Keep track of some particular objects that will require special handling
        let linkNodes = [];
        let subflowInstances = [];

        // The goal is to parse the full flow configuration in as few steps
        // as possible. That means not doing multiple loops over the full array.

        // This first pass creates all of the main NR* objects
        flowConfig.forEach(config => {
            if (config.type === "tab") {
                this.flows.set(config.id, new NRFlow(config));
            } else if (config.type === "subflow") {
                this.subflows.set(config.id, new NRSubflow(config));
            } else if (config.type === "group") {
                this.groups.set(config.id, new NRGroup(config));
            } else if (config.hasOwnProperty('x') && config.hasOwnProperty('y')) {
                if (/^subflow:/.test(config.type)) {
                    this.nodes.set(config.id, new NRSubflowInstance(config));
                    subflowInstances.push(this.nodes.get(config.id));
                } else {
                    // config.{id,type} are removed in NRNode constructor
                    const node = new NRNode(config)
                    this.nodes.set(node.id, node);
                    if (node.type === "link in" || node.type === "link out") {
                        linkNodes.push(node);
                    }
                }
            } else {
                this.configNodes.set(config.id, new NRConfigNode(config));
            }
        });

        // Create wires
        this.nodes.forEach(node => {
            if (node.wires) {
                for (let portNumber = 0; portNumber < node.wires.length; portNumber++) {
                    let portWires = node.wires[portNumber] || [];
                    for (let wireNumber = 0; wireNumber < portWires.length; wireNumber++) {
                        let destination = this.nodes.get(portWires[wireNumber]);
                        if (destination) {
                            let wire = new NRWire(node, portNumber, destination, 0);
                            node.addOutboundWire(wire);
                            destination.addInboundWire(wire);
                            this.wires.push(wire);
                        }
                    }
                }
            }
        })
        // Links Nodes
        let createdLinks = new Set();
        linkNodes.forEach(linkNode => {
            const links = linkNode.config.links || [];
            links.forEach(remoteId => {
                const linkIdentifier = linkNode.type === "link in"?(remoteId+":"+linkNode.id):(linkNode.id+":"+remoteId);
                if (!createdLinks.has(linkIdentifier)) {
                    createdLinks.add(linkIdentifier);
                    let remoteNode = this.nodes.get(remoteId);
                    let sourceNode = linkNode.type === "link in"?remoteNode:linkNode;
                    let destinationNode = linkNode.type === "link in"?linkNode:remoteNode;
                    let wire = new NRWire(sourceNode, 0, destinationNode, 0, true);
                    sourceNode.addOutboundWire(wire);
                    destinationNode.addInboundWire(wire);
                    this.wires.push(wire);
                }
            })
        })

        // Set the parent objects and subflow instances
        const addToParent = (collection) => {
            collection.forEach((object,_) => {
                let parent = this.flows.get(object.z) || this.subflows.get(object.z) || this.globals;
                if (parent) {
                    if (object instanceof NRConfigNode) {
                        parent.addConfigNode(object);
                    } else if (object instanceof NRGroup) {
                        parent.addGroup(object);
                    } else if (object instanceof NRSubflow) {
                        parent.addSubflow(object);
                    } else if (object instanceof NRSubflowInstance) {
                        parent.addNode(object);
                        const subflowTemplate = this.subflows.get(object.subflowId);
                        if (subflowTemplate) {
                            subflowTemplate.addInstance(object);
                        } else {
                            throw new Error("Cannot find subflow defintion "+object.subflowId+" used by subflow instance "+object.id);
                        }
                    } else {
                        parent.addNode(object);
                    }
                } else {
                    throw new Error("Cannot find parent "+object.z+" for object "+object.id);
                }
                if (object.groupId) {
                    let group = this.groups.get(object.groupId);
                    if (group) {
                        group.addNode(object)
                    }
                }
                findConfigNodeReferences(object);
            });
        }
        const findConfigNodeReferences = (node) => {
            let self = this;
            JSON.stringify(node.config, (_, value) => {
                if (typeof value === 'string') {
                    if (value !== node.id && self.configNodes.has(value)) {
                        let configNode = self.configNodes.get(value);
                        configNode.addUser(node);
                    }
                }
                return value;
            })
        };
        addToParent(this.nodes);
        addToParent(this.configNodes);
        addToParent(this.groups);
        addToParent(this.subflows);
    }


    /**
     * Export the flow as a Node Array that can be saves as JSON and loaded by Node-RED
     *
     * @return {Array} an array of node-red objects
     */
    export() {
        let result = this.globals.exportContents();
        this.flows.forEach(n => {
            result.push(n.export());
            result = result.concat(n.exportContents());
        })

        return result;
    }


    /**
     * Call the provided callback function for every object in the flow.
     * The objects are recursively visited in the following order:
     *
     *  - Subflow definitions
     *    - Config nodes scoped to this subflow
     *    - Groups
     *    - Nodes
     *  - Global Config nodes
     *  - Flows
     *    - Config nodes scoped to this flow
     *    - Groups
     *    - Nodes
     *
     * @param {Function} callback - A function to call for every object in the flow.
     *                              The function will receive the object as its
     *                              first argument
     */
    walk(callback) {
        this.globals.walk(callback);
        this.flows.forEach(n => n.walk(callback));
    }


}


module.exports = NRFlowSet
