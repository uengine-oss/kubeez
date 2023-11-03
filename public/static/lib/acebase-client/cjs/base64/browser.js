"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = void 0;
function encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
exports.encode = encode;
function decode(base64) {
    return decodeURIComponent(escape(atob(base64)));
}
exports.decode = decode;
//# sourceMappingURL=browser.js.map