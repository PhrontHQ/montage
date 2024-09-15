var List = require("./_list");
var FastSet = require("./_fast-set");
var Iterator = require("./iterator");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var SIZE = "size";


CollectionsSet = function CollectionsSet(values, equals, hash, getDefault) {
    return CollectionsSet._init(CollectionsSet, this, values, equals, hash, getDefault);
}

CollectionsSet._init = function (constructor, object, values, equals, hash, getDefault) {
    if (!(object instanceof constructor)) {
        return new constructor(values, equals, hash, getDefault);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    getDefault = getDefault || Function.noop;
    object.contentEquals = equals;
    object.contentHash = hash;
    object.getDefault = getDefault;
    // a list of values in insertion order, used for all operations that depend
    // on iterating in insertion order
    object.order = new object.Order(undefined, equals);
    // a set of nodes from the order list, indexed by the corresponding value,
    // used for all operations that need to quickly seek  value in the list
    object.store = new object.Store(
        undefined,
        function (a, b) {
            return equals(a.value, b.value);
        },
        function (node) {
            return hash(node.value);
        }
    );
    object.length = 0;
    object.addEach(values);

}

CollectionsSet.Set = CollectionsSet; // hack so require("set").Set will work in MontageJS
CollectionsSet.CollectionsSet = CollectionsSet;

Object.addEach(CollectionsSet.prototype, GenericCollection.prototype);
Object.addEach(CollectionsSet.prototype, GenericSet.prototype);

CollectionsSet.from = GenericCollection.from;

Object.defineProperty(CollectionsSet.prototype,"size",GenericCollection._sizePropertyDescriptor);

//Overrides for consistency:
// Set.prototype.forEach = GenericCollection.prototype.forEach;


CollectionsSet.prototype.Order = List;
CollectionsSet.prototype.Store = FastSet;

CollectionsSet.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.contentHash, this.getDefault);
};

CollectionsSet.prototype.has = function (value) {
    var node = new this.order.Node(value);
    return this.store.has(node);
};

CollectionsSet.prototype.get = function (value, equals) {
    if (equals) {
        throw new Error("Set#get does not support second argument: equals");
    }
    var node = new this.order.Node(value);
    node = this.store.get(node);
    if (node) {
        return node.value;
    } else {
        return this.getDefault(value);
    }
};

CollectionsSet.prototype.add = function (value) {
    var node = new this.order.Node(value);
    if (!this.store.has(node)) {
        var index = this.length;
        this.order.add(value);
        node = this.order.head.prev;
        this.store.add(node);
        this.length++;
        return true;
    }
    return false;
};

CollectionsSet.prototype["delete"] = function (value, equals) {
    if (equals) {
        throw new Error("Set#delete does not support second argument: equals");
    }
    var node = new this.order.Node(value);
    if (this.store.has(node)) {
        node = this.store.get(node);
        this.store["delete"](node); // removes from the set
        this.order.splice(node, 1); // removes the node from the list
        this.length--;
        return true;
    }
    return false;
};

CollectionsSet.prototype.pop = function () {
    if (this.length) {
        var result = this.order.head.prev.value;
        this["delete"](result);
        return result;
    }
};

CollectionsSet.prototype.shift = function () {
    if (this.length) {
        var result = this.order.head.next.value;
        this["delete"](result);
        return result;
    }
};

CollectionsSet.prototype.one = function () {
    if (this.length > 0) {
        return this.store.one().value;
    }
};

CollectionsSet.prototype.clear = function () {
    this.store.clear();
    this.order.clear();
    this.length = 0;
};
Object.defineProperty(CollectionsSet.prototype,"_clear", {
    value: CollectionsSet.prototype.clear
});

CollectionsSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var list = this.order;
    var index = 0;
    return list.reduce(function (basis, value) {
        return callback.call(thisp, basis, value, index++, this);
    }, basis, this);
};

