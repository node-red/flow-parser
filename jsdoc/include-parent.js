
const propertyMap = {};

exports.handlers = {
    newDoclet: function(e) {
        if (e.doclet.kind === "class" && e.doclet.properties) {
            propertyMap[e.doclet.name] = e.doclet.properties;
        }
    },
    parseComplete: function(e) {
        e.doclets.forEach(doclet => {
            if (doclet.augments) {
                doclet.properties = doclet.properties || [];
                doclet.properties = propertyMap[doclet.augments[0]].concat(doclet.properties)
            }
        })
    }

};
