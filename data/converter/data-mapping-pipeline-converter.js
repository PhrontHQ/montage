var PipelineConverter = require("core/converter/pipeline-converter").PipelineConverter,
    Set = require("../collections/set");

/**
 * Converter that chains a series of converters together
 *
 *
 * @class PipelineConverter
 * @extends Converter
 */
exports.DataMappingPipelineConverter = PipelineConverter.specialize({

    constructor: {
        value: function () {
            this.super();
            //In super, keeping as reference / doc
            //this.addRangeAtPathChangeListener("converters", this, "_handleConvertersRangeChange");
        }
    },

    _handleConvertersRangeChange: {
        value: function (plus, minus, index) {
            var plusSet = new Set(plus),
                minusSet = new Set(minus),
                converter, i;

            for (i = 0; (converter = minus[i]); ++i) {
                if (!plusSet.has(converter)) {
                    converter.currentRule = null;
                }
            }

            for (i = 0; (converter = plus[i]); ++i) {
                if (!minusSet.has(converter)) {
                    converter.currentRule = converter.currentRule || this.currentRule;
                }
            }
        }
    },
    _currentRule: {
        value: undefined
    },

    currentRule: {
        get: function() {
            return this_currentRule;
        },
        set: function(value) {
            if(value !== this_currentRule) {
                for (let converters = this.converters, i = 0; (converters[i]); ++i) {
                    converters[i].currentRule = value;
                }
            }
        }
    }


});
