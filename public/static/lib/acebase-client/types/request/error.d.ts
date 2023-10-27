export declare class AceBaseRequestError extends Error {
    request: any;
    response: any;
    code?: string | number | undefined;
    message: string;
    get isNetworkError(): boolean;
    constructor(request: any, response: any, code?: string | number | undefined, message?: string);
}
export declare const NOT_CONNECTED_ERROR_MESSAGE = "remote database is not connected";
//# sourceMappingURL=error.d.ts.map