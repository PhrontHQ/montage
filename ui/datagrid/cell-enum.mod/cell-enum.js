var Component = require("ui/component").Component;

exports.DatagridRow = Component.specialize({

    constructor: {
        value: function DatagridRow() {}
    },

    index: {
        set: function (value) {
            this._element.style.top = value * 28 + "px";
        }
    }

});
