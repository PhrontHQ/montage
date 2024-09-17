const SynchronizationDataService = require("./synchronization-data-service").SynchronizationDataService,
    Montage = require('core/core').Montage,
    DataOperation = require("../data-operation").DataOperation;


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
