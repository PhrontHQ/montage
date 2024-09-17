const PriorityDataService = require("./priority-data-service").PriorityDataService,
    Montage = require('core/core').Montage,
    DataOperation = require("../data-operation").DataOperation;


/**
* FallbackDataService 
*
* @class
* @extends PriorityDataService
*/
exports.FallbackDataService = class FallbackDataService extends PriorityDataService {/** @lends FallbackDataService */

    constructor() {
        super();

        return this;
    }

    handleReadOperation(readOperation) {

       super.handleReadOperation(readOperation);
        
    }

}
