const NRObject = require("./NRObject.js");

/**
 * NRNode - Description
 * @property {number} x - X location
 * @property {number} y - Y location
 * @property {number} groupId - if set, the id of the group this node is in
 * @property {number} w - width (if known)
 * @property {number} h - height (if known)
 * @property {boolean} showLabel - whether the node displays its label
 * @property {string} group - group this node is part of, if set
 * @property {NRWire[]} inboundWires - Array of wires connected to an input of this node
 * @property {NRWire[]} outboundWires - Array of wires connected to an output of this node
 * @extends NRObject
 */
class NRNode extends NRObject {

    /**
     * constructor - Description
     *
     * @param {type} config Description
     */
    constructor(config) {
        super(config);
        this.x = config.x;
        this.y = config.y;
        this.groupId = config.g;
        delete config.g;

        if (config.hasOwnProperty('w')) {
            this.w = config.w;
        }
        if (config.hasOwnProperty('h')) {
            this.h = config.h;
        }
        if (config.hasOwnProperty('l')) {
            this.showLabel = config.l;
        } else {
            this.showLabel = (this.type !== "link in" && this.type !== "link out")
        }
        this.inputLabels = config.inputLabels || [];
        this.outputLabels = config.outputLabels || [];
        if (config.hasOwnProperty('icon')) {
            this.icon = config.icon;
        }

        this.wires = config.wires || [];
        this.outputCount = this.wires.length;

        delete config.x;
        delete config.y;
        delete config.w;
        delete config.h;
        delete config.wires;
        delete config.l;
        delete config.inputLabels;
        delete config.outputLabels;
        delete config.icon;

        this.inboundWires = [];
        this.outboundWires = [];
    }

    /**
     * setGroup - Set the group this node is in
     *
     * @param {NRGroup} group the group this node is a member of
     *
     * @return {type} Description
     */
    setGroup(group) {
        if (group) {
            this.groupId = group.id;
            this.group = group;
        } else {
            delete this.groupId;
            delete this.group;
        }
    }

    export() {
        let obj = super.export();
        obj.x = this.x;
        obj.y = this.y;
        if (this.groupId) {
            obj.g = this.groupId;
        }
        if (this.type === "link in" || this.type === "link out") {
            if (this.showLabel) {
                obj.l = true;
            }
        } else if (!this.showLabel) {
            obj.l = false;
        }
        obj.wires = new Array(this.outputCount).fill(true).map(_ => [])
        this.outboundWires.forEach(wire => {
            if (!wire.virtual) {
                obj.wires[wire.sourcePortIndex] = obj.wires[wire.sourcePortIndex] || [];
                obj.wires[wire.sourcePortIndex].push(wire.destinationNode.id);
            }
        })
        if (this.inputLabels.length > 0) {
            obj.inputLabels = this.inputLabels;
        }
        if (this.outputLabels.length > 0) {
            obj.outputLabels = this.outputLabels;
        }
        if (this.icon) {
            obj.icon = this.icon;
        }
        return obj;
    }

    /**
     * getSiblingNodes - Get the nodes wired directly to this node
     * @param {boolean} followVirtual whether to follow Link node virtual wires
     * @return {string[]} An array of node ids
     */
    getSiblingNodes(followVirtual) {
        return this.getPreviousNodes(followVirtual).concat(this.getNextNodes(followVirtual));
    }

    /**
     * getPreviousNodes - Get the nodes wired to this node's inputs
     * @param {type} followVirtual whether to follow Link node virtual wires
     * @return {string[]} An array of node ids
     */
    getPreviousNodes(followVirtual) {
        let result = [];
         this.inboundWires.forEach(wire => {
             if (!wire.virtual || followVirtual) {
                 result.push(wire.sourceNode);
             }
         });
         return result;
    }

    /**
     * getNextNodes - Get the nodes wired to this node's outputs
     * @param {type} followVirtual whether to follow Link node virtual wires
     * @return {string[]} An array of node ids
     */
    getNextNodes(followVirtual) {
        let result = [];
         this.outboundWires.forEach(wire => {
             if (!wire.virtual || followVirtual) {
                 result.push(wire.destinationNode);
             }
         });
         return result;
    }

    /**
     * getDownstreamNodes - Get all nodes reachable from this nodes's outputs
     * @param {type} followVirtual whether to follow Link node virtual wires
     * @return {string[]} An array of node ids
     */
    getDownstreamNodes(followVirtual) {
        const visited = { };
        visited[this.id] = true;
        const result = [ ];
        const stack = this.getNextNodes(followVirtual);
        while(stack.length > 0) {
            let node = stack.pop();
            if (!visited[node.id]) {
                result.push(node);
                visited[node.id] = true;
                let next = node.getNextNodes(followVirtual);
                next.forEach(n => {
                    if (!visited[n.id]) {
                        stack.push(n);
                    }
                })
            }
        }
        return result;
    }

    /**
     * getUpstreamNodes - Get all nodes reachable from this nodes's inputs
     * @param {type} followVirtual whether to follow Link node virtual wires
     * @return {string[]} An array of node ids
     */
    getUpstreamNodes(followVirtual) {
        const visited = { };
        visited[this.id] = true;
        const result = [ ];
        const stack = this.getPreviousNodes(followVirtual);
        while(stack.length > 0) {
            let node = stack.pop();
            if (!visited[node.id]) {
                result.push(node);
                visited[node.id] = true;
                let previous = node.getPreviousNodes(followVirtual);
                previous.forEach(n => {
                    if (!visited[n.id]) {
                        stack.push(n);
                    }
                })
            }
        }
        return result;
    }

    /**
     * getConnectedNodes - Get all nodes, including this one, reachable from its inputs and outputs
     * @param {type} followVirtual whether to follow Link node virtual wires
     * @return {string[]} An array of node ids
     */
    getConnectedNodes(followVirtual) {
        const visited = { };
        const result = [ ];
        const stack = [this];
        while(stack.length > 0) {
            let node = stack.pop();
            if (!visited[node.id]) {
                result.push(node);
                visited[node.id] = true;
                let siblings = node.getSiblingNodes(followVirtual);
                siblings.forEach(sibling => {
                    if (!visited[sibling.id]) {
                        stack.push(sibling);
                    }
                })
            }
        }
        return result;
    }


    /**
     * addOutboundWire - Add an outbound wire to this node
     * @param {NRWire} wire the outbound wire
     */
    addOutboundWire(wire) {
        this.outboundWires.push(wire);
    }

    /**
     * addInboundWire - Add an inbound wire to this node
     * @param {NRWire} wire the inbound wire
     */
    addInboundWire(wire) {
        this.inboundWires.push(wire);
    }
}

module.exports = NRNode;
