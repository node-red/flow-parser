const NRFlow = require("./NRFlow.js");

/**
 * NRSubflow - Description
 * @property {object} instances - instances of the subflow
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
