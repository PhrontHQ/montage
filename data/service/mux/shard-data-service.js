const MuxDataService = require("./mux-data-service").MuxDataService,
    Montage = require('core/core').Montage,
    DataOperation = require("../data-operation").DataOperation;


/**
* ShardDataService 
*
* @class
* @extends MuxDataService
*/
exports.ShardDataService = class ShardDataService extends MuxDataService {/** @lends ShardDataService */

    constructor() {
        super();

        return this;
    }

    handleReadOperation(readOperation) {

       super.handleReadOperation(readOperation);
        
    }

}
