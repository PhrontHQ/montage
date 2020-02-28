var DataService = require("data/service/data-service").DataService,
    compile = require("frb/compile-evaluator"),
    DataMapping = require("data/service/data-mapping").DataMapping,
    DataIdentifier = require("data/model/data-identifier").DataIdentifier,
    Deserializer = require("core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Map = require("collections/map"),
    Montage = require("montage").Montage,
    parse = require("frb/parse"),
    Scope = require("frb/scope"),
    WeakMap = require("collections/weak-map"),
    deprecate = require("core/deprecate"),
    parse = require("frb/parse"),
    Scope = require("frb/scope"),
    compile = require("frb/compile-evaluator"),
    Promise = require("../../core/promise").Promise;

/**
 * Provides data objects of certain types and manages changes to them based on
 * "raw" data obtained from or sent to one or more other services, typically
 * REST or other network services. Raw data services can therefore be considered
 * proxies for these REST or other services.
 *
 * Raw data services are usually the children of a
 * [data service]{@link DataService} that often is the application's
 * [main data service]{@link DataService.mainService}. All calls to raw data
 * services that have parent services must be routed through those parents.
 *
 * Raw data service subclasses that implement their own constructor should call
 * this class' constructor at the beginning of their constructor implementation
 * with code like the following:
 *
 *     RawDataService.call(this);
 *
 * @class
 * @extends DataService
 */
exports.RawDataService = DataService.specialize(/** @lends RawDataService.prototype */ {

    /***************************************************************************
     * Initializing
     */

    constructor: {
        value: function RawDataService() {
            DataService.call(this);
            this._typeIdentifierMap = new Map();
            this._descriptorToRawDataTypeMappings = new Map();
        }
    },

    /**
     * @deprecated
     */
    initWithModel: {
        value: function (model) {
            var self = this;
            return require.async(model).then(function (descriptor) {
                var deserializer = new Deserializer().init(JSON.stringify(descriptor), require);
                return deserializer.deserializeObject();
            }).then(function (model) {
                self.model = model;
                return self;
            });
        }
    },

    /***************************************************************************
     * Serialization
     */

    deserializeSelf: {
        value:function (deserializer) {
            this.super(deserializer);
            var value = deserializer.getProperty("rawDataTypeMappings");
            this._registerRawDataTypeMappings(value || []);

            value = deserializer.getProperty("connection");
            if (value) {
                this.connection = value;
            }

        }
    },

    /*
     * The ConnectionDescriptor object where possible connections will be found
     *
     * @type {ConnectionDescriptor}
     */
    connectionDescriptor: {
        value: undefined
    },

    /*
     * The current DataConnection object used to connect to data source
     *
     * @type {DataConnection}
     */
    connection: {
        value: undefined
    },

    /***************************************************************************
     * Data Object Properties
     */

    _propertyDescriptorForObjectAndName: {
        value: function (object, propertyName) {
            var objectDescriptor = this.objectDescriptorForObject(object);
            return objectDescriptor && objectDescriptor.propertyDescriptorForName(propertyName);
        }
    },

    //Benoit: 2/25/2020 Doesn't seem to be used anywhere.
    // _objectDescriptorForObject: {
    //     value: function (object) {
    //         var types = this.types,
    //             objectInfo = Montage.getInfoForObject(object),
    //             moduleId = objectInfo.moduleId,
    //             objectName = objectInfo.objectName,
    //             module, exportName, objectDescriptor, i, n;
    //         for (i = 0, n = types.length; i < n && !objectDescriptor; i += 1) {
    //             module = types[i].module;
    //             exportName = module && types[i].exportName;
    //             if (module && moduleId === module.id && objectName === exportName) {
    //                 objectDescriptor = types[i];
    //             }
    //         }
    //         return objectDescriptor;
    //     }
    // },

    _mapObjectPropertyValue: {
        value: function (object, propertyDescriptor, value) {
            var propertyName = propertyDescriptor.name;
            if (propertyDescriptor.cardinality === Infinity) {
                this.spliceWithArray(object[propertyName], value);
            } else {
                object[propertyName] = value[0];
            }

            if (propertyDescriptor.inversePropertyName && value && value[0]) {
                var inverseBlueprint = this._propertyDescriptorForObjectAndName(value[0], propertyDescriptor.inversePropertyName);
                if (inverseBlueprint && inverseBlueprint.cardinality === 1) {
                    value.forEach(function (inverseObject) {
                        inverseObject[propertyDescriptor.inversePropertyName] = object;
                    });
                }
            }
            return value;
        }
    },

    _objectDescriptorTypeForValueDescriptor: {
        value: function (valueDescriptor) {
            return valueDescriptor.then(function (objectDescriptor) {
                return objectDescriptor.module.require.async(objectDescriptor.module.id);
            });
        }
    },

    /***************************************************************************
     * Fetching Data
     */

    fetchRawData: {
        value: function (stream) {
            this.rawDataDone(stream);
        }
    },

    /**
     * Called through MainService when consumer has indicated that he has lost interest in the passed DataStream.
     * This will allow the RawDataService feeding the stream to take appropriate measures.
     *
     * @method
     * @argument {DataStream} [dataStream] - The DataStream to cancel
     * @argument {Object} [reason] - An object indicating the reason to cancel.
     *
     */
    cancelRawDataStream: {
        value: function (dataStream, reason) {
        }
    },
    /***************************************************************************
     * Saving Data
     */

    _isAsync: {
        value: function (object) {
            return object && object.then && typeof object.then === "function";
        }
    },


    /**
     * Subclasses should override this method to delete a data object when that
     * object's raw data wouldn't be useful to perform the deletion.
     *
     * The default implementation maps the data object to raw data and calls
     * [deleteRawData()]{@link RawDataService#deleteRawData} with the data
     * object passed in as the `context` argument of that method.
     *
     * @method
     * @argument {Object} object   - The object to delete.
     * @returns {external:Promise} - A promise fulfilled when the object has
     * been deleted. The promise's fulfillment value is not significant and will
     * usually be `null`.
     */
    deleteDataObject: {
        value: function (object) {
            var self = this,
                record = {},
                mapResult = this._mapObjectToRawData(object, record),
                result;

            if (this._isAsync(mapResult)) {
                result = mapResult.then(function () {
                    return self.deleteRawData(record, object);
                });
            } else {
                result = this.deleteRawData(record, object);
            }

            return result;
        }
    },

    /**
     * Subclasses should override this method to delete a data object when that
     * object's raw data would be useful to perform the deletion.
     *
     * @method
     * @argument {Object} record   - An object whose properties hold the raw
     *                               data of the object to delete.
     * @argument {?} context       - An arbitrary value sent by
     *                               [deleteDataObject()]{@link RawDataService#deleteDataObject}.
     *                               By default this is the object to delete.
     * @returns {external:Promise} - A promise fulfilled when the object's data
     * has been deleted. The promise's fulfillment value is not significant and
     * will usually be `null`.
     */
    deleteRawData: {
        value: function (record, context) {
            // Subclasses must override this.
            return this.nullPromise;
        }
    },

    /**
     *
     * Resets the object to its last known state.
     *
     * @method
     * @argument {Object} object   - The object to reset.
     * @returns {external:Promise} - A promise fulfilled when the object has
     * been reset to its last known state.
     *
     */
    resetDataObject: {
        value: function (object) {
            var snapshot = this.snapshotForObject(object),
                result = this._mapRawDataToObject(snapshot, object);
            return result || Promise.resolve(object);
        }
    },

    /**
     * Subclasses should override this method to save a data object when that
     * object's raw data would be useful to perform the save.
     *
     * @method
     * @argument {Object} record   - An object whose properties hold the raw
     *                               data of the object to save.
     * @argument {?} context       - An arbitrary value sent by
     *                               [saveDataObject()]{@link RawDataService#saveDataObject}.
     *                               By default this is the object to save.
     * @returns {external:Promise} - A promise fulfilled when the object's data
     * has been saved. The promise's fulfillment value is not significant and
     * will usually be `null`.
     */
    saveRawData: {
        value: function (record, context) {
            // Subclasses must override this.
            return this.nullPromise;
        }
    },

    /***************************************************************************
     * Offline
     */

    /*
     * Returns the [root service's offline status]{@link DataService#isOffline}.
     *
     * @type {boolean}
     */
    isOffline: {
        get: function () {
            return this === this.rootService ?
                    this.superForGet("isOffline")() :
                        this.rootService.isOffline;
        }
    },

    /**
     * Called with all the data passed to
     * [addRawData()]{@link RawDataService#addRawData} to allow storing of that
     * data for offline use.
     *
     * The default implementation does nothing. This is appropriate for
     * subclasses that do not support offline operation or which operate the
     * same way when offline as when online.
     *
     * Other subclasses may override this method to store data fetched when
     * online so [fetchData]{@link RawDataSource#fetchData} can use that data
     * when offline.
     *
     * @method
     * @argument {Object} records  - An array of objects whose properties' values
     *                               hold the raw data.
     * @argument {?DataQuery} selector
     *                             - Describes how the raw data was selected.
     * @argument {?} context       - The value that was passed in to the
     *                               [rawDataDone()]{@link RawDataService#rawDataDone}
     *                               call that invoked this method.
     * @returns {external:Promise} - A promise fulfilled when the raw data has
     * been saved. The promise's fulfillment value is not significant and will
     * usually be `null`.
     */
    writeOfflineData: {
        value: function (records, selector, context) {
            // Subclasses should override this to do something useful.
            return this.nullPromise;
        }
    },

    /***************************************************************************
     * Collecting Raw Data
     */

    /**
     * To be called by [fetchData()]{@link RawDataService#fetchData} or
     * [fetchRawData()]{@link RawDataService#fetchRawData} when raw data records
     * are received. This method should never be called outside of those
     * methods.
     *
     * This method creates and registers the data objects that
     * will represent the raw records with repeated calls to
     * [getDataObject()]{@link DataService#getDataObject}, maps
     * the raw data to those objects with repeated calls to
     * [mapRawDataToObject()]{@link RawDataService#mapRawDataToObject},
     * and then adds those objects to the specified stream.
     *
     * Subclasses should not override this method and instead override their
     * [getDataObject()]{@link DataService#getDataObject} method, their
     * [mapRawDataToObject()]{@link RawDataService#mapRawDataToObject} method,
     * their [mapping]{@link RawDataService#mapping}'s
     * [mapRawDataToObject()]{@link RawDataMapping#mapRawDataToObject} method,
     * or several of these.
     *
     * @method
     * @argument {DataStream} stream
     *                           - The stream to which the data objects created
     *                             from the raw data should be added.
     * @argument {Array} records - An array of objects whose properties'
     *                             values hold the raw data. This array
     *                             will be modified by this method.
     * @argument {?} context     - An arbitrary value that will be passed to
     *                             [getDataObject()]{@link RawDataService#getDataObject}
     *                             and
     *                             [mapRawDataToObject()]{@link RawDataService#mapRawDataToObject}
     *                             if it is provided.
     */
    addRawData: {
        value: function (stream, records, context) {
            var offline, i, n,
                streamSelectorType = stream.query.type,
                iRecord;
            // Record fetched raw data for offline use if appropriate.
            offline = records && !this.isOffline && this._streamRawData.get(stream);
            if (offline) {
                offline.push.apply(offline, records);
            } else if (records && !this.isOffline) {
                //Do we really need to make a shallow copy of the array for bookeeping?
                //this._streamRawData.set(stream, records.slice());
                this._streamRawData.set(stream, records);
            }
            // Convert the raw data to appropriate data objects. The conversion
            // will be done in place to avoid creating any unnecessary array.
            for (i = 0, n = records && records.length; i < n; i++) {
                /*jshint -W083*/
                // Turning off jshint's function within loop warning because the
                // only "outer scoped variable" we're accessing here is stream,
                // which is a constant reference and won't cause unexpected
                // behavior due to iteration.
                // if (streamSelectorType.name && streamSelectorType.name.toUpperCase().indexOf("BSP") !== -1) {
                //     console.debug("set a breakpoint here");
                // }
                this.addOneRawData(stream, records[i], context, streamSelectorType);
                /*jshint +W083*/
            }
        }
    },

    /**
     * Called by [addRawData()]{@link RawDataService#addRawData} to add an object
     * for the passed record to the stream. This method both takes care of doing
     * mapRawDataToObject and add the object to the stream.
     *
     * @method
     * @argument {DataStream} stream
     *                           - The stream to which the data objects created
     *                             from the raw data should be added.
     * @argument {Object} rawData - An anonymnous object whose properties'
     *                             values hold the raw data. This array
     *                             will be modified by this method.
     * @argument {?} context     - An arbitrary value that will be passed to
     *                             [getDataObject()]{@link RawDataService#getDataObject}
     *                             and
     *                             [mapRawDataToObject()]{@link RawDataService#mapRawDataToObject}
     *                             if it is provided.
     *
     * @returns {Promise<MappedObject>} - A promise resolving to the mapped object.
     *
     */

    addOneRawData: {
        value: function (stream, rawData, context) {
            var type = this._descriptorForParentAndRawData(stream.query.type, rawData),
                prefetchExpressions = stream.query.prefetchExpressions,
                dataIdentifier = this.dataIdentifierForTypeRawData(type,rawData),
                object,
                //object = this.rootService.objectForDataIdentifier(dataIdentifier),
                isUpdateToExistingObject = false,
                result;

                // if(!object) {
                object = this.objectForTypeRawData(type, rawData, context);
                // }
                // else {
                //     isUpdateToExistingObject = true;
                // }

                //If we're already have a snapshot, we've already fetched and
                //instanciated an object for that identifier previously.
                if(this.snapshotForDataIdentifier(dataIdentifier)) {
                    isUpdateToExistingObject = true;
                }

                //Recording snapshot even if we already had an object
                //Record snapshot before we may create an object
                this.recordSnapshot(dataIdentifier, rawData);


                result = this._mapRawDataToObject(rawData, object, context, prefetchExpressions);

            if (this._isAsync(result)) {
                result = result.then(function () {
                    stream.addData(object);
                    return object;
                });
            } else {
                stream.addData(object);
                result = Promise.resolve(object);
            }
            this._addMapDataPromiseForStream(result, stream);


            //TODO: #warning
            //This method should evolve to use resolveObjectForTypeRawData instead,
            //however resolveObjectForTypeRawData's promises resolves to object
            //only after it's been mapped, so this delegate call should only be called then
            //and not too early as it is now. Not sure if that may create a backward compatibility issue
            if (object) {
                this.callDelegateMethod("rawDataServiceDidAddOneRawData", this, stream, rawData, object);
            }
            return result;
        }
    },

    _addMapDataPromiseForStream: {
        value: function (promise, stream) {
            if (!this._streamMapDataPromises.has(stream)) {
                this._streamMapDataPromises.set(stream, [promise]);
            } else {
                this._streamMapDataPromises.get(stream).push(promise);
            }
        }
    },

    _streamMapDataPromises: {
        get: function () {
            if (!this.__streamMapDataPromises) {
                this.__streamMapDataPromises = new Map();
            }
            return this.__streamMapDataPromises;
        }
    },

    /**
     * Called by [addRawData()]{@link RawDataService#addRawData} to add an object
     * for the passed record to the stream. This method both takes care of doing
     * mapRawDataToObject and add the object to the stream.
     *
     * @method
     * @argument {ObjectDescriptor} type
     *                           - The type of the data object matching rawData.
     * @argument {Object} rawData - An anonymnous object whose properties'
     *                             values hold the raw data.
     * @argument {?} context     - An arbitrary value that will be passed to
     *                             [getDataObject()]{@link RawDataService#getDataObject}
     *                             and
     *                             [mapRawDataToObject()]{@link RawDataService#mapRawDataToObject}
     *                             if it is provided.
     *
     * @returns {Promise<MappedObject>} - A promise resolving to the mapped object.
     *
     */

    resolveObjectForTypeRawData: {
        value:function(type, rawData, context) {
            var dataIdentifier = this.dataIdentifierForTypeRawData(type,rawData),
                //Retrieves an existing object is responsible data service is uniquing, or creates one
                object, result;

            //Record snapshot before we may create an object
            this.recordSnapshot(dataIdentifier, rawData);

            //Retrieves an existing object is responsible data service is uniquing, or creates one
            object = this.getDataObject(type, rawData, context, dataIdentifier);

            result = this._mapRawDataToObject(rawData, object, context);

            if (Promise.is(result)) {
                return result.then(function () {
                    return object;
                });
            } else {
                return Promise.resolve(object);
            }
        }
    },


    objectForTypeRawData: {
        value:function(type, rawData, context) {
            // var dataIdentifier = this.dataIdentifierForTypeRawData(type,rawData);

            // return this.rootService.objectForDataIdentifier(dataIdentifier) ||
            //         this.getDataObject(type, rawData, context, dataIdentifier);


            var dataIdentifier = this.dataIdentifierForTypeRawData(type,rawData),
                object = this.rootService.objectForDataIdentifier(dataIdentifier);

            //Consolidation, recording snapshot even if we already had an object
            //Record snapshot before we may create an object
            //Benoit: commenting out, done twice when fetching now
            //this.recordSnapshot(dataIdentifier, rawData);

            if(!object) {
                //iDataIdentifier argument should be all we need later on
                return this.getDataObject(type, rawData, context, dataIdentifier);
            }
            return object;

        }
    },

    _typeIdentifierMap: {
        value: undefined
    },

    /**
     * Called by [DataService createDataObject()]{@link DataService#createDataObject} to allow
     * RawDataService to provide a primiary key on the client side as soon as an object is created.
     * Especially useful for uuid based primary keys that can be generated eithe client or server side.
     *
     * @method
     * @argument {DataStream} stream
     *                           - The stream to which the data objects created
     *                             from the raw data should be added.
     * @argument {Object} rawData - An anonymnous object whose properties'
     *                             values hold the raw data. This array
     *                             will be modified by this method.
     * @argument {?} context     - An arbitrary value that will be passed to
     *                             [getDataObject()]{@link RawDataService#getDataObject}
     *                             and
     *                             [mapRawDataToObject()]{@link RawDataService#mapRawDataToObject}
     *                             if it is provided.
     *
     * @returns {Promise<MappedObject>} - A promise resolving to the mapped object.
     *
     */

    primaryKeyForNewDataObject: {
        value: function (type) {
            return undefined;
        }
    },

    dataIdentifierForNewDataObject: {
        value: function (type) {
            var primaryKey = this.primaryKeyForNewDataObject(type);

            if(primaryKey) {
                return this.dataIdentifierForTypePrimaryKey(type,primaryKey);
            }
            return undefined;
        }
    },


    primaryKeyForTypeRawData: {
        value: function (type, rawData) {
            var mapping = this.mappingWithType(type),
                rawDataPrimaryKeys = mapping ? mapping.rawDataPrimaryKeyExpressions : null,
                scope = new Scope(rawData),
                rawDataPrimaryKeysValues,
                dataIdentifier, dataIdentifierMap, primaryKey;

            if(rawDataPrimaryKeys && rawDataPrimaryKeys.length) {

                for(var i=0, expression; (expression = rawDataPrimaryKeys[i]); i++) {
                    rawDataPrimaryKeysValues = rawDataPrimaryKeysValues || [];
                    rawDataPrimaryKeysValues[i] = expression(scope);
                }
                if(rawDataPrimaryKeysValues) {
                    primaryKey = rawDataPrimaryKeysValues.join("/");
                    // dataIdentifier = dataIdentifierMap.get(primaryKey);
                }

                return primaryKey;
            }
            return undefined;
        }
    },

    registerDataIdentifierForTypeRawData: {
        value: function (dataIdentifier, type, rawData) {
            var primaryKey = this.primaryKeyForTypeRawData(type, rawData);

            this.registerDataIdentifierForTypePrimaryKey(dataIdentifier, type, primaryKey);
        }
    },

    //This should belong on the
    //Gives us an indirection layer to deal with backward compatibility.
    dataIdentifierForTypeRawData: {
        value: function (type, rawData) {
            var primaryKey = this.primaryKeyForTypeRawData(type, rawData);

            if(primaryKey) {
                return this.dataIdentifierForTypePrimaryKey(type,primaryKey);
            }
            return undefined;
        }
    },

    /**
     * In most cases a RawDataService will register a dataIdentifier created during
     * the mapping process, but in some cases where an object created by the upper
     * layers fitst, this can be used direcly to reconcilate things.
     *
     * @method
     * @argument {DataIdentifier} dataIdentifier - The dataIdentifier representing the type's rawData.
     * @argument {ObjectDescriptor} type - the type of the raw data.
     * @argument {?} primaryKey     - An arbitrary value that that is the primary key
     *
     *
     *
     * @returns {Promise<MappedObject>} - A promise resolving to the mapped object.
     *
     */
    registerDataIdentifierForTypePrimaryKey: {
        value: function (dataIdentifier, type, primaryKey) {
            var dataIdentifierMap = this._typeIdentifierMap.get(type);

            if(!dataIdentifierMap) {
                this._typeIdentifierMap.set(type,(dataIdentifierMap = new Map()));
            }

            dataIdentifierMap.set(primaryKey,dataIdentifier);
        }
    },

    dataIdentifierForTypePrimaryKey: {
        value: function (type, primaryKey) {
            var dataIdentifierMap = this._typeIdentifierMap.get(type),
                dataIdentifier;

                dataIdentifier = dataIdentifierMap
                                    ? dataIdentifierMap.get(primaryKey)
                                    : null;

                if(!dataIdentifier) {
                    var typeName = type.typeName /*DataDescriptor*/ || type.name;
                        //This should be done by ObjectDescriptor/blueprint using primaryProperties
                        //and extract the corresponsing values from rawData
                        //For now we know here that MileZero objects have an "id" attribute.
                        dataIdentifier = new DataIdentifier();
                        dataIdentifier.objectDescriptor = type;
                        dataIdentifier.dataService = this;
                        dataIdentifier.typeName = type.name;
                        //dataIdentifier._identifier = dataIdentifier.primaryKey = primaryKey;
                        dataIdentifier.primaryKey = primaryKey;

                        // dataIdentifierMap.set(primaryKey,dataIdentifier);
                        this.registerDataIdentifierForTypePrimaryKey(dataIdentifier,type, primaryKey);
                }
                return dataIdentifier;
        }

    },

    __snapshot: {
        value: null
    },

    _snapshot: {
        get: function() {
            return this.__snapshot || (this.__snapshot = new Map());
        }
    },


    /**
     * Records the snapshot of the values of record known for a DataIdentifier
     *
     * @private
     * @argument  {DataIdentifier} dataIdentifier
     * @argument  {Object} rawData
     */
    recordSnapshot: {
        value: function (dataIdentifier, rawData) {
            var snapshot = this._snapshot.get(dataIdentifier);
            if(!snapshot) {
                this._snapshot.set(dataIdentifier, rawData);
            }
            else {
                var rawDataKeys = Object.keys(rawData),
                    i, countI;

                for(i=0, countI = rawDataKeys.length;(i<countI);i++) {
                    snapshot[rawDataKeys[i]] = rawData[rawDataKeys[i]];
                }
            }
        }
    },

    /**
     * Removes the snapshot of the values of record for the DataIdentifier argument
     *
     * @private
     * @argument {DataIdentifier} dataIdentifier
     */
   removeSnapshot: {
        value: function (dataIdentifier) {
            this._snapshot.delete(dataIdentifier);
        }
    },

    /**
     * Returns the snapshot associated with the DataIdentifier argument if available
     *
     * @private
     * @argument {DataIdentifier} dataIdentifier
     */
   snapshotForDataIdentifier: {
        value: function (dataIdentifier) {
            return this._snapshot.get(dataIdentifier);
       }
    },

    /**
     * Returns the snapshot associated with the DataIdentifier argument if available
     *
     * @private
     * @argument {DataIdentifier} dataIdentifier
     */
   snapshotForObject: {
        value: function (object) {
            return this.snapshotForDataIdentifier(this.dataIdentifierForObject(object));
        }
    },

    /**
     * To be called once for each [fetchData()]{@link RawDataService#fetchData}
     * or [fetchRawData()]{@link RawDataService#fetchRawData} call received to
     * indicate that all the raw data meant for the specified stream has been
     * added to that stream.
     *
     * Subclasses should not override this method.
     *
     * @method
     * @argument {DataStream} stream - The stream to which the data objects
     *                                 corresponding to the raw data have been
     *                                 added.
     * @argument {?} context         - An arbitrary value that will be passed to
     *                                 [writeOfflineData()]{@link RawDataService#writeOfflineData}
     *                                 if it is provided.
     */
    rawDataDone: {
        value: function (stream, context) {
            var self = this,
                dataToPersist = this._streamRawData.get(stream),
                mappingPromises = this._streamMapDataPromises.get(stream),
                dataReadyPromise = mappingPromises ? Promise.all(mappingPromises) : this.nullPromise;

            if (mappingPromises) {
                this._streamMapDataPromises.delete(stream);
            }

            if (dataToPersist) {
                this._streamRawData.delete(stream);
            }

            dataReadyPromise.then(function (results) {

                return dataToPersist ? self.writeOfflineData(dataToPersist, stream.query, context) : null;
            }).then(function () {
                stream.dataDone();
                return null;
            }).catch(function (e) {
                console.error(e,stream);
            });

        }
    },

    rawDataError: {
        value: function (stream, error) {
            var self = this,
                dataToPersist = this._streamRawData.get(stream),
                mappingPromises = this._streamMapDataPromises.get(stream),
                dataReadyPromise = mappingPromises ? Promise.all(mappingPromises) : this.nullPromise;

            if (mappingPromises) {
                this._streamMapDataPromises.delete(stream);
            }

            if (dataToPersist) {
                this._streamRawData.delete(stream);
            }

            dataReadyPromise.then(function (results) {

                //return dataToPersist ? self.writeOfflineData(dataToPersist, stream.query, context) : null;
            }).then(function () {
                stream.dataError(error);
                return null;
            }).catch(function (e) {
                console.error(e,stream);
            });

        }
    },


        /**
     * To be called once for each [fetchData()]{@link RawDataService#fetchData}
     * or [fetchRawData()]{@link RawDataService#fetchRawData} call received to
     * indicate that all the raw data meant for the specified stream has been
     * added to that stream.
     *
     * Subclasses should not override this method.
     *
     * @method
     * @argument {DataStream} stream - The stream to which the data objects
     *                                 corresponding to the raw data have been
     *                                 added.
     * @argument {?} context         - An arbitrary value that will be passed to
     *                                 [writeOfflineData()]{@link RawDataService#writeOfflineData}
     *                                 if it is provided.
     */
    rawDataBatchDone: {
        value: function (stream, context) {
            var self = this,
                dataToPersist = this._streamRawData.get(stream),
                mappingPromises = this._streamMapDataPromises.get(stream),
                dataReadyPromise = mappingPromises ? Promise.all(mappingPromises) : this.nullPromise;

            dataReadyPromise
            .then(function () {
                stream.dataBatchDone();
                return null;
            }).catch(function (e) {
                console.error(e,stream);
            });

        }
    },

    /**
     * Records in the process of being written to streams (after
     * [addRawData()]{@link RawDataService#addRawData} has been called and
     * before [rawDataDone()]{@link RawDataService#rawDataDone} is called for
     * any given stream). This is used to collect raw data that needs to be
     * stored for offline use.
     *
     * @private
     * @type {Object.<Stream, records>}
     */
    _streamRawData: {
        get: function () {
            if (!this.__streamRawData) {
                this.__streamRawData = new WeakMap();
            }
            return this.__streamRawData;
        }
    },

    __streamRawData: {
        value: undefined
    },

    /***************************************************************************
     * Mapping Raw Data
     */

    /**
     * Convert a selector for data objects to a selector for raw data.
     *
     * The selector returned by this method will be the selector used by methods
     * that deal with raw data, like
     * [fetchRawData()]{@link RawDataService#fetchRawData]},
     * [addRawData()]{@link RawDataService#addRawData]},
     * [rawDataDone()]{@link RawDataService#rawDataDone]}, and
     * [writeOfflineData()]{@link RawDataService#writeOfflineData]}. Any
     * [stream]{@link DataStream} available to these methods will have their
     * selector references temporarly replaced by references to the mapped
     * selector returned by this method.
     *
     * The default implementation of this method returns the passed in selector.
     *
     * @method
     * @argument {DataQuery} selector - A selector defining data objects to
     *                                     select.
     * @returns {DataQuery} - A selector defining raw data to select.
     */
    mapSelectorToRawDataQuery: {
        value: function (query) {
            return query;
        }
    },

    mapSelectorToRawDataSelector: {
        value: deprecate.deprecateMethod(void 0, function (selector) {
            return this.mapSelectorToRawDataQuery(selector);
        }, "mapSelectorToRawDataSelector", "mapSelectorToRawDataQuery"),
    },

    _defaultDataMapping : {
        value: new DataMapping
    },

    /**
     * Retrieve DataMapping for passed objectDescriptor.
     *
     * @method
     * @argument {Object} object - An object whose object descriptor has a DataMapping
     */
    mappingForObjectDescriptor: {
        value: function (objectDescriptor) {
            var mapping = objectDescriptor && this.mappingWithType(objectDescriptor);


            if (!mapping) {
                if(objectDescriptor) {
                    mapping = this._objectDescriptorMappings.get(objectDescriptor);
                    if (!mapping) {
                        mapping = DataMapping.withObjectDescriptor(objectDescriptor);
                        this._objectDescriptorMappings.set(objectDescriptor, mapping);
                    }
                }
                else {
                    mapping = this._defaultDataMapping;
                }
            }

            return mapping;
        }
    },

    /**
     * Retrieve DataMapping for this object.
     *
     * @method
     * @argument {Object} object - An object whose object descriptor has a DataMapping
     */
    mappingForObject: {
        value: function (object) {
            return this.mappingForObjectDescriptor(this.objectDescriptorForObject(object));
        }
    },

    /**
     * Convert raw data to data objects of an appropriate type.
     *
     * Subclasses should override this method to map properties of the raw data
     * to data objects:
     * @method
     * @argument {Object} rawData - An object whose properties' values hold
     *                             the raw data.
     * @argument {Object} object - An object whose properties must be set or
     *                             modified to represent the raw data.
     * @argument {?} context     - The value that was passed in to the
     *                             [addRawData()]{@link RawDataService#addRawData}
     *                             call that invoked this method.
     */


    mapRawDataToObject: {
        value: function (rawData, object, context) {
            return this.mapFromRawData(object, rawData, context);
        }
    },


    /**
     * Called by a mapping before doing it's mapping work, giving the data service.
     * an opportunity to intervene.
     *
     * Subclasses should override this method to influence how are properties of
     * the raw mapped data to data objects:
     *
     * @method
     * @argument {Object} mapping - A DataMapping object handing the mapping.
     * @argument {Object} rawData - An object whose properties' values hold
     *                             the raw data.
     * @argument {Object} object - An object whose properties must be set or
     *                             modified to represent the raw data.
     * @argument {?} context     - The value that was passed in to the
     *                             [addRawData()]{@link RawDataService#addRawData}
     *                             call that invoked this method.
     */
    willMapRawDataToObject: {
        value: function (mapping, rawData, object, context) {
            return rawData;
        }
    },

    /**
     * Called by a mapping before doing it's mapping work, giving the data service.
     * an opportunity to intervene.
     *
     * Subclasses should override this method to influence how are properties of
     * the raw mapped data to data objects:
     *
     * @method
     * @argument {Object} mapping - A DataMapping object handing the mapping.
     * @argument {Object} rawData - An object whose properties' values hold
     *                             the raw data.
     * @argument {Object} object - An object whose properties must be set or
     *                             modified to represent the raw data.
     * @argument {?} context     - The value that was passed in to the
     *                             [addRawData()]{@link RawDataService#addRawData}
     *                             call that invoked this method.
     */
    didMapRawDataToObject: {
        value: function (mapping, rawData, object, context) {
            return rawData;
        }
    },

    /**
     * Convert raw data to data objects of an appropriate type.
     *
     * Subclasses should override this method to map properties of the raw data
     * to data objects, as in the following:
     *
     *     mapRawDataToObject: {
     *         value: function (object, record) {
     *             object.firstName = record.GIVEN_NAME;
     *             object.lastName = record.FAMILY_NAME;
     *         }
     *     }
     *
     * Alternatively, subclasses can define a
     * [mapping]{@link DataService#mapping} to do this mapping.
     *
     * The default implementation of this method uses the service's mapping if
     * the service has one, and otherwise calls the deprecated
     * [mapFromRawData()]{@link RawDataService#mapFromRawData}, whose default
     * implementation does nothing.
     *
     * @todo Make this method overridable by type name with methods like
     * `mapRawDataToHazard()` and `mapRawDataToProduct()`.
     *
     * @method
     * @argument {Object} record - An object whose properties' values hold
     *                             the raw data.
     * @argument {Object} object - An object whose properties must be set or
     *                             modified to represent the raw data.
     * @argument {?} context     - The value that was passed in to the
     *                             [addRawData()]{@link RawDataService#addRawData}
     *                             call that invoked this method.
     */
    _mapRawDataToObject: {
        value: function (record, object, context, prefetchExpressions) {
            var self = this,
                mapping = this.mappingForObject(object),
                snapshot,
                result;

            if (mapping) {

                //Check if this isn't already being done, if it is, it's redundant and we bail
                snapshot = this.snapshotForObject(object);
                if(snapshot === record && this._objectsBeingMapped.has(object)) {
                    return result;
                }


                this._objectsBeingMapped.add(object);

                result = mapping.mapRawDataToObject(record, object, context, prefetchExpressions);
                if (result) {
                    result = result.then(function () {
                        result = self.mapRawDataToObject(record, object, context, prefetchExpressions);
                        if (!self._isAsync(result)) {
                            self._objectsBeingMapped.delete(object);

                            return result;
                        }
                        else {
                            result = result.then(function(resolved) {

                                self._objectsBeingMapped.delete(object);

                                return resolved;
                            }, function(failed) {

                                self._objectsBeingMapped.delete(object);

                            });
                            return result;
                        }

                    }, function(error) {
                        self._objectsBeingMapped.delete(object);
                        throw error;
                    });
                } else {
                    result = this.mapRawDataToObject(record, object, context, prefetchExpressions);
                    if (!this._isAsync(result)) {

                        self._objectsBeingMapped.delete(object);
                        return result;
                    }
                    else {
                        result = result.then(function(resolved) {

                            self._objectsBeingMapped.delete(object);

                            return resolved;
                        }, function(failed) {
                            self._objectsBeingMapped.delete(object);

                        });
                        return result;
                    }
                }
            } else {


                this._objectsBeingMapped.add(object);

                result = this.mapRawDataToObject(record, object, context, prefetchExpressions);

                if (!this._isAsync(result)) {

                    self._objectsBeingMapped.delete(object);

                    return result;
                }
                else {
                    result = result.then(function(resolved) {

                        self._objectsBeingMapped.delete(object);

                        return resolved;
                    }, function(failed) {
                        self._objectsBeingMapped.delete(object);
                    });
                    return result;
                }
            }

            return result;

        }
    },

    /**
     * Public method invoked by the framework during the conversion from
     * an object to a raw data.
     * Designed to be overriden by concrete RawDataServices to allow fine-graine control
     * when needed, beyond transformations offered by an ObjectDescriptorDataMapping or
     * an ExpressionDataMapping
     *
     * @method
     * @argument {Object} object - An object whose properties must be set or
     *                             modified to represent the raw data.
     * @argument {Object} record - An object whose properties' values hold
     *                             the raw data.
     * @argument {?} context     - The value that was passed in to the
     *                             [addRawData()]{@link RawDataService#addRawData}
     *                             call that invoked this method.
     */
    mapObjectToRawData: {
        value: function (object, record, context) {
            // this.mapToRawData(object, record, context);
        }
    },

    /**
     * Called by a mapping before doing it's mapping work, giving the data service.
     * an opportunity to intervene.
     *
     * Subclasses should override this method to influence how properties of
     * data objects are mapped back to raw data:
     *
     * @method
     * @argument {Object} mapping - A DataMapping object handing the mapping.
     * @argument {Object} rawData - An object whose properties' values hold
     *                             the raw data.
     * @argument {Object} object - An object whose properties must be set or
     *                             modified to represent the raw data.
     * @argument {?} context     - The value that was passed in to the
     *                             [addRawData()]{@link RawDataService#addRawData}
     *                             call that invoked this method.
     */
    willMapObjectToRawData: {
        value: function (mapping, object, rawData, context) {
            return rawData;
        }
    },
    /**
     * Called by a mapping after doing it's mapping work.
     *
     * Subclasses should override this method as needed:
     *
     * @method
     * @argument {Object} mapping - A DataMapping object handing the mapping.
     * @argument {Object} rawData - An object whose properties' values hold
     *                             the raw data.
     * @argument {Object} object - An object whose properties must be set or
     *                             modified to represent the raw data.
     * @argument {?} context     - The value that was passed in to the
     *                             [addRawData()]{@link RawDataService#addRawData}
     *                             call that invoked this method.
     */
    didMapObjectToRawData: {
        value: function (mapping, object, rawData, context) {
            return rawData;
        }
    },


    /**
     * Public method invoked by the framework during the conversion from
     * an object to a raw data.
     * Designed to be overriden by concrete RawDataServices to allow fine-graine control
     * when needed, beyond transformations offered by an ObjectDescriptorDataMapping or
     * an ExpressionDataMapping
     *
     * @method
     * @argument {Object} object - An object whose properties must be set or
     *                             modified to represent the raw data.
     * @argument {String} propertyName - The name of a property whose values
     *                                      should be converted to raw data.
     * @argument {Object} data - An object whose properties' values hold
     *                             the raw data.
     */

    mapObjectPropertyToRawData: {
        value: function (object, propertyName, data) {
        }
    },

        /**
     * @todo Document.
     * @todo Make this method overridable by type name with methods like
     * `mapHazardToRawData()` and `mapProductToRawData()`.
     *
     * @method
     */
    _mapObjectPropertyToRawData: {
        value: function (object, propertyName, record, context) {
            var mapping = this.mappingForObject(object),
                result;

            if (mapping) {
                result = mapping.mapObjectPropertyToRawData(object, propertyName, record, context);
            }

            if (record) {
                if (result) {
                    var otherResult = this.mapObjectPropertyToRawData(object, propertyName, record, context);
                    if (this._isAsync(result) && this._isAsync(otherResult)) {
                        result = Promise.all([result, otherResult]);
                    } else if (this._isAsync(otherResult)) {
                        result = otherResult;
                    }
                } else {
                    result = this.mapObjectPropertyToRawData(object, propertyName, record, context);
                }
            }

            return result;
        }
    },
    /**
     * Method called by mappings when a mapObjectToRawDataProperty is complete.
     *
     * @method
     * @argument {Object} mapping        - the mapping object
     * @argument {Object} object         - An object whose properties' values
     *                                     hold the model data.
     * @argument {Object} data           - The object on which to assign the property
     * @argument {string} propertyName   - The name of the raw property to which
     *                                     to assign the values.
     */
    mappingDidMapObjectToRawDataProperty: {
        value: function (mapping, object, data, propertyName) {

        }
    },
    /**
     * @todo Document.
     * @todo Make this method overridable by type name with methods like
     * `mapHazardToRawData()` and `mapProductToRawData()`.
     * @todo: context should be last, but that's a breaking change
     * @todo: It would be much more efficient to drive the iteration from here
     * instead of doing it once with the mapping and then offering the data service to loop again on the mapping's results.
     *
     *
     * @method
     */
    _mapObjectToRawData: {
        value: function (object, record, context, keyIterator) {
            var mapping = this.mappingForObject(object),
                result;

            if (mapping) {
                //Benoit: third argument was context but it's not defined on
                //ExpressionDataMapping's mapObjectToRawData method
                result = mapping.mapObjectToRawData(object, record, keyIterator);
            }

            if (record) {
                if (result) {
                    var otherResult = this.mapObjectToRawData(object, record, context, keyIterator);
                    if (this._isAsync(result) && this._isAsync(otherResult)) {
                        result = Promise.all([result, otherResult]);
                    } else if (this._isAsync(otherResult)) {
                        result = otherResult;
                    }
                } else {
                    result = this.mapObjectToRawData(object, record, context, keyIterator);
                }
            }

            return result;
        }
    },

    // /**
    //  * If defined, used by
    //  * [mapRawDataToObject()]{@link RawDataService#mapRawDataToObject} and
    //  * [mapObjectToRawData()]{@link RawDataService#mapObjectToRawData} to map
    //  * between the raw data on which this service is based and the typed data
    //  * objects which this service provides and manages.
    //  *
    //  * @type {?DataMapping}
    //  */
    // mapping: {
    //     value: undefined
    // },

    _mappingsPromise: {
        get: function () {
            if (!this.__mappingsPromise) {
                this.__mappingsPromise = Promise.all(this.mappings.map(function (mapping) {
                    return mapping.objectDescriptor;
                })).then(function (values) {

                });
            }
            return this.__mappingsPromise;
        }
    },

    _objectDescriptorMappings: {
        get: function () {
            if (!this.__objectDescriptorMappings) {
                this.__objectDescriptorMappings = new Map();
            }
            return this.__objectDescriptorMappings;
        }
    },

    /**
     * Map from a parent class to the mappings used by the service to
     * determine what subclass to create an instance of for a particular
     * rawData object
     *
     * For example, say a class 'Person' has 2 subclasses 'Employee' & 'Customer'.
     * RawDataService would evaluate each person rawData object against each item
     * in _rawDataTypeMappings and determine if that rawData should be an instance
     * of 'Employee' or 'Customer'.
     * @type {Map<ObjectDescpriptor:RawDataTypeMapping>}
     */

    _descriptorToRawDataTypeMappings: {
        value: undefined
    },

    /**
     * Adds each mapping passed in to _descriptorToRawDataTypeMappings
     *
     * @method
     * @param {Array<RawDataTypeMapping>} mappings
     */
    _registerRawDataTypeMappings: {
        value: function (mappings) {
            var mapping, parentType,
                i, n;

            for (i = 0, n = mappings ? mappings.length : 0; i < n; i++) {
                mapping = mappings[i];
                parentType = mapping.type.parent;
                if (!this._descriptorToRawDataTypeMappings.has(parentType)) {
                    this._descriptorToRawDataTypeMappings.set(parentType, []);
                }
                this._descriptorToRawDataTypeMappings.get(parentType).push(mapping);
            }
        }
    },

    /**
     * Evaluates a rawData object against the RawDataTypeMappings for the fetched
     * class and returns the subclass for the first mapping that evaluates to true.
     *
     * @method
     * @param {ObjectDescriptor} parent Fetched class for which to look for subclasses
     * @param {Object} rawData rawData to evaluate against the RawDataTypeMappings
     * @return {ObjectDescriptor}
     */
    _descriptorForParentAndRawData: {
        value: function (parent, rawData) {
            var mappings = this._descriptorToRawDataTypeMappings.get(parent),
                compiled, mapping, subType,
                i, n;

            if (mappings && mappings.length) {
                for (i = 0, n = mappings.length; i < n && !subType; ++i) {
                    mapping = mappings[i];
                    subType = mapping.criteria.evaluate(rawData) && mapping.type;
                }
            }

            return subType ? this._descriptorForParentAndRawData(subType, rawData) : parent;
        }
    },

    /***************************************************************************
     * Deprecated
     */

    /**
     * @todo Document deprecation in favor of
     * [mapRawDataToObject()]{@link RawDataService#mapRawDataToObject}
     *
     * @deprecated
     * @method
     */
    mapFromRawData: {
        value: function (object, record, context) {
            // Implemented by subclasses.
        }
    },

    /**
     * @todo Document deprecation in favor of
     * [mapObjectToRawData()]{@link RawDataService#mapObjectToRawData}
     *
     * @deprecated
     * @method
     */
    mapToRawData: {
        value: function (object, record) {
            // Implemented by subclasses.
        }
    },

    /**
     * @todo Remove any dependency and delete.
     *
     * @deprecated
     * @type {OfflineService}
     */
    offlineService: {
        value: undefined
    }

});
