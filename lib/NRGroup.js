const NRContainer = require("./NRContainer.js");
const Symbols = require("./Symbols");

/**
 * NRGroup - Description
 * @property {string} group - parent group, if set
 * @extends NRContainer
 */
class NRGroup extends NRContainer {

    /**
     * constructor - Description
     *
     * @param {type} config Description
     */
    constructor(config) {
        super(config);
        this.TYPE = Symbols.Group;
        this.w = config.w;
        this.h = config.h;
        this.groupId = config.g;
        delete config.g;

        this.style = config.style;
        delete config.w;
        delete config.h;
        delete config.style;
        this._nodes = config.nodes;
        delete config.nodes;
    }

    setGroup(group) {
        this.groupId = group.id;
        this.group = group;
    }

    addNode(node) {
        // Override default NRContainer behaviour as we don't setParent of the node
        this.nodes.set(node.id, node);
        node.setGroup(this);
    }

    export() {
        let obj = super.export();
        if (this.groupId) {
            obj.g = this.groupId;
        }
        obj.w = this.w;
        obj.h = this.h;
        if (this.style) {
            obj.style = this.style;
        }
        obj.nodes = Array.from(this.nodes.keys())
        return obj;
    }

    exportContents() {
        // As groups exist orthogonally to flows, we don't
        // export this contents this way.
        return [];
    }

    walk(callback) {
        // Don't use super.walk as that will revisit this.nodes
        callback(this);
    }
}

module.exports = NRGroup
