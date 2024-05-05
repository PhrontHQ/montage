/**
    @module "./foo.mod"
    @requires montage
    @requires mod/ui/component
*/
var Montage = require("mod/core/core").Montage,
    Component = require("mod/ui/component").Component;

/**
    Description TODO
    @class module:"./foo.mod".Foo
    @extends module:mod/ui/component.Component
*/
exports.Foo = Component.specialize( /** @lends module:"./foo.mod".Foo# */ {

});
