var Montage = require("../../core/core").Montage;

/**
 * AuthorizationPolicyType
 *
 * UpfrontAuthorizationPolicy
 *     Authorization is asked upfront, immediately after data service is
 *     created / launch of an app.
 *
 * OnDemandAuthorizationPolicy
 *     Authorization is required when a request fails because of lack of
 *     authorization. This is likely to be a good strategy for DataServices
 *     that offer data to both anonymous and authorized users.
 *
 */
var AuthenticationPolicy = exports.AuthenticationPolicy = Montage.specialize({

    id: {
        value: undefined
    }

}, {
    withID: {
        value: function (id) {
            var policy = new this();
            policy.id = id;
            return policy;
        }
    }
});
AuthenticationPolicy.ON_DEMAND = AuthenticationPolicy.withID("ON_DEMAND");
AuthenticationPolicy.ON_FIRST_FETCH = AuthenticationPolicy.withID("ON_FIRST_FETCH");
AuthenticationPolicy.NONE = AuthenticationPolicy.withID("NONE");
AuthenticationPolicy.UP_FRONT = AuthenticationPolicy.withID("UP_FRONT");
