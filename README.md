@node-red/flow-parser
---

This module provides a set of utilities for working with Node-RED flows.


## Usage

```
const fs = require("fs");
const { parseFlow } = require("@node-red/flow-parser");

// Load the flow json from a local file and parse to an object
const exampleFlow = JSON.parse(fs.readFileSync("flows.json", "utf-8"));

// Parse the flow
const flow = parseFlow(exampleFlow);

// `flow` is now an object that can be used to explore the flow structure
```


### Example - `walk`

The `walk` function can be used to invoke a function on every object in the flow
configuration in a reasonably well-defined order:

 - Subflow definitions
   - Nodes
   - Config nodes scoped to this subflow
   - Groups
 - Global Config nodes
 - Flows
   - Nodes
   - Config nodes scoped to this flow
   - Groups

```
const flow = parseFlow(exampleFlow);

flow.walk(obj => {
    if (obj.type === 'tab') {
        // A flow object
    } else if (obj.type === 'subflow') {
        // A subflow definition
    } else if (obj.type === 'group') {
        // A group object
    } else if (obj.constructor.name === 'NRConfigNode') {
        // A config node
    } else {
        // A flow node
    }
})
```

**TODO:** Add a better way to distinguish the object types

### Example - `export`

The `export` function gives back the JSON array for the flow.

The following example will disable all Debug nodes in the flow:

```
const flow = parseFlow(exampleFlow);

flow.walk(obj => {
    if (obj.type === 'debug') {
        obj.active = false;
    }
});

const newFlow = flow.export();
```
