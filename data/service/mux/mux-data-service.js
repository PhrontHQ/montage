const RawDataService = require("../raw-data-service").RawDataService,
    //SyntaxInOrderIterator = (require)("mod/core/frb/syntax-iterator").SyntaxInOrderIterator,
    Montage = require('mod/core/core').Montage,
    DataOperation = require("mod/data/service/data-operation").DataOperation,
    secretObjectDescriptor = require("mod/data/model/app/secret.mjson").montageObject;


/**
* MuxDataService is the super class of RawDataServices that specialize in coordinating multiple child services such as:
*   - a FIFODataService
*   - a SynchronizationDataService
*   - a CacheDataService
*   - a ShardDataService
*   - a PriorityDataService
*   - a FallbackDataService
*
* @class
* @extends RawDataService
*/
exports.MuxDataService = class MuxDataService extends RawDataService {/** @lends MuxDataService */

    constructor() {
        super();

        return this;
    }

    handleReadOperation(readOperation) {

       super.handleReadOperation(readOperation);
        
    }

}
