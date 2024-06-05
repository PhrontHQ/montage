var RawDataService = require("mod/data/service/raw-data-service").RawDataService,
    AuthorizationPolicy = require("mod/data/service/authorization-policy").AuthorizationPolicy;

// exports.OnFirstFetchService = RawDataService.specialize(/** @lends OnFirstFetchService.prototype */ {
const OnFirstFetchService = exports.OnFirstFetchService = class OnFirstFetchService extends RawDataService {/** @lends OnFirstFetchService */
}

OnFirstFetchService.addClassProperties({

    authorizationServices: {
        value: ["spec/data/logic/authorization/authorization-service"]
    },

    authorizationPolicy: {
        value: AuthorizationPolicy.ON_FIRST_FETCH
    },

    fetchRawData: {
        value: function (stream) {
            stream.dataDone();
        }
    }

});
