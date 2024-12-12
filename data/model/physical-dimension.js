var DataObject = require("./data-object").DataObject;

/**
 * @class PhysicalDimension
 * @extends DataObject
 */

/** 
 * https://phys.libretexts.org/Bookshelves/University_Physics/Book%3A_Introductory_Physics_-_Building_Models_to_Describe_Our_World_(Martin_Neary_Rinaldo_and_Woodman)/02%3A_Comparing_Model_and_Experiment/2.02%3A_Units_and_dimensions
 * https://www.me.psu.edu/cimbala/Learning/General/units.htm
 * 
*/

exports.PhysicalDimension = DataObject.specialize(/** @lends PhysicalDimension.prototype */ {
    constructor: {
        value: function PhysicalDimension() {
            this.super();
            return this;
        }
    },
    name: {
        value: undefined
    },
    units: {
        value: undefined
    }
});
