const MuxDataService = require("./mux-data-service").MuxDataService,
    Montage = require('core/core').Montage,
    Promise = require("core/promise").Promise,
    DataOperation = require("../data-operation").DataOperation;


/**
* SynchronizationDataService 
*
* We're going to have 1 destinationDataService and n originDataServices
* In the case of a consolidation in one place, we're going to likely have all data coming from originDataServices
* persisred in the destinationDataService. But in the case of a cache, like in the browser, it can't be, so we'll need
* some merge / synchronization Criteria / Rules to fine tune this. For offline purpose, it might be desirable to expose these to the user for direct control vs 
* an arbitrary app-maker's decision, or at least adopt a learning approach. 
*
* @class
* @extends MuxDataService
*/
exports.SynchronizationDataService = class SynchronizationDataService extends MuxDataService {/** @lends SynchronizationDataService */

    static {

        Montage.defineProperties(this.prototype, {
            /**
             * Provides a reference to the parent application.
             *
             * @property {Application} value
             * @default null
             */
            _destinationDataService: { value: null},
            _originDataServices: { value: null},
            _readOperationsPendingSynchronization: { value: null},
            __childDataServiceReadCompletionOperationByReadOperation: { value: null},
        });
    }

    constructor() {
        super();

        return this;
    }

    get destinationDataService() {
        return this._destinationDataService;
    }
    set destinationDataService(value) {
        if(value !== this._destinationDataService) {

            // value.identifier = "destinationDataService";
            this.identifier = "SynchronizationDataService";
            this.addEventListener(DataOperation.Type.ReadUpdateOperation, this, true);
            this.addEventListener(DataOperation.Type.ReadFailedOperation, this, true);
            this.addEventListener(DataOperation.Type.ReadCompletedOperation, this, true);

            this._destinationDataService = value;
        }
    }

    serializeSelf(serializer) {

        super.serializeSelf(serializer);
        this._setPropertyWithDefaults(serializer, "destinationDataService", this.destinationDataService);
        this._setPropertyWithDefaults(serializer, "originDataServices", this.originDataServices);
    }


    deserializeSelf(deserializer) {

        super.deserializeSelf(deserializer);

        var value;

        value = deserializer.getProperty("destinationDataService");
        if (value) {
            this.destinationDataService = value;
        }

        value = deserializer.getProperty("originDataServices");
        if (value) {
            this.originDataServices = value;
        }
    }

    get readOperationsPendingSynchronization() {
        return this._readOperationsPendingSynchronization || (this._readOperationsPendingSynchronization = new Set());
    }

    tryToSynchronizeReadOperation(readOperation) {
        this.readOperationsPendingSynchronization.add(readOperation);
    }

    captureSynchronizationDataServiceReadUpdateOperation(readUpdateOperation) {
        console.log("captureSynchronizationDataServiceReadUpdateOperation: ", readUpdateOperation);
    }

    captureSynchronizationDataServiceReadCompletedOperation(readCompletedOperation) {
        console.log("captureSynchronizationDataServiceReadCompletedOperation: ", readCompletedOperation);

        //Record the read completion from that service:
        this.registerChildDataServiceReadCompletionOperation(readCompletedOperation);

        if(this.readOperationsPendingSynchronization.has(readCompletedOperation.referrer) && readCompletedOperation.data?.length) {
            /*
                A read from another data service failed to return data, and now we have another one did
                We got some work to Sync!

                To do so, we'll have to convert those data into objects created into the main service and do a saveChanges.
                IF the raw data service that provided the data could save, it would have to assess the save by looking at those objects
                and use the originId to compare with its snapshot and realize there's no change and it should be a no-op with existing implementation
            */
            let readExpressions = readCompletedOperation.referrer?.data?.readExpressions,
                rawData = readCompletedOperation.data,
                rawDataService = readCompletedOperation.rawDataService,
                mainService = this.mainService,
                objectDescriptor = readCompletedOperation.target,
                i=0, countI = rawData.length,
                mappingPromises,
                mappedObjects = [],
                iObject,
                mappingPromise,
                iMappingResult;

            for (; i <  countI; i++) {
                console.log("rawData["+i+"] == ", rawData[i]);

                //We create a brand new object
                iObject = mainService.createDataObject(objectDescriptor);
                mappedObjects.push(iObject);

                //We ask the fetching rawDataService to do the mapping
                iMappingResult = rawDataService.mapRawDataToObject(rawData[i], iObject, readCompletedOperation, readExpressions);
                if (Promise.is(iMappingResult)) {
                    (mappingPromises || (mappingPromises = [])).push(iMappingResult);
                }
            }

            mappingPromise = mappingPromises 
                ? Promise.all(mappingPromises)
                : Promise.resolve(mappedObjects);
            
            return mappingPromise.then((values) => {
                //Now that all is mapped, we're saving:
                return mainService.saveChanges();
            })
            .then(() => {
                //Clean-up:
                this.readOperationsPendingSynchronization.delete(readCompletedOperation.referrer);

                /*
                    Now that we have an found data from one of our childDataServices, and created new objects for the others to save it,
                    we're pretty much done. We either let the currently handled readCompletedOperation run its course to the client,
                    or, if the sync were have added some info enriching it by some custom "import" / "merger" logic, we might want to return 
                    those instead?
                */

            })
            .catch((error) => {
                console.log("SynchronizationDataService failed to sync objects ",mappedObjects," with error: ", error);
                return error;
            });


        } else if(readCompletedOperation.data == null || readCompletedOperation.data.length === 0 ) {
            console.debug("No Data Found. Do we check of the rawDataService is an originDataService?")
            /* 
                In this case, we may have the structure created, but it's empty as we couldn't find anything, which can happen
                if the creation was done by one client, while another attenpt to read. 

                Unless readCompletedOperation.rawDataService was the last to handle the readOperation, we flag it. 

                Otherwise, we're done. No data were found, anywhere, we let the readCompoletedOperation distribution run it's course
                to the client
            */
           if(!this.didAllChildServicesCompletedReadOperation(readCompletedOperation.referrer)) {
                this.tryToSynchronizeReadOperation(readCompletedOperation.referrer);

                //We don't want the client to know about this still intermediary result:
                readCompletedOperation.stopPropagation()
           }

        } else if(this.didAllChildServicesCompletedReadOperation(readCompletedOperation.referrer)) {
            /*
                No readOperationsPendingSynchronization pending, all childServices completed their read

                Cleanup time
            */
            this.unregisterReadOperation(readCompletedOperation.referrer);
        }
    }

    didAllChildServicesCompletedReadOperation(aReadOperation) {
        return  this.readCompletionOperationByChildDataServiceForReadOperation(aReadOperation).size === this.childServicesForType(aReadOperation.target).length
    }

    get _childDataServiceReadCompletionOperationByReadOperation() {
        return this.__childDataServiceReadCompletionOperationByReadOperation || (this.__childDataServiceReadCompletionOperationByReadOperation = new Map());
    }

    readCompletionOperationByChildDataServiceForReadOperation(aReadOperation) {
        let result;
        return this._childDataServiceReadCompletionOperationByReadOperation.get(aReadOperation) || (this._childDataServiceReadCompletionOperationByReadOperation.set(aReadOperation, (result = new Map())) && result);
    }

    registerChildDataServiceReadCompletionOperation(aReadCompletionOperation) {
        let readCompletionOperationByChildDataService = this.readCompletionOperationByChildDataServiceForReadOperation(aReadCompletionOperation.referrer);
        readCompletionOperationByChildDataService.set(aReadCompletionOperation.rawDataService, aReadCompletionOperation);
    }

    unregisterReadOperation(aReadOperation) {
        this._childDataServiceReadCompletionOperationByReadOperation.delete(aReadOperation);
    }

    captureSynchronizationDataServiceReadFailedOperation(readFailedOperation) {

    /*
        '2 UNKNOWN: Getting metadata from plugin failed with error: {"error":"invalid_grant","error_description":"reauth related error (invalid_rapt)","error_uri":"https://support.google.com/a/answer/9368756","error_subtype":"invalid_rapt"}'

        ->>>>> That's an auth problem
    */

    /*
        'relation "mod_plum_v1.Factory" does not exist'

        That can mean that either mod_plum_v1 - the DB doesn't exist, or Factory doesn't exist in mod_plum_v1. 
    */
        console.log("captureSynchronizationDataServiceReadFailedOperation: ", readFailedOperation);

        if((readFailedOperation.data.name === DataOperationErrorNames.DatabaseMissing) || 
        (readFailedOperation.data.name === DataOperationErrorNames.ObjectDescriptorStoreMissing) ) {
            //readFailedOperation.stopPropagation();
            return readFailedOperation.rawDataService.createObjectStoreForObjectDescriptor(readFailedOperation.target)
            .then((operation) => {
                /*
                    Now that we've successfully created the storage objectDescriptor, we need data. By resolving this promise
                    we're going to allow a child service, if we have one, handle the read and maybe return data.
                    
                    We need to implement captureSynchronizationDataServiceReadCompletedOperation and or captureSynchronizationDataServiceReadUpdateOperation
                    and remember there that there was this ReadFailedOperation and that we need to save this data in our destination data service.

                    To do so, we'll have to convert those data into objects created into the main service and do a saveChanges.
                    IF the raw data service that provided the data could save, it would have to assess the save by looking at those objects
                    and use the originId to compare with its snapshot and realize there's no change and it should be a no-op with existing implementation
                */
                this.tryToSynchronizeReadOperation(readFailedOperation.referrer);
            })
            .catch((error) => {
                console.error("error: ", error);
            });

        }
    }
    

}
