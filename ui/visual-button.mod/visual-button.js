var { Button } = require("../button.mod");

/**
 * @typedef {"primary"|"secondary"|"success"|"danger"|"warn"|"info"|"light"|"dark"} VisualButtonColor
 * @typedef {"contained"|"outlined"|"image"|"text"} VisualButtonVariant
 * @typedef {"small"|"medium"|"large"} VisualButtonSize
 * @typedef {"left"|"right"} VisualButtonImagePlacement
 * /

/**
 * A button component that applies themed based styling
 * @extends Button
 */
exports.VisualButton = class VisualButton extends Button {
    /**
     * Available button colors
     * @readonly
     * @enum {VisualButtonColor}
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
     * @enum {VisualButtonVariant}
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
     * @enum {VisualButtonSize}
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
     * @enum {VisualButtonImagePlacement}
     * @default start
     */
    static IMAGE_PLACEMENTS = Object.freeze({
        start: "image-start",
        end: "image-end",
    });

    /**
     * Available shapes
     * @readonly
     * @enum {VisualButtonShape}
     * @default rounded
     */
    static SHAPES = Object.freeze({
        square: "square",
        rounded: "rounded",
        circle: "circle",
    });

    hasTemplate = true;

    label = null;

    _size = VisualButton.SIZES.medium;

    get size() {
        return this._size;
    }

    set size(value) {
        if (value !== this._size && VisualButton.SIZES[value]) {
            this._size = VisualButton.SIZES[value];
            this._applySizeStyles();
        }
    }

    _color = VisualButton.COLORS.primary;

    /**
     * Get the current button color
     * @returns {VisualButtonColor} The current color
     */
    get color() {
        return this._color;
    }

    set color(value) {
        if (value !== this._color && VisualButton.COLORS[value]) {
            this._color = VisualButton.COLORS[value];
            this._applyColorStyles();
        }
    }

    _variant = VisualButton.VARIANTS.contained;

    get variant() {
        return this._variant;
    }

    set variant(value) {
        if (value !== this._variant && VisualButton.VARIANTS[value]) {
            this._variant = VisualButton.VARIANTS[value];
            this._applyVariantStyles();
        }
    }

    _imagePlacement = VisualButton.IMAGE_PLACEMENTS.start;

    get imagePlacement() {
        return this._imagePlacement;
    }

    set imagePlacement(value) {
        if (
            value !== this._imagePlacement &&
            VisualButton.IMAGE_PLACEMENTS[value]
        ) {
            this._imagePlacement = VisualButton.IMAGE_PLACEMENTS[value];
            this._applyImagePlacementStyles();
        }
    }

    _shape = VisualButton.SHAPES.rounded;

    get shape() {
        return this._shape;
    }

    set shape(value) {
        if (value !== this._shape && VisualButton.SHAPES[value]) {
            this._shape = VisualButton.SHAPES[value];
            this._applyShapeStyles();
        }
    }

    enterDocument() {
        this._applyImagePlacementStyles();
        this._applyColorStyles();
        this._applyVariantStyles();
        this._applySizeStyles();
        this._applyShapeStyles();
    }

    /**
     * Applies the current color's styling by updating CSS classes
     * @private
     */
    _applyColorStyles() {
        this._removeClassListTokens(...Object.values(VisualButton.COLORS));
        this.classList.add(this.color);
    }

    /**
     * Applies the current variant's styling by updating CSS classes
     * @private
     */
    _applyVariantStyles() {
        this._removeClassListTokens(...Object.values(VisualButton.VARIANTS));
        this.classList.add(this.variant);
    }

    /**
     * Applies the current size's styling by updating CSS classes
     * @private
     */
    _applySizeStyles() {
        this._removeClassListTokens(...Object.values(VisualButton.SIZES));
        this.classList.add(this.size);
    }

    /**
     * Applies the current image placement's styling by updating CSS classes
     * @private
     */
    _applyImagePlacementStyles() {
        this._removeClassListTokens(
            ...Object.values(VisualButton.IMAGE_PLACEMENTS)
        );

        this.classList.add(this.imagePlacement);
    }

    /**
     * Applies the current shape's styling by updating CSS classes
     * @private
     */
    _applyShapeStyles() {
        this._removeClassListTokens(...Object.values(VisualButton.SHAPES));
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
};
