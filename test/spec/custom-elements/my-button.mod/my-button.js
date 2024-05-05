
var Component = require("mod/ui/component").Component;
var Button = require("mod/ui/button.mod").Button;

var MyButton = exports.MyButton = Button.specialize({
    hasTemplate: {
        value: true
    }
});

if (window.MontageElement) {
    MontageElement.define("my-button", MyButton, {
        observedAttributes: ['label']
    });
}
