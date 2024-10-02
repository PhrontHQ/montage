/**
    @module mod/data/model/model/object-store
*/

var DataObject = require("./data-object").DataObject,
    Montage = require("../../core/core").Montage;

/**
 * @class ObjectStore
 * @extends DataObject
 *
 * An ObjectStore models the representation of a place where object instances described by an ObjectDescriptor
 * can be persisted: think of a Table in SQL Database, an IDBObjectStore in WebStandard's IndexeDB or a MangoDB Collection
 */ 

exports.ObjectStore = class ObjectStore extends DataObject {

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