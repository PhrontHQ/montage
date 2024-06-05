var DataService = require("data/service/data-service").DataService;


/**
 *
 * @class
 * @extends RawDataService
 * @deprecated The Authorization API was moved to DataService itself.
 */
exports.AuthorizationService = class AuthorizationService extends DataService {/** @lends AuthorizationService */
    constructor() {
        super();
        console.warn("AuthorizationService is deprecated. The Authorization API was moved to DataService");
    }
}

// exports.AuthorizationService = DataService.specialize( /** @lends AuthorizationService.prototype */ {


//     constructor: {
//         value: function AuthorizationService() {
//             console.warn("AuthorizationService is deprecated. The Authorization API was moved to DataService");
//             DataService.call(this);
//         }
//     }

// });
