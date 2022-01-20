/**
 * @module montage/core/converter/ModuleIdToObjectConverter
 * @requires montage/core/converter/converter
 */
var Converter = require("./converter").Converter,
    singleton;

/**
 * @class ModuleIdToObjectConverter
 * @classdesc Converts a moduleId to the object it represents
 */
var ModuleIdToObjectConverter = exports.ModuleIdToObjectConverter = Converter.specialize({

    constructor: {
        value: function () {
            if (this.constructor === ModuleIdToObjectConverter) {
                if (!singleton) {
                    singleton = this;
                }

                return singleton;
            }

            return this;
        }
    },

    /**
     * Converts the RFC3339 string to a Date.
     * @function
     * @param {string} v The string to convert.
     * @returns {Date} The Date converted from the string.
     */
    convert: {value: function (v) {
        return  Date.parseRFC3339(v);
    }},

    /**
     * Reverts the specified Date to an RFC3339 String.
     * @function
     * @param {string} v The specified string.
     * @returns {string}
     */
    revert: {value: function (v) {
        return v.toISOString();
    }}

});

Object.defineProperty(exports, 'singleton', {
    get: function () {
        if (!singleton) {
            singleton = new ModuleIdToObjectConverter();
        }

        return singleton;
    }
});
