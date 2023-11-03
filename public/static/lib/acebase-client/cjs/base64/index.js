"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = void 0;
function encode(str) {
    return Buffer.from(str, 'utf8').toString('base64');
}
exports.encode = encode;
function decode(base64) {
    return Buffer.from(base64, 'base64').toString('utf8');
}
exports.decode = decode;
//# sourceMappingURL=index.js.map