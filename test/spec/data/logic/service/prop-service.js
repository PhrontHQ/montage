var RawDataService = require("mod/data/service/raw-data-service").RawDataService,
    CategoryNames = ["Action"];

// exports.PropService = RawDataService.specialize(/** @lends PropService.prototype */ {
const PropService = exports.PropService = class PropService extends RawDataService {/** @lends PropService */
}

PropService.addClassProperties({

    _data: {
        value: [
            {name: "Falcon"},
            {name: "Lightsaber"}
        ]
    },

    fetchRawData: {
        value: function (stream) {
            console.log("PropService.fetchRawData");
            this.addRawData(stream, this._data);
            this.rawDataDone(stream);
        }
    }

});
