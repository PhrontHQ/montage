/**
    @module business-data.mod/data/main.mod/model/app/app-client
*/

var DataObject = require("../data-object").DataObject;

/**
 * @class JSONWebToken
 * @extends DataObject
 *
 */

exports.JSONWebToken = DataObject.specialize(/** @lends Application.prototype */ {
    constructor: {
        value: function JSONWebToken() {
            this.super();
            return this;
        }
    },
    header: {
        value: undefined
    },
    claims: {
        value: undefined
    }
});
