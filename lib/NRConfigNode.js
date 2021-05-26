const NRObject = require("./NRObject.js");

/**
 * NRConfigNode - Description
 * @property {object} users - Nodes that reference this config node
 * @extends NRObject
 * @inheritdoc
 */
class NRConfigNode extends NRObject {

    /**
     * constructor - Description
     *
     * @param {type} config Description
     */
    constructor(config) {
        super(config);
        this.users = new Set();
    }


    addUser(node) {
        this.users.add(node);
    }
}

module.exports = NRConfigNode;
