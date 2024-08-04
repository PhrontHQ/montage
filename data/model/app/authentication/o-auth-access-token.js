/**
    @module mod/data/model/app/authorization/j-s-o-n-web-token
*/

var DataObject = require("../../data-object").DataObject;

/**
 * @class OAuthAccessToken
 * @extends DataObject
 *
 */

/*
    Reasources
    https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/overview/ad-fs-openid-connect-oauth-flows-scenarios

*/

exports.OAuthAccessToken = DataObject.specialize(/** @lends OAuthAccessToken.prototype */ {
    constructor: {
        value: function() {
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
