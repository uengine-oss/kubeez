"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseTimeout = exports.PromiseTimeoutError = void 0;
class PromiseTimeoutError extends Error {
}
exports.PromiseTimeoutError = PromiseTimeoutError;
function promiseTimeout(promise, ms, comment) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new PromiseTimeoutError(`Promise ${comment ? `"${comment}" ` : ''}timed out after ${ms}ms`)), ms);
        function success(result) {
            clearTimeout(timeout);
            resolve(result);
        }
        promise.then(success).catch(reject);
    });
}
exports.promiseTimeout = promiseTimeout;
//# sourceMappingURL=promise-timeout.js.map