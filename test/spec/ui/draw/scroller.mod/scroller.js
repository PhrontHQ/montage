var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component;

exports.Scroller = Component.specialize( {
    canDraw: {
        value: function () {
            this.needsDraw = true;
            return Component.prototype.canDraw.apply(this, arguments);
        }
    }
});
