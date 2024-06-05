var Montage = require("../../core").Montage;

/**
 * @class LogEntry
 * @extends Montage
 */



exports.LogEntry = Montage.specialize(/** @lends Product.prototype */ {

    time: {
        value: undefined
    },
    value: {
        value: undefined
    }
});
