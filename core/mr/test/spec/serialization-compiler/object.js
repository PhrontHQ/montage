var Model = require('./model').Model;
var Montage = require("mod/core/core").Montage;

Model.getInfoForObject = Montage.getInfoForObject;
exports.model = new Model(10);
