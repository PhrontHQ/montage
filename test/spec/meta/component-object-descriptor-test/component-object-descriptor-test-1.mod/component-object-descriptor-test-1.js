/* <copyright>
</copyright> */
var Component = require("mod/ui/component").Component;

exports.ComponentObjectDescriptorTest1 = Component.specialize( {

    templateDidLoad: {
        value: function () {
            console.log("Component ObjectDescriptor Test 1 template did load");
        }
    },

    deserializedFromTemplate: {
        value: function () {
            console.log("Component ObjectDescriptor Test 1 deserialized from template");
        }
    }

});

