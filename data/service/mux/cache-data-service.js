const SynchronizationDataService = require("./synchronization-data-service").SynchronizationDataService,
    Montage = require('mod/core/core').Montage,
    DataOperation = require("mod/data/service/data-operation").DataOperation;


/**
* CacheDataService 
*
* @class
* @extends SynchronizationDataService
*/
exports.CacheDataService = class CacheDataService extends SynchronizationDataService {/** @lends CacheDataService */

    constructor() {
        super();

        return this;
    }

    handleReadOperation(readOperation) {

       super.handleReadOperation(readOperation);
        
    }

}
