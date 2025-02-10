/**
 * Creates a throttled version of the callback that executes at most once per
 * specified delay.
 *
 * @param {Function} callback - The function to be throttled.
 * @param {number} [duration=400] - The duration in milliseconds during which the callback is inactive.
 * @returns {Function} A throttled function.
 */
exports.throttle = (callback, duration = 400) => {
    let inThrottle = false;

    return function (...args) {
        if (!inThrottle) {
            callback.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), duration);
        }
    };
};
