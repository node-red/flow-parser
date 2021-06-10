const NRFlow = require("./NRFlow.js");
const Symbols = require("./Symbols");

/**
 * NRSubflow - Description
 * @property {Map<String,NRSubflowInstance>} instances - instances of the subflow
 * @property {String} category - if set, custom category this subflow is in
 * @property {String} color - if set, custom color for this subflow node
 * @property {String} icon - a custom icon for the subflow node, if set
 * @property {String[]} inputLabels - array of custom labels for the node inputs
 * @property {String[]} outputLabels - array of custom labels for the node outputs
 * @property {object} env - subflow properties definition
 * @property {object} meta - meta information about the subflow
 *
 * @extends NRFlow
 */
class NRSubflow extends NRFlow {

    /**
     * constructor - Description
     *
     * @param {type} config Description
     */
    constructor(config) {
        super(config);
        this.TYPE = Symbols.Subflow;

        this.instances = new Map();
        this._ownProperties = ["category", "in", "out", "env", "meta", "color", "inputLabels", "outputLabels", "icon"];
        this._ownProperties.forEach(prop => {
            if (config.hasOwnProperty(prop)) {
                this[prop] = config[prop];
                delete config[prop];
            }
        })

        delete config.category;
    }

    export() {
        let obj = super.export();
        delete obj.disabled;
        this._ownProperties.forEach(prop => {
            if (this.hasOwnProperty(prop)) {
                obj[prop] = this[prop];
            }
        })
        return obj
    }

    /**
     * addInstance - Description
     *
     * @param {NRSubflowInstance} node Description
     */
    addInstance(node) {
        node.setSubflow(this);
        this.instances.set(node.id,node);
    }
}
module.exports = NRSubflow;
