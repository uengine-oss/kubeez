export class CachedValueUnavailableError extends Error {
    constructor(path, message) {
        super(message || `Value for path "/${path}" is not available in cache`);
        this.path = path;
    }
}
//# sourceMappingURL=errors.js.map