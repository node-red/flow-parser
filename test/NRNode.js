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

    describe('getDownstreamNodes', function() {
        it('no branches', function() {
            const nodes = nodeMap['flow4-node2'].getDownstreamNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow4-node3','flow4-node4','flow4-node5'])
        })

        it('branches on single output', function() {
            const nodes = nodeMap['flow5-node2'].getDownstreamNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow5-node3',
                'flow5-node4',
                'flow5-node5',
                'flow5-node8',
                'flow5-node9'
            ])
        })

        it('does not follow virtual links by default', function() {
            const nodes = nodeMap['flow6-node1'].getDownstreamNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow6-node2',
                'flow6-node3',
                'flow6-link1'
            ])
        })

        it('follows virtual links when asked', function() {
            const nodes = nodeMap['flow6-node1'].getDownstreamNodes(true);
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow6-node2',
                'flow6-node3',
                'flow6-node4',
                'flow6-link1',
                'flow6-link2'
            ])
        })

        it('does not get stuck in a loop', function() {
            const nodes = nodeMap['flow7-node2'].getDownstreamNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow7-node3',
                'flow7-node4'
            ])
        })
    })

    describe('getUpstreamNodes', function() {
        it('no branches', function() {
            const nodes = nodeMap['flow4-node4'].getUpstreamNodes();
            validateNodeList(convertNodeArrayToMap(nodes), ['flow4-node1','flow4-node2','flow4-node3'])
        })

        it('branches on single input', function() {
            const nodes = nodeMap['flow5-node4'].getUpstreamNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow5-node1',
                'flow5-node2',
                'flow5-node3',
                'flow5-node6',
                'flow5-node7'
            ])
        })
        it('does not follow virtual links by default', function() {
            const nodes = nodeMap['flow6-node4'].getUpstreamNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow6-link2'
            ])
        })

        it('follows virtual links when asked', function() {
            const nodes = nodeMap['flow6-node4'].getUpstreamNodes(true);
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow6-node1',
                'flow6-node2',
                'flow6-link1',
                'flow6-link2'
            ])
        })

        it('does not get stuck in a loop', function() {
            const nodes = nodeMap['flow7-node3'].getUpstreamNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow7-node1',
                'flow7-node2'
            ])
        })
    })

    describe('getConnectedNodes', function() {

        it('does not follow virtual links by default', function() {
            const nodes = nodeMap['flow6-link2'].getConnectedNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow6-node4'
            ])
        })

        it('follows virtual links when asked', function() {
            const nodes = nodeMap['flow6-link2'].getConnectedNodes(true);
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow6-node1',
                'flow6-node2',
                'flow6-node3',
                'flow6-node4',
                'flow6-link1'
            ])
        })

        it('does not get stuck in a loop', function() {
            const nodes = nodeMap['flow7-node2'].getConnectedNodes();
            validateNodeList(convertNodeArrayToMap(nodes), [
                'flow7-node1',
                'flow7-node3',
                'flow7-node4'
            ])
        })
    })

});
