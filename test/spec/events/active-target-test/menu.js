var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component;

exports.Menu = Component.specialize( {

    hasTemplate: {
        value: false
    },

    _storedTarget: {
        value: null
    },

    // The target this menu is currently coordinating with
    storedTarget: {
        get: function () {
            return this._storedTarget;
        },
        set: function (value) {
            // Ignore trying to set a child menuItem as a storedTarget
            if (value && this === value.menu) {
                return;
            }

            this._storedTarget = value;
            this.nextTarget = value;
        }
    },

    handleAction: {
        value: function (evt) {
            this.storedTarget.dispatchEventNamed("menuAction", true, true, evt.target);
        }
    }

});
