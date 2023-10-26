
var Montage = require("../../core/core").Montage;

var RawDatabaseClientPool = exports.RawDatabaseClientPool = Montage.specialize({
    /***************************************************************************
     * Serialization
     */

    deserializeSelf: {
        value: function (deserializer) {
            this.super(deserializer);

            value = deserializer.getProperty("connectionDescriptor");
            if (value) {
                this.connectionDescriptor = value;
            }
            value = deserializer.getProperty("delegate");
            if (value) {
                this.delegate = value;
            }

        }
    },

    _rawClientPromises: {
        value: undefined
    },

    rawClientPromises: {
        get: function () {

            if (!this._rawClientPromises) {
                var promises = this._rawClientPromises = [];
            }
            return this._rawClientPromises;
        }
    },

    /**
     * Allows subclasses to have multiple specialized pools.
     * For example, AWS Aurora v2 exposes a read only endpoint and a read-write endpoint.
     * Using the pg library, it means actually creating 2 diffent pg.Pool for that.
     * But by Abstracting that into our own RawDatabaseClientPool that is passed the DataOperation to execute,
     * we're avoiding to have to subclass a RawDataService to choose between pools intead.
     * It isolates the connection details to the pool, that can be specific, and keeps the data service simpler.
     * In theory.
     *
     * @param {DatOperation} dataOperation. The data operation for which we need a clientPool to handle it.
     * @abstract    Needs to be overriden by subclasses
     *
     * @returns {Promise<RawDatabaseClient>}
     */

    connectForDataOperation: {
        value: function(dataOperation, callback) {
            throw "Implementation specific: needs to be overriden by subclasses";
        }
    },


    /*
     * The ConnectionDescriptor object where possible connections will be found
     *
     * @type {ConnectionDescriptor}
     */
    _connectionDescriptor: {
        value: undefined
    },
    connectionDescriptor: {
        get: function () {
            return this._connectionDescriptor;
        },
        set: function (value) {
            if (value !== this._connectionDescriptor) {
                this._connectionDescriptor = value;
            }
        }
    },

});
