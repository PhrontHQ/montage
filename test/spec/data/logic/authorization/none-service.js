var RawDataService = require("mod/data/service/raw-data-service").RawDataService,
    AuthorizationPolicy = require("mod/data/service/authorization-policy").AuthorizationPolicy;

const NoneService = exports.NoneService = class NoneService extends RawDataService {/** @lends DataService */
}

// exports.NoneService = RawDataService.specialize(/** @lends NoneService.prototype */ {
NoneService.addClassProperties({

    authorizationPolicy: {
        value: AuthorizationPolicy.NONE
    },

    fetchRawData: {
        value: function (stream) {
            stream.dataDone();
        }
    }

});
