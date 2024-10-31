const   Montage = require("../../core/core").Montage,
        Target = require("../../core/target").Target,
        DataService = require("../service/data-service").DataService,
        DataEvent = require("./data-event").DataEvent;

/**
 * @class DataObject
 * @extends Montage
 */


 /*
    Need to be able to set creationDate when an instance is created by
    the DataService. Not when the instance is created by the constructor.

    A proposal is to have a "datacreate" or "create" event whose target is
    the new instance. That is listened to by some code that does it.

    We could then later build a UI to do the same visually.
*/

exports.DataObject = class DataObject extends Target {

    static {

        Montage.defineProperties(this.prototype, {
            
            /**
             * The primaryKey from a different system a Data Object may have come from originally
             *
             * @property {Object}
             * @default null
             */
            originId: { value: undefined},

            /**
             * The description of what a data object is
             *
             * @property {String}
             * @default undefined
             */
            description: { value: undefined},

            /**
             * The time a data object was created
             *
             * @property {Date}
             * @default undefined
             */
            creationDate: { value: undefined},

            // /**
            //  * The identity of the user who created a data object.
            //  * WOULD BE BETTER HANDLED AS PART OD HAVING A LOG THAT RECORDS OVER TIME
            //  *
            //  * @property {Identity}
            //  * @default undefined
            //  */
            // creationIdentity: { value: undefined},


            /**
             * The last time a data object was modified
             * WOULD BE BETTER HANDLED AS PART OD HAVING A LOG THAT RECORDS OVER TIME
             *
             * @property {Date}
             * @default undefined
             */
            modificationDate: { value: undefined},

            // /**
            //  * The identity of the user who last modified a data object. This would be better as
            //  * WOULD BE BETTER HANDLED AS PART OD HAVING A LOG THAT RECORDS OVER TIME
            //  *
            //  * @property {Identity}
            //  * @default undefined
            //  */
            // modificationIdentity: { value: undefined},

            /**
             * The last time a data object was published, as in getting "live"
             * WOULD BE BETTER HANDLED AS PART OD HAVING A LOG THAT RECORDS OVER TIME
             *
             * @property {Date}
             * @default undefined
             */
            publicationDate: { value: undefined},

            // /**
            //  * The identity of the user who last published a data object, as in getting getting "live"
            //  * WOULD BE BETTER HANDLED AS PART OD HAVING A LOG THAT RECORDS OVER TIME
            //  *
            //  * @property {Date}
            //  * @default undefined
            //  */
            // publicationIdentity: { value: undefined}

            /**
             * states wether a data object is allowed to change. This has implication to prevent changes 
             * - Object.freeze() and not tracking changes, as well as fetching those first from previous 
             * fetch if they've been fetched already.
             *
             * @property {boolean}
             * @default true
             */
            isReadOnly: { value: false},

        });
    }

    deserializeSelf(deserializer) {
        if(super.deserializeSelf) {
            super.deserializeSelf(deserializer);
        }

        var value;
        value = deserializer.getProperty("originId");
        if (value !== void 0) {
            this.originId = value;
        }
        value = deserializer.getProperty("description");
        if (value !== void 0) {
            this.description = value;
        }
        value = deserializer.getProperty("creationDate");
        if (value !== void 0) {
            this.creationDate = value;
        }
        value = deserializer.getProperty("modificationDate");
        if (value !== void 0) {
            this.modificationDate = value;
        }
        value = deserializer.getProperty("publicationDate");
        if (value !== void 0) {
            this.publicationDate = value;
        }

    }

    serializeSelf(serializer) {
        if(this.originId) {
            serializer.setProperty("originId", this.originId);
        }
        if(this.description) {
            serializer.setProperty("description", this.description);
        }
        if(this.creationDate) {
            serializer.setProperty("creationDate", this.creationDate);
        }
        if(this.modificationDate) {
            serializer.setProperty("modificationDate", this.modificationDate);
        }
        if(this.publicationDate) {
            serializer.setProperty("publicationDate", this.publicationDate);
        }
    }

    /*
        This class methods are polymorphic, which poses a problem.
        Object needs to receive create events from Object instances and all instances inheriting from Object.

        So it needs to listen to dataService and filter, which is a bit wasteful
        or we could propagate the event with nextTarget to go through the propertyDescriptor hierarchy and then Object can listen only on it's Object Descriptor.

        BUT as these methds are inherited when declared in specializes, the handle methods are a problem.

    */

    /**
     * prepareToHandleDataEvents helps register lazily prepare DO's custom logic.
     * Each type listens to events issued by it's corresponding ObjectDescriptor
     * @param {DataEvent} event the first event triggering the prepareToHandleDataEvents
     */

    static prepareToHandleDataEvents (event) {
        event.dataService.objectDescriptorForType(this).addEventListener(DataEvent.create,this,false);
    }

    static handleCreate(event) {
        // if(event.dataObject instanceof this) {
            event.dataObject.creationDate = event.dataObject.modificationDate = new Date();
        // }
    }

    static handleUpdate(event) {
        event.dataObject.modificationDate = new Date();
    }

}
