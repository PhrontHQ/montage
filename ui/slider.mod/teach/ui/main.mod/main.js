/* global console */

/**
 * @module ui/main.mod
 * @requires montage/ui/component
 */
var Component = require("montage/ui/component").Component;

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main.prototype */ {

    handleSliderAction: {
        value: function (event) {
            event.stopPropagation();
            console.log("handleSliderAction");
        }
    }
});
