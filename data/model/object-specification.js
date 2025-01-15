var Montage = require("../../core/core").Montage;

/**
 * Defines the criteria that specify an object.
 *
 * @class ObjectSpecification
 * @extends external:Montage
 */
exports.ObjectSpecification = Montage.specialize(/** @lends ObjectSpecification.prototype */ {


    deserializeSelf: {
        value: function (deserializer) {
            var value;

            value = deserializer.getProperty("criteria");
            if (value !== void 0) {
                this.criteria = value;
            }

            value = deserializer.getProperty("type");
            if (value !== void 0) {
                this.type = value;
            }

            return this;
        }
    },

    serializeSelf: {
        value: function (serializer) {
            if(this.criteria) {
                serializer.setProperty("criteria", this.criteria);
            }

            if(this.type) {
                serializer.setProperty("type", this.type);
            }
        }
    },

    equals: {
        value: function (otherQuery) {
            /*
                take care of the ones where we can use === first

                not including selectBindings for now, nor selectExpression as we need to see if we'll keep it

            */
            if(
                (this.type === otherQuery.type) &&
                (this.criteria && this.criteria.equals(otherQuery.criteria))
            ) {
                return true;
            } else {
                return false;
            }
        }
    },

    /**
     * The type of the object specified.
     *
     * @type {ObjectDescriptor}
     */
    type: {
        serializable: "value",
        value: undefined
    },

    /**
     * A property used to give a meaningful name to an ObjectSpecification
     *
     * @type {string}
     */
    name: {
        value: undefined
    },


    /**
     * An object defining the criteria that must be satisfied by objects for
     * them to be included in the data set defined by this query.
     *
     * Initially this can be any object and will typically be a set of key-value
     * pairs, ultimately this will be a boolean expression to be applied to data
     * objects to determine whether they should be in the selected set or not.
     *
     * @type {Object}
     */
    criteria: {
        get: function () {
            //Might be breaking, but we shouldn't create an empty object lile that, of the wrong type...
            // if (!this._criteria) {
            //     this._criteria = {};
            // }
            return this._criteria;
        },
        set: function (criteria) {
            this._criteria = criteria;
        }
    },

    _criteria: {
        value: undefined
    }

}, /** @lends ObjectSpecification */ {

    /**
     * @todo Document.
     */
    withTypeAndCriteria: {
        value: function (type, criteria) {
            var objectSpecification;
            objectSpecification = new this();
            objectSpecification.type = type;
            objectSpecification.criteria = criteria;
            return objectSpecification;
        }
    }

});
