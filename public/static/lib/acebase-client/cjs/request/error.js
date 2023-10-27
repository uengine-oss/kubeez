"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOT_CONNECTED_ERROR_MESSAGE = exports.AceBaseRequestError = void 0;
class AceBaseRequestError extends Error {
    constructor(request, response, code, message = 'unknown error') {
        super(message);
        this.request = request;
        this.response = response;
        this.code = code;
        this.message = message;
    }
    get isNetworkError() {
        return this.response === null;
    }
}
exports.AceBaseRequestError = AceBaseRequestError;
exports.NOT_CONNECTED_ERROR_MESSAGE = 'remote database is not connected'; //'AceBaseClient is not connected';
//# sourceMappingURL=error.js.map