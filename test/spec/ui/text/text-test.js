var Montage = require("mod/core/core").Montage;
var TestController = require("mod-testing/test-controller").TestController;

exports.TextTest = TestController.specialize( {

    dynamictext: {
        value: null
    },

    plainText: {
        value: null
    }

});
