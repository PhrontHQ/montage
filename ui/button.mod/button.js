/*global require, exports*/

const { PressComposer } = require("composer/press-composer");
const { throttle } = require("../../core/helpers/throttle");
const { KeyComposer } = require("composer/key-composer");
const { Control } = require("ui/control");

/**
 *  @module "mod/ui/native/button.mod"
 */

/**
 * @typedef {"primary"|"secondary"|"success"|"danger"|"warn"|"info"|"light"|"dark"} ButtonColor
 * @typedef {"contained"|"outlined"|"image"|"text"} ButtonVariant
 * @typedef {"small"|"medium"|"large"} ButtonSize
 * @typedef {"left"|"right"} ButtonImagePlacement
 * /

// TODO: migrate away from using undefinedGet and undefinedSet

/**
    Wraps a native <code>&lt;button></code> or <code>&lt;input[type="button"]></code> HTML element. The element's standard attributes are exposed as bindable properties.
    @class module:"mod/ui/native/button.mod".Button
    @extends module:mod/ui/control.Control
    @fires action
    @fires hold
    @example
<caption>JavaScript example</caption>
var b1 = new Button();
b1.element = document.querySelector("btnElement");
b1.addEventListener("action", function(event) {
    console.log("Got event 'action' event");
});
    @example
<caption>Serialized example</caption>
{
    "aButton": {
        "prototype": "mod/ui/native/button.mod",
        "values": {
            "element": {"#": "btnElement"}
        },
        "listeners": [
            {
                "type": "action",
                "listener": {"@": "appListener"}
            }
        ]
    },
    "listener": {
        "prototype": "appListener"
    }
}
&lt;button data-mod-id="btnElement"></button>
*/
const Button = (exports.Button = class Button extends Control {
    /** @lends module:"mod/ui/native/button.mod".Button# */
    /**
     * Available button colors
     * @readonly
     * @enum {ButtonColor}
     * @default primary
     */
    static COLORS = Object.freeze({
        primary: "primary",
        secondary: "secondary",
        success: "success",
        danger: "danger",
        warn: "warn",
        info: "info",
        light: "light",
        dark: "dark",
    });

    /**
     * Available button variants
     * @readonly
     * @enum {ButtonVariant}
     * @default contained
     */
    static VARIANTS = Object.freeze({
        contained: "contained",
        outlined: "outlined",
        text: "text",
    });

    /**
     * Available button sizes
     * @readonly
     * @enum {ButtonSize}
     * @default medium
     */
    static SIZES = Object.freeze({
        small: "small",
        medium: "medium",
        large: "large",
    });

    /**
     * Available image placements
     * @readonly
     * @enum {ButtonImagePlacement}
     * @default start
     */
    static IMAGE_PLACEMENTS = Object.freeze({
        start: "image-start",
        end: "image-end",
    });

    /**
     * Available shapes
     * @readonly
     * @enum {ButtonShape}
     * @default rounded
     */
    static SHAPES = Object.freeze({
        square: "square",
        rounded: "rounded",
        circle: "circle",
    });

    standardElementTagName = "BUTTON";

    drawsFocusOnPointerActivation = true;

    hasTemplate = true;

    label = null;

    get label() {
        return this._label;
    }

    set label(value) {
        const isDefined = typeof value !== "undefined";

        if (isDefined && this.converter) {
            try {
                value = this.converter.convert(value);

                if (this.error) {
                    this.error = null;
                }
            } catch (e) {
                // unable to convert - maybe error
                this.error = e;
            }
        }

        this._label = isDefined && value !== null ? String(value) : null;
    }

    /**
     * A Mod converter object used to convert or format the label displayed by
     * the Button instance. When a new value is assigned to <code>label</code>,
     * the converter object's <code>convert()</code> method is invoked,
     * passing it the newly assigned label value.
     * @type {Property}
     * @default null
     */
    converter = null;

    _size = Button.SIZES.medium;

    get size() {
        return this._size;
    }

    set size(value) {
        if (value !== this._size && Button.SIZES[value]) {
            this._size = Button.SIZES[value];
            this._applySizeStyles();
        }
    }

    _color = Button.COLORS.primary;

    /**
     * Get the current button color
     * @returns {ButtonColor} The current color
     */
    get color() {
        return this._color;
    }

    set color(value) {
        if (value !== this._color && Button.COLORS[value]) {
            this._color = Button.COLORS[value];
            this._applyColorStyles();
        }
    }

    _variant = Button.VARIANTS.contained;

    get variant() {
        return this._variant;
    }

    set variant(value) {
        if (value !== this._variant && Button.VARIANTS[value]) {
            this._variant = Button.VARIANTS[value];
            this._applyVariantStyles();
        }
    }

    _imagePlacement = Button.IMAGE_PLACEMENTS.start;

    get imagePlacement() {
        return this._imagePlacement;
    }

    set imagePlacement(value) {
        if (value !== this._imagePlacement && Button.IMAGE_PLACEMENTS[value]) {
            this._imagePlacement = Button.IMAGE_PLACEMENTS[value];
            this._applyImagePlacementStyles();
        }
    }

    _shape = Button.SHAPES.rounded;

    get shape() {
        return this._shape;
    }

    set shape(value) {
        if (value !== this._shape && Button.SHAPES[value]) {
            this._shape = Button.SHAPES[value];
            this._applyShapeStyles();
        }
    }

    /**
     * Whether the button should display a visual feedback when clicked
     * @type {boolean}
     * @default false
     */
    hasVisualFeedback = false;

    _isThrottled = false;

    /**
     * Whether the button should throttle the action event
     * @type {boolean}
     */
    get isThrottled() {
        return this._isThrottled;
    }

    set isThrottled(value) {
        if (value !== this._isThrottled) {
            this._isThrottled = value;
            this._buildDispatchActionEvent();
        }
    }

    _throttleDuration = 400;

    /**
     * The duration in milliseconds to throttle the action event
     * @type {number}
     */
    get throttleDuration() {
        return this._throttleDuration;
    }

    set throttleDuration(value) {
        if (value !== this._throttleDuration) {
            this._throttleDuration = value;
            this._buildDispatchActionEvent();
        }
    }

    _promise = undefined;

    get promise() {
        return this._promise;
    }

    set promise(promise) {
        // Only proceed if the new promise is different from the current one
        if (this._promise === promise) return;

        const shouldClearPendingState = !!this._promise;
        this._promise = promise;

        if (promise) {
            // Set up pending state when promise is set
            this.classList.add("mod--pending");

            // Create a closure to handle promise resolution
            const handleResolution = () => {
                // Only clear pending state if this is still the current promise
                if (handleResolution.originalPromise === this._promise) {
                    this.classList.remove("mod--pending");
                    this._promise = undefined;
                }
            };

            // Store reference to the original promise for comparison
            handleResolution.originalPromise = promise;

            // Ensure pending state is cleared even on rejection
            // TODO: we should propably add an error state...
            promise.finally(handleResolution);
        } else if (shouldClearPendingState) {
            // Clear pending state when the current promise is set to null
            this.classList.remove("mod--pending");
        }
    }

    /**
     * The amount of time in milliseconds the user must press and hold
     * the button a <code>hold</code> event is dispatched.
     * The default is 1 second.
     * @type {number}
     * @default 1000
     */
    get holdThreshold() {
        return this._pressComposer.longPressThreshold;
    }

    set holdThreshold(value) {
        this._pressComposer.longPressThreshold = value;
    }

    __pressComposer = null;

    get _pressComposer() {
        if (!this.__pressComposer) {
            this.__pressComposer = new PressComposer();
            this.addComposer(this.__pressComposer);
        }

        return this.__pressComposer;
    }

    __spaceKeyComposer = null;

    get _spaceKeyComposer() {
        if (!this.__spaceKeyComposer) {
            this.__spaceKeyComposer = KeyComposer.createKey(
                this,
                "space",
                "space"
            );
        }
        return this.__spaceKeyComposer;
    }

    __enterKeyComposer = null;

    get _enterKeyComposer() {
        if (!this.__enterKeyComposer) {
            this.__enterKeyComposer = KeyComposer.createKey(
                this,
                "enter",
                "enter"
            );
        }
        return this.__enterKeyComposer;
    }

    enterDocument(firstDraw) {
        super.enterDocument?.call(firstDraw);

        if (firstDraw) {
            this.element.setAttribute("role", "button");
            this.element.addEventListener("keyup", this, false);
            this._buildDispatchActionEvent();

            // Apply the button styles
            this._applyImagePlacementStyles();
            this._applyColorStyles();
            this._applyVariantStyles();
            this._applySizeStyles();
            this._applyShapeStyles();
        }
    }

    prepareForActivationEvents() {
        this._pressComposer.addEventListener("pressStart", this, false);
        this._spaceKeyComposer.addEventListener("keyPress", this, false);
        this._enterKeyComposer.addEventListener("keyPress", this, false);
    }

    // Override addEventListener for optimization
    addEventListener(type, listener, useCapture) {
        Control.prototype.addEventListener.call(
            this,
            type,
            listener,
            useCapture
        );

        if (type === "longAction") {
            this._pressComposer.addEventListener("longPress", this, false);
        }
    }

    /**
     * Dispatches the action event, throttled if necessary
     * @override
     */
    dispatchActionEvent() {
        return this._dispatchActionEvent();
    }

    // <---- Event Handlers ---->

    handleKeyPress(mutableEvent) {
        // when focused action event on spacebar & enter
        // FIXME: - property identifier is not set on the mutable event
        if (
            mutableEvent._event.identifier === "space" ||
            mutableEvent._event.identifier === "enter"
        ) {
            this.active = false;
            this.dispatchActionEvent();
        }
    }

    /**
     * Called when the user starts interacting with the component.
     */
    handlePressStart(_) {
        if (!this._promise) {
            this.active = true;
            this._addEventListeners();
        }
    }

    /**
     * Called when the user has interacted with the button.
     */
    handlePress(event) {
        if (!this._promise) {
            this.active = false;
            this.dispatchActionEvent(event.details);
            this._removeEventListeners();
        }
    }

    handleLongPress(_) {
        if (!this._promise) {
            // When we fire the "hold" event we don't want to fire the
            // "action" event as well.
            this._pressComposer.cancelPress();
            this._removeEventListeners();

            const longActionEvent = document.createEvent("CustomEvent");

            // FIXME: InitCustomEvent is deprecated
            longActionEvent.initCustomEvent("longAction", true, true, null);
            this.dispatchEvent(longActionEvent);
        }
    }

    /**
     * Called when all interaction is over.
     * @protected
     */
    handlePressCancel(_) {
        this.active = false;
        this._removeEventListeners();
    }

    _addEventListeners() {
        this._pressComposer.addEventListener("press", this, false);
        this._pressComposer.addEventListener("pressCancel", this, false);

        // FIXME: @benoit: we should maybe have a flag for this kind of event.
        // can be tricky with the event delegation for example if we don't add it.
        // same issue for: the pressComposer and the translate composer.
        this._pressComposer.addEventListener("longPress", this, false);
    }

    _removeEventListeners() {
        this._pressComposer.removeEventListener("press", this, false);
        this._pressComposer.removeEventListener("pressCancel", this, false);
        this._pressComposer.removeEventListener("longPress", this, false);
    }

    /**
     * @private
     */
    _buildDispatchActionEvent() {
        if (this.isThrottled) {
            this._dispatchActionEvent = throttle(
                super.dispatchActionEvent,
                this.throttleDuration
            );
        } else {
            this._dispatchActionEvent = super.dispatchActionEvent;
        }
    }

    /**
     * Applies the current color's styling by updating CSS classes
     * @private
     */
    _applyColorStyles() {
        this._removeClassListTokens(...Object.values(Button.COLORS));
        this.classList.add(this.color);
    }

    /**
     * Applies the current variant's styling by updating CSS classes
     * @private
     */
    _applyVariantStyles() {
        this._removeClassListTokens(...Object.values(Button.VARIANTS));
        this.classList.add(this.variant);
    }

    /**
     * Applies the current size's styling by updating CSS classes
     * @private
     */
    _applySizeStyles() {
        this._removeClassListTokens(...Object.values(Button.SIZES));
        this.classList.add(this.size);
    }

    /**
     * Applies the current image placement's styling by updating CSS classes
     * @private
     */
    _applyImagePlacementStyles() {
        this._removeClassListTokens(...Object.values(Button.IMAGE_PLACEMENTS));

        this.classList.add(this.imagePlacement);
    }

    /**
     * Applies the current shape's styling by updating CSS classes
     * @private
     */
    _applyShapeStyles() {
        this._removeClassListTokens(...Object.values(Button.SHAPES));
        this.classList.add(this.shape);
    }

    // FIXME: Remove this method when the classList's remove method is fixed!
    // Our implementation doesn't support multiple arguments
    // https://dom.spec.whatwg.org/#dom-domtokenlist-remove
    _removeClassListTokens(...tokens) {
        for (const token of tokens) {
            this.classList.remove(token);
        }
    }
});

Button.addAttributes( /** @lends module:"mod/ui/native/button.mod".Button# */{

/**
    The URL to which the form data will be sumbitted.
    @type {string}
    @default null
*/
    formaction: null,

/**
    The content type used to submit the form to the server.
    @type {string}
    @default null
*/
    formenctype: null,

/**
    The HTTP method used to submit the form.
    @type {string}
    @default null
*/
    formmethod: null,

/**
    Indicates if the form should be validated upon submission.
    @type {boolean}
    @default null
*/
    formnovalidate: {dataType: 'boolean'},

/**
    The target frame or window in which the form output should be rendered.
    @type string}
    @default null
*/
    formtarget: null,

/**
    A string indicating the input type of the component's element.
    @type {string}
    @default "button"
*/
    type: {value: 'button'},

/**
    The name associated with the component's DOM element.
    @type {string}
    @default null
*/
    name: null,
});
