
var parse = require("./parse");
var compiledAssigner = require("./compile-assigner");
var Scope = require("./scope");

// TODO deprecate.  this is too easy to implement better at other layers,
// depending on scopes.
module.exports = assign;
function assign(target, path, value, parameters, document, components) {
    var syntax;
    if (typeof path === "string") {
        syntax = parse(path);
    } else {
        syntax = path;
    }

    /*
        This is a rare case where we can't really do any assignment.
        So we avoid an exception by adding a test
    */
    if(syntax.type === "value" || syntax.type === "litteral") {
        return;
    }

    var scope = new Scope(target);
    scope.parameters = parameters;
    scope.document = document;
    scope.components = components;
    /*
        compiledAssigner(syntax) returns a function
    */
    return compiledAssigner(syntax)(value, scope);
}

