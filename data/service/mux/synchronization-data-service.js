const MuxDataService = require("./mux-data-service").MuxDataService,
    Montage = require('mod/core/core').Montage,
    DataOperation = require("mod/data/service/data-operation").DataOperation;


/**
* SynchronizationDataService 
*
* @class
* @extends MuxDataService
*/
exports.SynchronizationDataService = class SynchronizationDataService extends MuxDataService {/** @lends SynchronizationDataService */

    constructor() {
        super();

        return this;
    }

    handleReadOperation(readOperation) {

       super.handleReadOperation(readOperation);
        
    }

}
