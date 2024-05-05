var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component,
    logger = require("mod/core/logger").logger("Simple"),
    SimpleTestComposer = require("spec/composer/simple-test-composer").SimpleTestComposer,
    LazyLoadComposer = require("spec/composer/simple-test-composer").LazyLoadTestComposer;
var TestController = require("mod-testing/test-controller").TestController;

exports.Test = TestController.specialize( {

    simpleTestComposer: {
        value: null
    }

});

exports.ProgrammaticTest = TestController.specialize( {

    simpleTestComposer: {
        value: null
    },

    deserializedFromTemplate: {
        value: function () {
            this.simpleTestComposer = new SimpleTestComposer();
            this.dynamicTextC.addComposer(this.simpleTestComposer);
        }
    }

});

exports.ProgrammaticLazyTest = TestController.specialize( {

    simpleTestComposer: {
        value: null
    },

    deserializedFromTemplate: {
        value: function () {
            this.simpleTestComposer = new LazyLoadComposer();
            this.dynamicTextC.addComposer(this.simpleTestComposer);
        }
    }


});
