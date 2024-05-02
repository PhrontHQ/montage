require("../../deprecate").deprecationWarning("mod/core/serialization/serializer/properties-serializer", "mod/core/serialization/serializer/values-serializer");

exports.PropertiesSerializer = require("./values-serializer").ValuesSerializer;
