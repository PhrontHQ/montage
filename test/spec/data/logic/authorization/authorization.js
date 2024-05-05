var Authorization = require("mod/data/service/authorization").Authorization;

exports.Authorization = Authorization.specialize(/** @lends Authorization.prototype */ {

    didLogOut: {
        value: false
    },

    logOut: {
        value: function () {
            this.didLogOut = true;
        }
    }

});
