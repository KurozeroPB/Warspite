/**
 * Capitalize the first letter of a string
 * @returns {String}
 */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Wait x miliseconds
 * @param {Number} sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Async wrapper for forEach()
 * @param {Array} a
 * @param {Function} cb
 * @returns {Promise<any>}
 */
const foreachAsync = async (a, cb) => {
    for (let index = 0; index < a.length; index++) {
        await cb(a[index], index, a);
    }
};

module.exports = {
    sleep,
    foreachAsync
};
