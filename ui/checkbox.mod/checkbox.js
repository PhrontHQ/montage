/**
    @module "mod/ui/native/checkbox.mod"
    @requires mod/core/core
    @requires mod/ui/check-control
*/
var CheckControl = require("ui/check-control").CheckControl;

/**

    @class module:"mod/ui/native/checkbox.mod".Checkbox
    @extends module:mod/ui/check-control.CheckControl
*/
var Checkbox = exports.Checkbox = CheckControl.specialize({
    enterDocument: {
        value: function (firstTime) {
            this.super(firstTime);
            if (firstTime) {
                this.element.setAttribute("role", "checkbox");
            }
        }
    },

    hasTemplate: {
        value: false
    }
});
