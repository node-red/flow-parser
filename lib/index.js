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

module.exports = {
    parseFlow: parseFlow,
    types: require("./Symbols")
}
