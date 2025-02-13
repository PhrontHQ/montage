exports.ExecutionController = class ExecutionController {
    /**
     * Creates an execution manager for a specific component
     * @param {Object} component - The component whose methods will be managed
     * @throws {Error} If component is not provided or invalid
     */
    constructor(component) {
        if (!component || typeof component !== "object") {
            throw new Error("Component must be a valid object");
        }

        this.component = component;
        this.throttledMethods = new Map();
    }

    /**
     * Delays execution for a specified amount of time
     * @param {number} [duration=300] - Delay duration in milliseconds
     * @returns {Promise<void>} Resolves after delay
     * @throws {Error} If duration is invalid
     */
    delay(duration = 300) {
        if (typeof duration !== "number" || duration < 0) {
            throw new Error("Duration must be a non-negative number");
        }

        return new Promise((resolve) => setTimeout(resolve, duration));
    }

    /**
     * Executes a component method after a specified delay
     * @param {string} methodName - Name of the component method to delay
     * @param {number} [duration=300] - Delay duration in milliseconds
     * @param {...any} args - Arguments to pass to the method
     * @returns {Promise<any>} Resolves with the method execution result
     * @throws {Error} If method doesn't exist on component or duration is invalid
     */
    async executeWithDelay(methodName, duration = 300, ...args) {
        if (typeof this.component[methodName] !== "function") {
            throw new Error(`Method ${methodName} does not exist on component`);
        }

        await this.delay(duration);

        return this.component[methodName].apply(this.component, args);
    }

    /**
     * Creates a throttled version of the callback
     * @param {Function} callback - The function to be throttled
     * @param {number} [duration=300] - The throttle duration in milliseconds
     * @param {*} thisArg - The object to be used as the this object
     * @returns {Function} A throttled function
     * @throws {Error} If callback is not a function or duration is invalid
     */
    throttle(callback, duration = 300, thisArg = this) {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }

        if (typeof duration !== "number" || duration < 0) {
            throw new Error("Duration must be a non-negative number");
        }

        let inThrottle = false;
        let lastResult;

        return (...args) => {
            if (!inThrottle) {
                lastResult = callback.apply(thisArg, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), duration);
            }

            return lastResult;
        };
    }

    /**
     * Executes a rate-limited version of a component method
     * @param {string} methodName - Name of the component method to throttle
     * @param {number} [duration=300] - Throttle duration in milliseconds
     * @param {...any} args - Arguments to pass to the method
     * @returns {any} Result of the throttled method execution
     * @throws {Error} If method doesn't exist on component
     */
    executeRateLimited(methodName, duration = 300, ...args) {
        if (typeof this.component[methodName] !== "function") {
            throw new Error(`Method ${methodName} does not exist on component`);
        }

        // Return existing throttled version if already created
        let throttledMethod = this.throttledMethods.get(methodName);

        if (!throttledMethod) {
            throttledMethod = this.throttle(
                this.component[methodName],
                duration,
                this.component
            );

            this.throttledMethods.set(methodName, throttledMethod);
        }

        return throttledMethod.apply(this.component, args);
    }

    /**
     * Removes a specific throttled method
     * @param {string} methodName - Name of the method to remove
     * @returns {boolean} True if the method was removed, false if it didn't exist
     */
    removeThrottledMethod(methodName) {
        return this.throttledMethods.delete(methodName);
    }

    /**
     * Clears all throttled method references
     */
    cleanup() {
        this.throttledMethods.clear();
    }
}
