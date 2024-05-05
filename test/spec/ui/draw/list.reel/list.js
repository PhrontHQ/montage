/**
	@module "matte/ui/list.mod"
    @requires mod/core/core
    @requires mod/ui/component
*/
var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component,
    observeProperty = require("mod/core/frb/observers").observeProperty;

/**
 @class module:"matte/ui/list.mod".List
 @extends module:mod/ui/component.Component
 */
var List = exports.List = Component.specialize(/** @lends module:"matte/ui/list.mod".List# */ {
    /**
      Description TODO
      @private
    */
    _repetition: {
        value: null
    },
    /**
        Description TODO
        @type {Property}
        @default null
    */
    delegate: {
        value: null
    },

    _content: {value: null},
    content: {
        set: function (value) {
            this._content = value;
            this.defineBinding("_repetition.content", {
                "<-": "_content"
            });
        },
        get: function () {
            return this._content;
        }
    },

    _contentController: {value: null},
    contentController: {
        set: function (value) {
            this._contentController = value;
            this.defineBinding("_repetition.contentController", {
                "<-": "_contentController"
            });
        },
        get: function () {
            return this._contentController;
        }
    },

    axis: {
        value: null
    },

/**
  Description TODO
  @private
*/
    isSelectionEnabled: {
        value: null
    }
});
