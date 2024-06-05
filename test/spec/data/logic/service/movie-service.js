var RawDataService = require("mod/data/service/raw-data-service").RawDataService,
    CategoryNames = ["Action"];

// exports.MovieService = RawDataService.specialize(/** @lends MovieService.prototype */ {
const MovieService = exports.MovieService = class MovieService extends RawDataService {/** @lends MovieService */
}

MovieService.addClassProperties({

    saveRawData: {
        value: function (record, object) {
            return Promise.resolve(record);
        }
    }

});
