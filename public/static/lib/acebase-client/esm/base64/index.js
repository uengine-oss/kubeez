export function encode(str) {
    return Buffer.from(str, 'utf8').toString('base64');
}
export function decode(base64) {
    return Buffer.from(base64, 'base64').toString('utf8');
}
//# sourceMappingURL=index.js.map