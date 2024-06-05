var RawDataService = require("mod/data/service/raw-data-service").RawDataService,
    CategoryNames = ["Action"];

// exports.CategoryService = RawDataService.specialize(/** @lends CategoryService.prototype */ {
const CategoryService = exports.CategoryService = class CategoryService extends RawDataService {/** @lends CategoryService */
}

CategoryService.addClassProperties({

    supportsDataOperation: {
        value: false
    },

    fetchRawData: {
        value: function (stream) {
            var categoryId = stream.query.criteria.parameters.categoryID || -1,
                isValidCategory = categoryId > 0 && CategoryNames.length >= categoryId,
                categoryName = isValidCategory && CategoryNames[categoryId - 1] || "Unknown";
            this.addRawData(stream, [{
                name: categoryName
            }]);
            this.rawDataDone(stream);
        }
    }

});
