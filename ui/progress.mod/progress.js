/**
    @module "mod/ui/native/progress.mod"
*/

var Control = require("ui/control").Control;

/**
  The Progress component wraps a native <code>&lt;progress></code> element and exposes its standard attributes as bindable properties.
  @class module:"mod/ui/native/progress.mod".Progress
  @extends module:mod/ui/control.Control

*/
var Progress = exports.Progress =  Control.specialize({
    hasTemplate: {value: false }
});

Progress.addAttributes( /** @lends module:"mod/ui/native/progress.mod".Progress# */{

/**
    The value of the id attribute of the form with which to associate the component's element.
    @type string}
    @default null
*/
    form: null,

/**
    The maximum value displayed but the progress control.
    @type {number}
    @default null
*/
    max: {dataType: 'number'},

/**
    The current value displayed but the progress control.
    @type {number}
    @default null
*/
    value: {dataType: 'number'}
});
