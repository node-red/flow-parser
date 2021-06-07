const fs = require("fs");
const assert = require("assert");
const FlowParser = require("../lib/index.js");

describe("Flow Parser tests", function() {
    it('passes flow 1', function() {
        runTests(__dirname+"/resources/test-01.json")
    })
    it('passes flow 2', function() {
        runTests(__dirname+"/resources/test-02.json")
    })

    function runTests(filename) {
        const original = JSON.parse(fs.readFileSync(filename,"utf-8"));
        const flowSet = FlowParser.parseFlow(original);
        const generated = flowSet.export();



        // flowSet.walk(function(obj) {
        //     switch(obj.TYPE) {
        //         case FlowParser.types.Flow:
        //             // A flow object
        //             console.log("FLOW",obj.id)
        //             break;
        //         case FlowParser.types.Subflow:
        //             // A subflow definition
        //             console.log("SUBFLOW",obj.id)
        //             break;
        //         case FlowParser.types.Group:
        //             // A group object
        //             console.log(" Group",obj.id)
        //             break;
        //         case FlowParser.types.ConfigNode:
        //             // A config node
        //             console.log(" ConfigNode",obj.id)
        //             break;
        //         case FlowParser.types.Node:
        //             // A flow node
        //             console.log(" Node",obj.id)
        //             break;
        //     }
        // })

        const knownIds = original.map(n => n.id).sort();

        const walkedNodes = {};
        flowSet.walk(n => {
            assert(!walkedNodes[n.id],"Walk visited same node id twice: "+n.id+" "+n.type)
            walkedNodes[n.id] = n;
        });

        const generatedIds = Object.keys(walkedNodes)
        generatedIds.sort();

        for (var i=0;i<Math.max(knownIds.length,generatedIds.length);i++) {
            assert.strictEqual(knownIds[i],generatedIds[i])
        }

        assert(knownIds.length === generatedIds.length,"walk did not visit enough nodes")


        original.sort(function(A,B) { return A.id.localeCompare(B.id)})
        generated.sort(function(A,B) { return A.id.localeCompare(B.id)})

        function mangle(obj) {
            var result = [];
            for (var i in obj) {
                result.push(i+":"+JSON.stringify(obj[i]))
            }
            result.sort();
            return result;
        }

        for (var i=0;i<original.length;i++) {
            assert.deepStrictEqual(original[i],generated[i],"mismatch on object id "+original[i].id)
        }


        const originalSorted = JSON.stringify(original.map(v => mangle(v)),"",2);
        const generatedSorted = JSON.stringify(generated.map(v => mangle(v)),"",2);

        assert(originalSorted === generatedSorted, "generated flow does not match source flow")
        // fs.writeFileSync("/tmp/flow-A.json",JSON.stringify(original,"",2));
        // fs.writeFileSync("/tmp/flow-B.json",JSON.stringify(generated,"",2));
    }
});
