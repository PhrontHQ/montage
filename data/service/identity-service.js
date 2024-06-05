var RawDataService = require("./raw-data-service").RawDataService,
    IdentityManager = require("./identity-manager").IdentityManager;


/**
 *
 * @class
 * @extends RawDataService
 * @deprecated The Authorization API was moved to DataService itself.
 */
const IdentityService = exports.IdentityService = class IdentityService extends RawDataService {/** @lends IdentityService */
    constructor() {
        super();
        /*
            This is done in DataService's constructor as well,
            needs to decide where is best, but not do it twice.
        */
        //IdentityService.identityServices.push(this);

    }
}

// exports.IdentityService = IdentityService = RawDataService.specialize( /** @lends IdentityService.prototype */ {


//     constructor: {
//         value: function IdentityService() {
//             this.super();
//             /*
//                 This is done in DataService's constructor as well,
//                 needs to decide where is best, but not do it twice.
//             */
//             //IdentityService.identityServices.push(this);
//         }
//     },

IdentityService.addClassProperties({

    providesIdentity: {
        value: true
    }

}, {
    registerIdentityService: {
        value: function(aService) {
            IdentityManager.registerIdentityService(aService);
        }
    },

    identityServices: {
        value: IdentityManager.identityServices
    }
});
