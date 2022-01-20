var Component = require("../../../../../ui/component").Component;

exports.Employee = Component.specialize(/** @lends Employee# */{

    _data: {
        value: undefined
    },
    data: {
        get: function() {
            return this._data;
        },
        set: function(value) {
            this._data = value;
        }
    }

});
