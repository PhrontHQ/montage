var DataObject = require("mod/data/model/data-object").DataObject;

/**
 * @class Unit
 * @extends DataObject
 */

/*
    https://github.com/df7cb/postgresql-unit


    TODO: Consider how we add mathemathical operations between physical quantities
    TODO: How do we implement conversions between units
*/

exports.Unit = DataObject.specialize(/** @lends Unit.prototype */ {
    constructor: {
        value: function Asset() {
            this.super();
            return this;
        }
    },
    name: {
        value: undefined
    },
    dimension: {
        value: undefined
    }
});
