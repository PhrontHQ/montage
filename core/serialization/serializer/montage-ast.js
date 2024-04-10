var Montage = require("../../core").Montage;

// var Root = exports.Root = Montage.specialize({
var Root = exports.Root = class Root extends Montage {

    static {
        Montage.defineProperties(this.prototype, {
            object: {value: null}
        });
    }

    constructor () {
        super();
        this.object = Object.create(null);
    }

    setProperty (name, value) {
        if (name !== null && name !== undefined) {
            this.object[name] = value;
        }
    }

    getProperty (name) {
        return this.object[name];
    }

    clearProperty (name) {
        delete this.object[name];
    }

    hasProperty (name) {
        return name in this.object;
    }

    serialize (indent) {
        return JSON.stringify(this, null, indent);
    }

    toJSON () {
        var result = Object.create(null),
        myObject = this.object,
        labels = Object.keys(myObject),
        i,
        label,
        object;

        for(i=0;(label = labels[i]); i++) {
                object = myObject[label];

                if (object.toJSON) {
                    result[label] = object.toJSON(label, 1);
                } else {
                    result[label] = object;
                }
            }

        return result;
    }

}


// Montage.defineProperties(Root.prototype, {

    // constructor: {
    //     value:  function Root() {
    //         this.object = Object.create(null);
    //     }
    // },

    // object: {value: null},

    // setProperty: {
    //     value: function(name, value) {
    //         if (name !== null && name !== undefined) {
    //             this.object[name] = value;
    //         }
    //     }
    // },

    // getProperty: {
    //     value: function(name) {
    //         return this.object[name];
    //     }
    // },

    // clearProperty: {
    //     value: function(name) {
    //         delete this.object[name];
    //     }
    // },

    // hasProperty: {
    //     value: function(name) {
    //         return name in this.object;
    //     }
    // },

    // serialize: {
    //     value: function(indent) {
    //         return JSON.stringify(this, null, indent);
    //     }
    // },

    // toJSON: {
    //     value: function() {
    //         var result = Object.create(null),
    //         myObject = this.object,
    //         labels = Object.keys(myObject),
    //         i,
    //         label,
    //         object;

    //         for(i=0;(label = labels[i]); i++) {
    //                 object = myObject[label];

    //                 if (object.toJSON) {
    //                     result[label] = object.toJSON(label, 1);
    //                 } else {
    //                     result[label] = object;
    //                 }
    //             }

    //         return result;
    //     }
    // }
// });

var Value = exports.Value = class Value extends Montage {
    static {
        Montage.defineProperties(this.prototype, {
            root: {value: null},
            label: {value: null},
            value: {value: null}
        });
    }

    constructor(root, value) {
        super(root, value);
        return this.initWithRootAndValue(root, value);
    }

    initWithRootAndValue (root, value) {
        this.root = root;
        this.value = value;
        return this;
    }


    setLabel (label) {
        if (this.label) {
            this.root.clearProperty(this.label);
        }

        this.label = label;
        this.root.setProperty(label, this);
    }

    getLabel () {
        return this.label;
    }

    clearLabel () {
        this.root.clearProperty(this.label);
        this.label = null;
    }

    _getSerializationValue () {
        return this.value;
    }

    toJSON (index, level) {
        return (level === 1)
            ? {value: this._getSerializationValue()}
            : this._getSerializationValue();
    }


}

//var Value = exports.Value = Montage.specialize({
// Montage.defineProperties(Value.prototype, {
//         root: {value: null},
//     label: {value: null},
//     value: {value: null},

//     constructor: {
//         value: function Value(root, value) {
//             this.root = root;
//             this.value = value;
//         }
//     },

//     setLabel: {
//         value: function(label) {
//             if (this.label) {
//                 this.root.clearProperty(this.label);
//             }

//             this.label = label;
//             this.root.setProperty(label, this);
//         }
//     },

//     getLabel: {
//         value: function() {
//             return this.label;
//         }
//     },

//     clearLabel: {
//         value: function() {
//             this.root.clearProperty(this.label);
//             this.label = null;
//         }
//     },

