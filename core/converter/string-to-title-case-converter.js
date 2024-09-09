/**
 * @module mod/core/converter/string-to-title-case-converter
 * @requires mod/core/converter/converter
 * borrowed from: To Title Case © 2018 David Gouch | https://github.com/gouch/to-title-case (MIT)
 */
const Converter = require("./converter").Converter,

      smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i,
      alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/,
      wordSeparators = /([ :–—-])/;
var singleton;

/**
 * Converts string to title case.
 *
 * @class StringToTitleCaseConverter
 * @extends Converter
 */
var StringToTitleCaseConverter = exports.StringToTitleCaseConverter = Converter.specialize({

    constructor: {
        value: function () {
            if (this.constructor === StringToTitleCaseConverter) {
                if (!singleton) {
                    singleton = this;
                }

                return singleton;
            }

            return this;
        }
    },

    convert: {
        value: function CamelCaseConverter_convert(str) {

          return str.split(wordSeparators)
          .map(function (current, index, array) {
            if (
              /* Check for small words */
              current.search(smallWords) > -1 &&
              /* Skip first and last word */
              index !== 0 &&
              index !== array.length - 1 &&
              /* Ignore title end and subtitle start */
              array[index - 3] !== ':' &&
              array[index + 1] !== ':' &&
              /* Ignore small words that start a hyphenated phrase */
              (array[index + 1] !== '-' ||
                (array[index - 1] === '-' && array[index + 1] === '-'))
            ) {
              return current.toLowerCase()
            }
      
            /* Ignore intentional capitalization */
            if (current.substr(1).search(/[A-Z]|\../) > -1) {
              return current
            }
      
            /* Ignore URLs */
            if (array[index + 1] === ':' && array[index + 2] !== '') {
              return current
            }
      
            /* Capitalize the first letter */
            return current.replace(alphanumericPattern, function (match) {
              return match.toUpperCase()
            })
          })
          .join('')
        }
    }

});

Object.defineProperty(exports, 'singleton', {
    get: function () {
        if (!singleton) {
            singleton = new StringToTitleCaseConverter();
        }

        return singleton;
    }
});
