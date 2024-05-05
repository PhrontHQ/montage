/**
    @module "mod/ui/native/image.mod"
    @requires mod/ui/component
    @requires mod/ui/native-control
*/
var Component = require("ui/component").Component;

/**
 * Wraps the a &lt;img> element with binding support for its standard attributes.
   @class module:"mod/ui/native/image.mod".Image
   @extends module:mod/ui/control.Control
 */
exports.Image = Component.specialize({
    hasTemplate: {value: true }
});

exports.Image.addAttributes(/** @lends module:"mod/ui/native/image.mod".Image */{

/**
    A text description to display in place of the image.
    @type {string}
    @default null
*/
        alt: null,

/**
    The height of the image in CSS pixels.
    @type {number}
    @default null
*/
        height: null,

/**
    The URL where the image is located.
    @type {string}
    @default null
*/
        src: null,

/**
    The width of the image in CSS pixels.
    @type {number}
    @default null
*/
        width: null


});
