/**
 * @module ui/press-composer-layers.mod
 */
var Component = require("mod/ui/component").Component;

/**
 * @class PressComposerLayers
 * @extends Component
 */
exports.PressComposerLayers = Component.specialize(/** @lends PressComposerLayers# */ {
    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this.addEventListener("action", this);
                this.overlay.addEventListener("action", this);
            }
        }
    },

    handleShowOverlayAction: {
        value: function () {
            this.overlay.show();
        }
    },

    handleDismissOverlayAction: {
        value: function () {
            this.overlay.hide();
        }
    }
});
