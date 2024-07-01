var ExpressionDataMapping = require("./expression-data-mapping").ExpressionDataMapping,
    defaultEventManager = require("./event/event-manager").defaultEventManager,
    MutableEvent = require("./event/mutable-event").MutableEvent;

/**
 * Extends ExpressionDataMapping to add the ability to map a DataOperatin to an HTTP Request
 * 
 *      https://developer.mozilla.org/en-US/docs/Web/API/Request
 * 
 * inclusing Headers
 * 
 *      https://developer.mozilla.org/en-US/docs/Web/API/Headers
 * 
 * As well as map the HTTP Response 
 * 
 *      https://developer.mozilla.org/en-US/docs/Web/API/Response
 * 
 * to the array that will be used by the Raw Data Service as rawData in object mapping
 * 
 * @class FetchResourceDataMapping
 * @extends ExpressionDataMapping
 */
exports.FetchResourceDataMapping = class FetchResourceDataMapping extends ExpressionDataMapping {

    static {

        Montage.defineProperties(this.prototype, {

            /**
             * Provides a reference to the Montage event manager used in the
             * application.
             *
             * @property {EventManager} value
             * @default defaultEventManager
             */
            fetchRequestMappingByCriteria: {value: undefined, serializable: true},

            /**
             * Whether or not this target can accept user focus and become the
             * activeTarget This matches up with the `document.activeElement` property
             * purpose-wise; Events from components that should be dispatched as
             * logically occurring at the point of user focus should be dispatched at
             * the activeTarget
             *
             * By default a target does not accept this responsibility.
             *
             * @type {boolean}
             * @default false
             */
            fetchResponseMapping: {value: undefined, serializable: true}

        });

    }

    /*
        "fetchRequestMappingByCriteria": {"@":"fetchRequestMappingByCriteria"},
        "fetchResponseMapping": {
    */

    deserializeSelf(deserializer) {

        super.deserializeSelf(deserializer);

        this.fetchRequestMappingByCriteria = deserializer.getProperty("fetchRequestMappingByCriteria");
        this.fetchResponseMapping = deserializer.getProperty("fetchResponseMapping");

    }




    /**
     * Returns fetchRequestDescriptor conforming to the options object of a Request constructot .
     * used in the Fetch API - 
     * TODO: overrides to false as we should have that done by SQL
     * when correct mapping from orderings to ORDER BY clause is done
     *
     * @public
     * @argument {DataStream} dataStream
     */
    mapDataOperationToFetchRequest(dataOperation, fetchRequestDescriptor) {

        let fetchRequest = new Request(this.mapDataOperationToFetchRequestURL(dataOperation));

        this.mapDataOperationToFetchRequestMethod(dataOperation, fetchRequest);
        this.mapDataOperationToFetchRequestMethod(dataOperation, fetchRequest);

    }

    /**
     * Returns fetchRequestDescriptor conforming to the options object of a Request constructot .
     * used in the Fetch API - 
     * TODO: overrides to false as we should have that done by SQL
     * when correct mapping from orderings to ORDER BY clause is done
     *
     * @public
     * @argument {Response} fetchResponse
     * @argument {Array} rawData
     */
    mapFetchResponseToRawData(fetchResponse, rawData) {

        let fetchRequest = new Request(this.mapDataOperationToFetchRequestURL(dataOperation));

        this.mapDataOperationToFetchRequestMethod(dataOperation, fetchRequest);
        this.mapDataOperationToFetchRequestMethod(dataOperation, fetchRequest);

    }

}