var DataService = require("mod/data/service/data-service").DataService,
    Authorization = require("spec/data/logic/authorization/authorization").Authorization,
    Promise = require("mod/core/promise").Promise;


const AuthorizationServiceWithPanel = exports.AuthorizationServiceWithPanel = class AuthorizationServiceWithPanel extends DataService {/** @lends DataService */
    constructor() {
        super();
    }
}

// exports.AuthorizationServiceWithPanel = DataService.specialize( /** @lends AuthorizationServiceWithPanel.prototype */ {
AuthorizationServiceWithPanel.addClassProperties({

    authorization: {
        get: function () {
            if (!this._authorization) {
                this._authorization = new Authorization();
            }
            return this._authorization;
        }
    },

    providesAuthorization: {
        value: true
    },

    didLogOut: {
        value: false
    },

    logOut: {
        value: function () {
            this.didLogOut = true;
        }
    },

    authorize: {
        value: function () {
            // return Promise.resolve(this.authorization);
            return null;
        }
    },


    authorizationPanel: {
        value: "spec/data/ui/authorization/authorization-panel.mod"
    }

});
