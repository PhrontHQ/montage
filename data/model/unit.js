var DataObject = require("mod/data/model/data-object").DataObject;

/**
 * @class Unit
 * @extends DataObject
 */

/*
    https://github.com/df7cb/postgresql-unit
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
