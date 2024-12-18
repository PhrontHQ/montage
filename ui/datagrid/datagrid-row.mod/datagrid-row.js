var Component = require("ui/component").Component;

exports.DatagridRow = Component.specialize({

    constructor: {
        value: function DatagridRow() {}
    },

    _blurInnerElements: {
        value: function () {
            const elements = [...this.element.getElementsByTagName("*")];
            elements.forEach(element => element.blur());
        }
    },

    index: {
        set: function (value) {
            this._element.style.top = value * this.rowHeight + "px";
            if (value % 2) {
                this.classList.add("odd");
            } else {
                this.classList.remove("odd");
            }
            this._blurInnerElements();
        }
    }

});
