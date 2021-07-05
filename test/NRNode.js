const should = require("should");
const fs = require("fs").promises;
const assert = require("assert");
const FlowParser = require("../lib/index.js");

const FILENAME = __dirname+"/resources/test-NRNode.json";

describe("NRNode", function() {
    let flowSet;

    const nodeMap = {};

    before(async function() {
        const original = JSON.parse(await fs.readFile(FILENAME,"utf-8"));
        flowSet = FlowParser.parseFlow(original);

        flowSet.walk(function(obj) {
            if (obj.config.name) {
                nodeMap[obj.config.name] = obj;
            }
        })
    });

    function convertNodeArrayToMap(nodes) {
        const result = {};
        nodes.forEach(n => result[n.config.name] = true)
        return result;
    }
    function validateNodeList(nodeList, expectedNodes) {
        const nodeCount = Object.keys(nodeList).length;
        nodeCount.should.eql(expectedNodes.length);
        for (let i=0;i<nodeCount;i++) {
            nodeList.should.have.property(expectedNodes[i]);
        }
    }

    it('parses the flow', function() {
        flowSet.flows.size.should.eql(1);
        should.exist(nodeMap['flow1-node1'])
        should.exist(nodeMap['flow1-node2'])
        should.exist(nodeMap['flow1-node3'])
    })

    describe('getNextNodes', function() {
        it('single node on single output', function() {
            const nodes = nodeMap['flow1-node1'].getNextNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow1-node2'])
        })

        it('no node on output', function() {
            const nodes = nodeMap['flow1-node3'].getNextNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [])
        });

        it('multiple nodes on multiple outputs', function() {
            const nodes = nodeMap['flow2-node2'].getNextNodes();
            nodes.should.have.length(3);
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow2-node3',
                'flow2-node4',
                'flow2-node5'
            ])
        });

        it('no node on link out output', function() {
            const nodes = nodeMap['flow3-link1'].getNextNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [])
        });

        it('virtual link to node on link out output', function() {
            const nodes = nodeMap['flow3-link1'].getNextNodes(true);
            validateNodeList(convertNodeArrayToMap(nodes), ['flow3-link2'])
        });
    })

    describe('getPreviousNodes', function() {
        it('single node on input', function() {
            const nodes = nodeMap['flow1-node3'].getPreviousNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow1-node2'])
        })

        it('no node on input', function() {
            const nodes = nodeMap['flow1-node1'].getPreviousNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [])
        });

        it('multiple nodes on input', function() {
            const nodes = nodeMap['flow2-node2'].getPreviousNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow2-node1',
                'flow2-node6'
            ])
        });

        it('no node on link in input', function() {
            const nodes = nodeMap['flow3-link2'].getPreviousNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [])
        });

        it('virtual link from node on link in input', function() {
            const nodes = nodeMap['flow3-link2'].getPreviousNodes(true);
            validateNodeList(convertNodeArrayToMap(nodes), ['flow3-link1'])
        });
    })

    describe('getSiblingNodes', function() {
        it('single node on output', function() {
            const nodes = nodeMap['flow1-node1'].getSiblingNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow1-node2'])
        })

        it('single node on input and output', function() {
            const nodes = nodeMap['flow1-node2'].getSiblingNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow1-node1','flow1-node3'])
        });

        it('single node on input', function() {
            const nodes = nodeMap['flow1-node3'].getSiblingNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow1-node2'])
        });

        it('multiple nodes on inputs and outputs', function() {
            const nodes = nodeMap['flow2-node2'].getSiblingNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow2-node1',
                'flow2-node3',
                'flow2-node4',
                'flow2-node5',
                'flow2-node6'
            ]);
        });

        it('link in siblings - no virtual', function() {
            const nodes = nodeMap['flow3-link2'].getSiblingNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow3-node2'])
        });

        it('link in siblings - with virtual', function() {
            const nodes = nodeMap['flow3-link2'].getSiblingNodes(true);
            validateNodeList(convertNodeArrayToMap(nodes), ['flow3-link1','flow3-node2'])
        });

        it('link out siblings - no virtual', function() {
            const nodes = nodeMap['flow3-link1'].getSiblingNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow3-node1'])
        });

        it('link out siblings - with virtual', function() {
            const nodes = nodeMap['flow3-link1'].getSiblingNodes(true);
            validateNodeList(convertNodeArrayToMap(nodes), ['flow3-link2','flow3-node1'])
        });


    })


});
