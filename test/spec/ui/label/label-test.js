var Montage = require("mod/core/core").Montage;
var TestController = require("mod-testing/test-controller").TestController;

exports.LabelTest = TestController.specialize( {

    label: {
        value: null
    },

    text: {
        value: null
    }

});
