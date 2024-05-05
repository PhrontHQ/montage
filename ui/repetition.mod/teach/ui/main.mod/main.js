var Component = require("mod/ui/component").Component,
    Promise = require('mod/core/promise').Promise;

exports.Main = Component.specialize(/** @lends Main# */{

    enterDocument: {
        value: function () {
            this.content = [];

            for (var i = 0; i < 10; i++) {
                this.content.push('item ' + (i + 1));
            }
        }
    }

});
