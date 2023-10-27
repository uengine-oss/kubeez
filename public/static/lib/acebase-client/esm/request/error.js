export class AceBaseRequestError extends Error {
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
export const NOT_CONNECTED_ERROR_MESSAGE = 'remote database is not connected'; //'AceBaseClient is not connected';
//# sourceMappingURL=error.js.map