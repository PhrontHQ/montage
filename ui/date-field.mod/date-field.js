/**
    @module "mod/ui/native/input-date.mod"
    @requires mod/core/core
    @requires mod/ui/component
    @requires mod/ui/text-input
*/
var TextInput = require("ui/text-input").TextInput,
    dateToDateInputStringConverter = require("../../../core/converter/date-to-date-input-string-converter").singleton;

/**
  	Wraps an &lt;input type="date"> element as a component.
    @class module:"mod/ui/native/input-date.mod".InputDate
    @extends module:mod/ui/text-input.TextInput
 */
var DateField = exports.DateField = TextInput.specialize({
    hasTemplate: {value: true },
    inputsTime: {
        value: false
    },
    converter: {
        value: dateToDateInputStringConverter
    }

});

DateField.addAttributes( /** @lends module:"mod/ui/native/input-date.mod".InputDate# */{

/**
	The upper bound for the element’s value represented in the "full-date" format, (for example, 2001-05-24).
	@type {string}
	@default: null
*/
    max: null,
/**
	The lower bound for the element’s value represented in the "full-date" format, (for example, 2001-05-24).
	@type {string}
	@default: null
*/
    min: null,

/**
	The amount the date changes with each step.
	@type {string|number}
	@default null
*/
    step: null
});
