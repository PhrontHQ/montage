/**
 * @class EventProvider
 * @classdesc Base class that enables the additon to Montage of custom events that needs custom logic and cooperate with the EventManager during listener registration, event distribution and listener unregistration.
 * @extends Target
 */

var Montage = require("../core").Montage,
    defaultEventManager = require("./event-manager").defaultEventManager;


var EventProvider = exports.EventProvider = Montage.specialize(/** @lends Montage.prototype */{

    registerEventListener: {
        value: function EventProvider_proto_registerEventListener(target, type, listener, useCapture_options) {

        }
    },
    unregisterEventListener: {
        value: function EventProvider_proto_unregisterEventListener(target, type, listener, useCapture_options) {

        }
    }

});


