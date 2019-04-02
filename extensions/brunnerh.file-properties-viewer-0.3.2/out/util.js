"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Turns a function that has a (error, result) callback as last argument into a promise. */
function promisify(fun) {
    const _this = this;
    return (...args) => {
        while (args.length < fun.length - 1)
            args.push(undefined);
        return new Promise((resolve, reject) => {
            fun.apply(_this, [...args, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                }]);
        });
    };
}
exports.promisify = promisify;
/**
 * Promise-based timeout function.
 * @param ms Timeout in milliseconds.
 */
function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}
exports.delay = delay;
//# sourceMappingURL=util.js.map