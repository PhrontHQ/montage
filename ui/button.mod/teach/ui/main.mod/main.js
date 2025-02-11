const { VisualButton } = require("mod/ui/visual-button.mod");
const { Component } = require("mod/ui/component");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.Main = class Main extends Component {
    imagePlacementOptions = Object.keys(VisualButton.IMAGE_PLACEMENTS);

    colorsOptions = Object.keys(VisualButton.COLORS);

    sizesOptions = Object.keys(VisualButton.SIZES);

    shapeOptions = Object.keys(VisualButton.SHAPES);

    imagePlacement = VisualButton.IMAGE_PLACEMENTS.start;

    shape = VisualButton.SHAPES.rounded;

    color = VisualButton.COLORS.primary;

    size = VisualButton.SIZES.medium;

    overridePrimaryColor = false;

    hasVisualFeedback = false;

    pendingPromise = null;

    disabled = false;

    passedThroughCounter = 0;

    attemptCounter = 0;

    lastActionEventType = 'none';

    enterDocument() {
        this.throttledButton.element.addEventListener(
            "click",
            this.handleThrottledButtonClick
        );
    }

    exitDocument() {
        this.throttledButton.element.removeEventListener(
            "click",
            this.handleThrottledButtonClick
        );
    }

    handleAction() {
        this.lastActionEventType = "action";
    }

    handleLongAction() {
        this.lastActionEventType = "long-action";
    }

    handleThrottledButtonClick = () => {
        this.attemptCounter++;
    };

    handleThrottledButtonAction() {
        this.passedThroughCounter++;
    }

    async handlePendingButtonAction() {
        this.pendingPromise = delay(2_500);
        await this.pendingPromise;
        this.pendingPromise = null;
    }

    handleOverridePrimaryColorCheckboxAction() {
        if (!this.overridePrimaryColor) {
            document.documentElement.style.setProperty(
                "--mod-button-text-primary-color",
                "#6366f1"
            );
            document.documentElement.style.setProperty(
                "--mod-button-text-primary-bg-hover-color",
                "#eef2ff"
            );
            document.documentElement.style.setProperty(
                "--mod-button-text-primary-bg-active-color",
                "#e0e7ff"
            );
            document.documentElement.style.setProperty(
                "--mod-button-outlined-primary-color",
                "#6366f1"
            );
            document.documentElement.style.setProperty(
                "--mod-button-outlined-primary-border",
                "#6366f1"
            );
            document.documentElement.style.setProperty(
                "--mod-button-outlined-primary-bg-hover-color",
                "#eef2ff"
            );
            document.documentElement.style.setProperty(
                "--mod-button-outlined-primary-bg-active-color",
                "#e0e7ff"
            );
            document.documentElement.style.setProperty(
                "--mod-button-contained-primary-bg-color",
                "#6366f1"
            );
            document.documentElement.style.setProperty(
                "--mod-button-contained-primary-bg-hover-color",
                "#818cf8"
            );
            document.documentElement.style.setProperty(
                "--mod-button-contained-primary-bg-active-color",
                "#4f46e5"
            );
        } else {
            document.documentElement.style.setProperty(
                "--mod-button-text-primary-color",
                "#ec4899"
            );
            document.documentElement.style.setProperty(
                "--mod-button-text-primary-bg-hover-color",
                "#fdf2f8"
            );
            document.documentElement.style.setProperty(
                "--mod-button-text-primary-bg-active-color",
                "#fce7f3"
            );
            document.documentElement.style.setProperty(
                "--mod-button-outlined-primary-color",
                "#ec4899"
            );
            document.documentElement.style.setProperty(
                "--mod-button-outlined-primary-border",
                "#ec4899"
            );
            document.documentElement.style.setProperty(
                "--mod-button-outlined-primary-bg-hover-color",
                "#fdf2f8"
            );
            document.documentElement.style.setProperty(
                "--mod-button-outlined-primary-bg-active-color",
                "#fce7f3"
            );
            document.documentElement.style.setProperty(
                "--mod-button-contained-primary-bg-color",
                "#ec4899"
            );
            document.documentElement.style.setProperty(
                "--mod-button-contained-primary-bg-hover-color",
                "#f9a8d4"
            );
            document.documentElement.style.setProperty(
                "--mod-button-contained-primary-bg-active-color",
                "#db2777"
            );
        }
    }
};
