const evaluate = require("./evaluate");

/**
 * Evaluates an FRB expression from this object and returns the value.
 * The evaluator does not establish any change listeners.
 * @function GenericCollection#valueForExpression
 * @param {string} expression an FRB expression
 * @returns the current value of the expression
 */
exports.valueForExpression = function (expression, parameters, document, components) {
    return evaluate(
        expression,
        this,
        parameters || this,
        document,
        components
    );
};

