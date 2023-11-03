"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedValueUnavailableError = void 0;
class CachedValueUnavailableError extends Error {
    constructor(path, message) {
        super(message || `Value for path "/${path}" is not available in cache`);
        this.path = path;
    }
}
exports.CachedValueUnavailableError = CachedValueUnavailableError;
//# sourceMappingURL=errors.js.map