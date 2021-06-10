/**
 * @typedef {Object} ObjectTypes
 * @property {Symbol} Node - A flow node
 * @property {Symbol} ConfigNode - A Configuration node
 * @property {Symbol} Group - A Group
 * @property {Symbol} Flow - A Flow
 * @property {Symbol} Subflow - A Subflow
 * @global
 */
module.exports = {
    /**
     * A flow node
     * @memberof Types
     * */
    Node: Symbol("NRNode"),
    /** A configuration node */
    ConfigNode: Symbol("NRConfigNode"),
    /** A group */
    Group: Symbol("NRGroup"),
    /** A flow */
    Flow: Symbol("NRFlow"),
    /** A subflow */
    Subflow: Symbol("NRSubflow")
}
