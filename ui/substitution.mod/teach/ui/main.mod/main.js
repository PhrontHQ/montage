var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component;

exports.Main = Component.specialize( {
    templateDidLoad: {
        value: function (documentPart) {
            this.templateObjects = documentPart.objects;
        }
    }
});

