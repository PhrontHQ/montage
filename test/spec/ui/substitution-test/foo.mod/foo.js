/**
    @module "./foo.mod"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
    Description TODO
    @class module:"./foo.mod".Foo
    @extends module:montage/ui/component.Component
*/
exports.Foo = Component.specialize( /** @lends module:"./foo.mod".Foo# */ {

});
