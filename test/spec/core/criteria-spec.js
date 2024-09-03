
var Criteria = require("mod/core/criteria").Criteria;
var serialize = require("mod/core/serialization/serializer/montage-serializer").serialize;
var deserialize = require("mod/core/serialization/deserializer/montage-deserializer").deserialize;

describe("core/criteria-spec", function () {

    it("should evaluate true for any input", function () {
        var criteria = Criteria.thatEvaluatesToTrue;
        expect(criteria.evaluate({a: {b: 10}})).toBe(true);
    });

    it("should initialize with expression", function () {
        var criteria = new Criteria().initWithExpression("a.b");
        expect(criteria.evaluate({a: {b: 10}})).toBe(10);
    });

    it("should initialize with expression and parameters", function () {
        var criteria = new Criteria().initWithExpression("a.b == $b",{b: 10});
        expect(criteria.evaluate({a: {b: 10}})).toBe(true);
    });

    it("should initialize with expression and parameters as an array", function () {
        var criteria = new Criteria().initWithExpression("a.b == $0 && a.c == $1",[10, 20]);
        expect(criteria.evaluate({a: {b: 10, c: 20}})).toBe(true);
    });


    it("should initialize with expression and parameters as an array #2", function () {
        var criteria = new Criteria().initWithExpression("a.b.has($0) && a.b.has($1)",[10, 20]);
        expect(criteria.evaluate({a: {b: [10,20]}})).toBe(true);
    });

    it("should initialize with expression and parameters as an array #3", function () {
        var criteria = new Criteria().initWithExpression("$.every{^a.b.has(this)}",[10, 20]);
        expect(criteria.evaluate({a: {b: [10,20,30]}})).toBe(true);
    });

    it("should create with expression", function () {
        var criteria = Criteria.withExpression("a.b");
        expect(criteria.evaluate({a: {b: 10}})).toBe(20);
    });

    it("should initialize with syntax", function () {
        var criteria = new Criteria().initWithSyntax({
            "type": "property",
            "args": [
                {"type": "value"},
                {"type": "literal", "value": "foo"}
            ]
        });
        expect(criteria.evaluate({foo: 10})).toBe(10);
    });

    it("should create with syntax", function () {
        var criteria = Criteria.withSyntax({
            "type": "property",
            "args": [
                {"type": "value"},
                {"type": "literal", "value": "foo"}
            ]
        });
        expect(criteria.evaluate({foo: 10})).toBe(10);
    });

    it("should create forObjectsLike", function () {
        var criteria = Criteria.forObjectsLike({
            "a": 1,
            "b": [2,3,4,5]
        });
        expect(criteria.evaluate({a: 1, "b": [2,3,4,5,6,7,5]})).toBe(true);
    });


    it("should serialize", function () {
        var criteria = new Criteria().initWithExpression("a.b");
        var serialization = serialize(criteria, require);
        var json = JSON.parse(serialization);
        expect(json).toEqual({
            root: {
                prototype: "mod/core/criteria",
                values: {
                    expression: "a.b"
                }
            }
        });
    })

    it("should deserialize", function (done) {
        var serialization = {
                "root": {
                    "prototype": "mod/core/criteria",
                    "values": {
                        "expression": "a.b"
                    }
                }
            },
            serializationString = JSON.stringify(serialization);

        deserialize(serializationString, require).then(function (criteria) {
            expect(criteria.evaluate({a: {b: 20}})).toEqual(20);
            done();
        });
    })

    it("should compose with class methods", function () {
        var criteria = Criteria.and('a', 'b');
        expect(criteria.evaluate({a: false, b: true})).toBe(false);
    });

    it("should compose with instance methods", function () {
        var criteria = new Criteria().initWithExpression("a").and("b");
        expect(criteria.evaluate({a: false, b: true})).toBe(false);
    });

    it("should compose multiple criteria with class methods", function () {
        var a1Criteria = new Criteria().initWithExpression("a == $a", { a: "a1"}),
            a2Criteria = new Criteria().initWithExpression("a == $a", { a: "a2"}),
            a3Criteria = new Criteria().initWithExpression("a == $a", { a: "a3"}),
            a4Criteria = new Criteria().initWithExpression("a == $a", { a: "a4"}),
            a5Criteria = new Criteria().initWithExpression("a == $a", { a: "a5"});

        var combinedCriteria = Criteria.or(a1Criteria, a2Criteria, a3Criteria, a4Criteria, a5Criteria);

        expect(combinedCriteria.evaluate({a: "a1", b: true})).toBe(true);
        expect(combinedCriteria.evaluate({a: "a2", b: true})).toBe(true);
        expect(combinedCriteria.evaluate({a: "a3", b: true})).toBe(true);
        expect(combinedCriteria.evaluate({a: "a4", b: true})).toBe(true);
        expect(combinedCriteria.evaluate({a: "a5", b: true})).toBe(true);
        expect(combinedCriteria.evaluate({a: "a6", b: true})).toBe(false);
    });

});

