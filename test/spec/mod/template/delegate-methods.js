var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component;


var DelegateMethods = Component.specialize( {
    deserializedFromTemplateCount: {value: 0},

    deserializedFromTemplate: {
        value: function () {
            this.deserializedFromTemplateCount++;
        }
    },

    templateDidLoadCount: {value: 0},

    templateDidLoad: {
        value: function () {
            this.templateDidLoadCount++;
        }
    }
});

exports.DelegateMethods = DelegateMethods;
