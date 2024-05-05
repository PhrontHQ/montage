var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component;

exports.MenuItem = Component.specialize( {

    hasTemplate: {
        value: false
    },

    acceptsActiveTarget: {
        value: true
    },

    menu: {
        value: null
    },

    prepareForActivationEvents: {
        value: function () {
            this.element.addEventListener("mouseup", this);
        }
    },

    handleMouseup: {
        value: function () {
            this.dispatchEventNamed("action", true, true);
        }
    },

    willBecomeActiveTarget: {
        value: function (oldTarget) {
            this.menu.storedTarget = oldTarget;
        }
    }

});
