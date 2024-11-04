var DataObject = require("mod/data/model/data-object").DataObject;

/**
 * @class PhysicalQuantity
 * @extends DataObject
 * 
 * https://en.m.wikipedia.org/wiki/Physical_quantity
 */

exports.PhysicalQuantity = DataObject.specialize(/** @lends PhysicalQuantity.prototype */ {
    constructor: {
        value: function Asset() {
            this.super();
            return this;
        }
    },
    value: {
        value: undefined
    },
    unit: {
        value: undefined
    },
    dimension: {
        value: undefined
    }
});
