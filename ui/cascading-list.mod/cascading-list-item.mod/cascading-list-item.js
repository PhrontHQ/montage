var Component = require("../../component").Component;

/**
 * @class CascadingListItem
 * @extends Component
 */
var CascadingListItem = exports.CascadingListItem = Component.specialize({

    constructor: {
        value: function () {
            this.defineBindings({
                "shouldHideFooter": {
                    "<-": "isCollection ? " +
                        "!(userInterfaceDescriptor.cascadingListItemFooterLeftCollectionNameExpression.defined() || " +
                        "userInterfaceDescriptor.cascadingListItemFooterMiddleCollectionNameExpression.defined() || " +
                        "userInterfaceDescriptor.cascadingListItemFooterRightCollectionNameExpression.defined()) : " +
                        "!(userInterfaceDescriptor.cascadingListItemFooterLeftNameExpression.defined() || " +
                        "userInterfaceDescriptor.cascadingListItemFooterMiddleNameExpression.defined() || " +
                        "userInterfaceDescriptor.cascadingListItemFooterRightNameExpression.defined())"
                },
                "headerLeftLabel": {
                    "<-": "isCollection ? " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemHeaderLeftCollectionNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemHeaderLeftCollectionNameExpression || \"''\")) : " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemHeaderLeftNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemHeaderLeftNameExpression || \"''\"))"
                },
                "headerMiddleLabel": {
                    "<-": "isCollection ? " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemHeaderMiddleCollectionNameExpression || " +
                        "userInterfaceDescriptor.collectionNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemHeaderMiddleCollectionNameExpression || " +
                        "userInterfaceDescriptor.collectionNameExpression || \"''\")) : " +
                        "object.evaluate(userInterfaceDescriptor.cascadingListItemHeaderMiddleNameExpression || " +
                        "userInterfaceDescriptor.nameExpression || \"''\")"
                },
                "_headerRightLabelObjectExpression": {
                    "<-": "!isCollection ? " +
                        "object.evaluate(userInterfaceDescriptor.cascadingListItemHeaderRightNameExpression) : ''"
                },
                "_headerRightLabelExpression": {
                    "<-": "!isCollection ? " +
                        "path(userInterfaceDescriptor.cascadingListItemHeaderRightNameExpression) : ''"
                },
                "__headerRightLabelExpression": {
                    "<-": "_headerRightLabelExpression || _headerRightLabelObjectExpression"
                },
                "headerRightLabel": {
                    "<-": "isCollection ? " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemHeaderRightCollectionNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemHeaderRightCollectionNameExpression || \"''\")) : " +
                        "__headerRightLabelExpression"
                },
                "footerLeftLabel": {
                    "<-": "isCollection ? " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemFooterLeftCollectionNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemFooterLeftCollectionNameExpression || \"''\")) : " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemFooterLeftNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemFooterLeftNameExpression || \"''\"))"
                },
                "footerMiddleLabel": {
                    "<-": "isCollection ? " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemFooterMiddleCollectionNameExpression) || " +
                        "path(userInterfaceDescriptor.cascadingListItemFooterMiddleCollectionNameExpression || \"''\")) : " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemMiddleRightNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemFooterMiddleNameExpression || \"''\"))"
                },
                "footerRightLabel": {
                    "<-": "isCollection ? " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemFooterRightCollectionNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemFooterRightCollectionNameExpression || \"''\")) : " +
                        "(object.evaluate(userInterfaceDescriptor.cascadingListItemFooterRightNameExpression || \"''\") || " +
                        "path(userInterfaceDescriptor.cascadingListItemFooterRightNameExpression || \"''\"))"
                }
            });

            this.addRangeAtPathChangeListener("selection", this, "_handleSelectionChange");
        }
    },

    _context: {
        value: null
    },

    context: {
        get: function () {
            return this._context;
        },
        set: function (context) {
            if (this._context !== context ||
                (context && this._context && this._context.object !== context.object)
            ) {
                var componentModule = null;
                this._context = context;

                if (context) {
                    var UIDescriptor = context.userInterfaceDescriptor,
                        object = context.object;

                    context.cascadingListItem = this;

                    this.isCollection = Array.isArray(object);
                    this.userInterfaceDescriptor = UIDescriptor;
                    this.object = object;

                    if (UIDescriptor) {
                        if (this.isCollection) {
                            componentModule = (
                                UIDescriptor.collectionInspectorComponentModule ||
                                CascadingListItem.defaultCollectionModule
                            );
                        } else {
                            componentModule = UIDescriptor.inspectorComponentModule;
                        }

                        componentModule = this.callDelegateMethod(
                            "cascadingListWillUseInspectorComponentModuleForObjectAtColumnIndex",
                            context.cascadingList,
                            componentModule,
                            object,
                            context.columnIndex,
                            context
                        ) || componentModule;
                    }
                } else {
                    this.object = null;
                }

                this.componentModule = componentModule;
            }
        }
    },

    selectObject: {
        value: function (object) {
            if (this.isCollection && this.selection[0] !== object) {
                this.selection.clear();

                if (this.context.object.indexOf(object) > -1) {
                    this.selection.push(object);
                }
            }
        }
    },

    shouldHideFooter: {
        value: true,
    },

    isCollection: {
        value: false
    },

    componentModule: {
        value: null
    },

    selection: {
        value: null
    },

    _handleSelectionChange: {
        value: function (plus, minus, index) {
            if (plus && plus.length === 1) {
                this.cascadingList.expand(
                    plus[0],
                    this.context.columnIndex + 1
                );
            }
        }
    }

}, {
    defaultCollectionModule: {
        value: {
            id: '../../list.mod',
            require: require
        }
    }
});
