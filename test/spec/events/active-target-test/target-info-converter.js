var Montage = require("mod/core/core").Montage;
var Converter = require('mod/core/converter/converter').Converter;

exports.TargetInfoConverter = Converter.specialize( {

    convert: {
        value: function (value) {
            return value && value._montage_metadata ? value._montage_metadata.objectName : null;
        }
    }

});
