/* <copyright>
</copyright> */
var Montage = require("mod/core/core").Montage,
    Component = require("mod/core/object-controller").Component;
var ParentController = require("spec/meta/controller-object-descriptor-test/parent-controller").ParentController;

var  ChildController = exports.ChildController = ParentController.specialize( {

    purchaseList: {
        value: []
   }

});
