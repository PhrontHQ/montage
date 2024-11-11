/**
    @module mod/data/model/model/object-store
*/

var DataObject = require("./data-object").DataObject,
    Montage = require("../../core/core").Montage;

/**
 * @class ObjectPropertyStore
 * @extends DataObject
 *
 * An ObjectPropertyStore models the representation of a place where an object's property described by an ObjectDescriptor's propertyDescriptor
 * can be persisted: think of a Table's column in SQL Database, an IDBObjectStore in WebStandard's IndexeDB's key (no fixed schema there though) or a MangoDB Collection's field
 */ 

exports.ObjectPropertyStore = class ObjectPropertyStore extends DataObject {

    static {

        Montage.defineProperties(this.prototype, {
            
            /**
             * The ObjectStore's name 
             *
             * @property {string}
             * @default null
             */
            name: { value: undefined}

        });
    }
}