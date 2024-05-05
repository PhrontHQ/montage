var Montage = require("mod/core/core").Montage;
var TestController = require("mod-testing/test-controller").TestController;

exports.SubstitutionTest = TestController.specialize( {
    templateDidLoad: {
        value: function (documentPart) {
            this.templateObjects = documentPart.objects;
        }
    }
});
