
const doclets = {};
const propertyMap = {};

exports.handlers = {
    newDoclet: function(e) {
        if (e.doclet.kind === "class" && e.doclet.properties) {
            doclets[e.doclet.name] = e.doclet;
            e.doclet.properties = e.doclet.properties || [];
        }
    },
    parseComplete: function(e) {
        e.doclets.forEach(doclet => {
            if (doclet.kind === 'class' && doclet.augments) {
                augmentWithParent(doclet,doclets[doclet.augments[0]]);
            }
        })
    }

};

function augmentWithParent(doclet,parentDoclet) {
    doclet.properties = Array.from(new Set([...parentDoclet.properties, ...doclet.properties]))

    if (!parentDoclet.augments || parentDoclet.augments.length === 0) {
        return;
    } else {
        augmentWithParent(doclet,doclets[parentDoclet.augments[0]])
    }

}
