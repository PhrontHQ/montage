
var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component;

exports.Main = Component.specialize( /** @lends Main# */ {
    text: {
        value: "Main Draw"
    },

    draw: {
        value: function () {
            this.element.textContent = this.text;
        }
    }
});
