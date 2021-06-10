const NRFlowSet = require("./NRFlowSet.js")

/**
 * parseFlow - Parses a Node-RED Flow object
 *
 * @param {array} flowConfig An Flow JSON Array
 * @return {NRFlowSet} Description
 */
function parseFlow(flowConfig) {
    const flowSet = new NRFlowSet(flowConfig);
    return flowSet;
}

/**
 * Type symbols
 * @type ObjectTypes
 */
const Symbols = require("./Symbols");

module.exports = {
    parseFlow: parseFlow,
    types: Symbols
}