CollectionsSet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var list = this.order;
    var index = this.length - 1;
    return list.reduceRight(function (basis, value) {
        return callback.call(thisp, basis, value, index--, this);
    }, basis, this);
};

CollectionsSet.prototype.iterate = function () {
    return this.order.iterate();
};

CollectionsSet.prototype.values = function () {
    return new Iterator(this.valuesArray(), true);
};

CollectionsSet.prototype.log = function () {
    var set = this.store;
    return set.log.apply(set, arguments);
};


// use different strategies for making sets observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype,
    set_makeObservable;

if (protoIsSupported) {
    set_makeObservable = function () {
        this.__proto__ = ChangeDispatchSet;
    };
} else {
    set_makeObservable = function () {
        Object.defineProperties(this, observableSetProperties);
    };
}

Object.defineProperty(CollectionsSet.prototype, "makeObservable", {
    value: set_makeObservable,
    writable: true,
    configurable: true,
    enumerable: false
});


var observableSetProperties = {
    "_dispatchEmptyArray": {
        value: []
    },
    "clear": {
        value: function () {
            var clearing;
            var length = this.length;
            if (length) {
                this.dispatchBeforeOwnPropertyChange(SIZE, length);
            }
            if (this.dispatchesRangeChanges) {
                clearing = this.toArray();
                this.dispatchBeforeRangeChange(this._dispatchEmptyArray, clearing, 0);
            }
            this._clear();
            if (this.dispatchesRangeChanges) {
                this.dispatchRangeChange(this._dispatchEmptyArray, clearing, 0);
            }
            if (length) {
                this.dispatchOwnPropertyChange(SIZE, 0);
            }
        },
        writable: true,
        configurable: true

    },
    "add": {
        value: function (value) {
            var node = new this.order.Node(value);
            if (!this.store.has(node)) {
                var index = this.length;
                var dispatchValueArray = [value];
                this.dispatchBeforeOwnPropertyChange(SIZE, index);
                if (this.dispatchesRangeChanges) {
                    this.dispatchBeforeRangeChange(dispatchValueArray, this._dispatchEmptyArray, index);
                }
                this.order.add(value);
                node = this.order.head.prev;
                this.store.add(node);
                this.length++;
                if (this.dispatchesRangeChanges) {
                    this.dispatchRangeChange(dispatchValueArray, this._dispatchEmptyArray, index);
                }
                this.dispatchOwnPropertyChange(SIZE, index + 1);
                return true;
            }
            return false;
        },
    },
    "delete": {
        value: function (value, equals) {
            if (equals) {
                throw new Error("Set#delete does not support second argument: equals");
            }
            var node = new this.order.Node(value);
            if (this.store.has(node)) {
                var setIterator = this.values(),
                    index = 0;

                while(setIterator.next().value !== value) {
                    index++;
                }
                
                node = this.store.get(node);
                var dispatchValueArray = [value];
                this.dispatchBeforeOwnPropertyChange(SIZE, this.length);
                if (this.dispatchesRangeChanges) {
                    this.dispatchBeforeRangeChange(this._dispatchEmptyArray, dispatchValueArray, index);
                }
                this.store["delete"](node); // removes from the set
                this.order.splice(node, 1); // removes the node from the list
                this.length--;
                if (this.dispatchesRangeChanges) {
                    this.dispatchRangeChange(this._dispatchEmptyArray, dispatchValueArray, index);
                }
                this.dispatchOwnPropertyChange(SIZE, this.length);
                return true;
            }
            return false;
        }
    }
};

var ChangeDispatchSet = Object.create(CollectionsSet.prototype, observableSetProperties);

CollectionsSet.prototype.Order = List;
CollectionsSet.prototype.Store = FastSet;

Object.addEach(CollectionsSet.prototype, PropertyChanges.prototype);
Object.addEach(CollectionsSet.prototype, RangeChanges.prototype);

module.exports = CollectionsSet;