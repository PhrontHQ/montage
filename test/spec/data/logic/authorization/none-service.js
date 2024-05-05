var RawDataService = require("mod/data/service/raw-data-service").RawDataService,
    AuthorizationPolicy = require("mod/data/service/authorization-policy").AuthorizationPolicy;

exports.NoneService = RawDataService.specialize(/** @lends NoneService.prototype */ {

    authorizationPolicy: {
        value: AuthorizationPolicy.NONE
    },

    fetchRawData: {
        value: function (stream) {
            stream.dataDone();
        }
    }

});
