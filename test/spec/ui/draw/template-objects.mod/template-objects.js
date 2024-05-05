exports = typeof exports !== "undefined" ? exports : {};

var Montage = require("mod/core/core").Montage;
var Component = require("mod/ui/component").Component;

exports.TemplateObjects = Component.specialize( {
    templateObjectsPresent: {value: false},

    templateDidLoad: {
        value: function () {
            this.templateObjectsPresent = !!this.templateObjects;
        }
    }
});