//     _getSerializationValue: {
//         value: function() {
//             return this.value;
//         }
//     },

//     toJSON: {
//         value: function(index, level) {
//             return (level === 1)
//                 ? {value: this._getSerializationValue()}
//                 : this._getSerializationValue();
//         }
//     }
// });

/**
 * @class ElementReference
 * @extends Value
 */

var ElementReference = exports.ElementReference = class ElementReference extends Value {

    initWithRootAndId (root, id) {
        super.initWithRootAndValue(root, id);
        return this;
    }


    _getSerializationValue() {
        return {"#": this.value};
    }

}

/**
 * @class ModuleReference
 * @extends Value
 */
var ModuleReference = exports.ModuleReference = class ModuleReference extends Value {

    initWithRootAndModuleId(root, moduleId) {
        super.initWithRootAndValue(root, moduleId);
        return this;
    }

    _getSerializationValue() {
        return {"%": this.value};
    }
}


var ObjectReference = exports.ObjectReference = class ObjectReference extends Value {
    constructor(root, referenceLabel) {
        super(root, referenceLabel);
    }
}

ObjectReference.addClassProperties( /** @lends ObjectReference# */ {

    _getSerializationValue: {
        value: function() {
            return {"@": this.value};
        }
    }
});


var CustomObject = exports.CustomObject = class CustomObject extends Value {

    constructor(root) {
        super(root, Object.create(null));
    }

}

Montage.defineProperties(CustomObject.prototype, /** @lends CustomObject# */ {

    setProperty: {
        value: function(name, value) {
            if (name !== null && name !== undefined) {
                // console.log(this.constructor === CustomObject);
                this.value[name] = value;
            }
        }
    },

    getProperty: {
        value: function(name) {
            return this.value[name];
        }
    },

    clearProperty: {
        value: function(name) {
            delete this.value[name];
        }
    },

    toJSON: {
        value: function(index, level) {
            return (level === 1)
                ? this._getSerializationValue()
                : (new ObjectReference(this.root, this.label)).toJSON();
        }
    }
});


var ReferenceableValue = exports.ReferenceableValue = class ReferenceableValue extends Value {
    constructor(root, value) {
        super(root, value);
    }
}

ReferenceableValue.addClassProperties( /** @lends ObjectLiteral# */ {

    toJSON: {
        value: function(index, level) {
            return (level === 1)
                ? {value: this._getSerializationValue()}
                : (this.label)
                    ? (new ObjectReference(this.root, this.label)).toJSON()
                    : this._getSerializationValue();
        }
    }
});


var ObjectLiteral = exports.ObjectLiteral = class ObjectLiteral extends ReferenceableValue {
    constructor(root, object) {
        super(root, object);
    }
}

ObjectLiteral.addClassProperties( /** @lends ObjectLiteral# */ {

    setProperty: {
        value: function(name, value) {
            if (name !== null && name !== undefined) {
                this.value[name] = value;
            }
        }
    },

    getProperty: {
        value: function(name) {
            return this.value[name];
        }
    },

    clearProperty: {
        value: function(name) {
            delete this.value[name];
        }
    },

    getPropertyNames: {
        value: function() {
            return Object.keys(this.value);
        }
    }
});

var RegExpObject = exports.RegExpObject = ReferenceableValue.specialize( /** @lends RegExpObject# */ {

    constructor: {
        value: function RegExpObject(root, regexp) {
            this.super(root, regexp);
        }
    },

    _getSerializationValue: {
        value: function() {
            var regexp = this.value;

            return {"/": {
                source: regexp.source,
                flags: (regexp.global ? "g" : "") + (regexp.ignoreCase ? "i" : "") + (regexp.multiline ? "m" : "")
            }};
        }
    }
});

var DateObject = exports.DateObject = Value.specialize( /** @lends RegExpObject# */ {

    constructor: {
        value: function DateObject(root, date) {
            this.super(root, date);
        }
    },

    _getSerializationValue: {
        value: function() {
            return this.value.toISOString();
        }
    }
});
