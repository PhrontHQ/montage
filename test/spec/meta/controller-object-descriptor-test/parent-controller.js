/* <copyright>
</copyright> */
var Montage = require("mod/core/core").Montage,
    ObjectController = require("mod/core/object-controller").ObjectController;

var  ParentController = exports.ParentController = ObjectController.specialize( {


    init: {
      value: function () {
          return this;
      }
    },

    customerList: {
        value: []
   },

    customerSelectionList: {
        value: {}
    }

});
