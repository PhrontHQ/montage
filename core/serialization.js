/**
 * @module mod/core/serialization
 * @deprecated
 */

var deprecate = require("core/deprecate");

deprecate.deprecationWarning("mod/core/serialization", "mod/core/serialization/serializer/montage-serializer");
deprecate.deprecationWarning("mod/core/serialization", "mod/core/serialization/deserializer/montage-deserializer");

var Serializer = require("./serialization/serializer/montage-serializer").MontageSerializer,
    serialize = require("./serialization/serializer/montage-serializer").serialize,
    Deserializer = require("./serialization/deserializer/montage-deserializer").MontageDeserializer,
    deserialize = require("./serialization/deserializer/montage-deserializer").deserialize;

exports.Serializer = Serializer;
exports.serialize = serialize;

exports.Deserializer = Deserializer;
exports.deserialize = deserialize;
