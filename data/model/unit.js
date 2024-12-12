var DataObject = require("./data-object").DataObject;

/**
 * @class Unit
 * @extends DataObject
 */

/*
    https://github.com/df7cb/postgresql-unit

    https://phys.libretexts.org/Bookshelves/University_Physics/Book%3A_Introductory_Physics_-_Building_Models_to_Describe_Our_World_(Martin_Neary_Rinaldo_and_Woodman)/02%3A_Comparing_Model_and_Experiment/2.02%3A_Units_and_dimensions
    https://www.me.psu.edu/cimbala/Learning/General/units.htm
    
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
