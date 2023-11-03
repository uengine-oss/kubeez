"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AceBaseUser = void 0;
class AceBaseUser {
    constructor(user) {
        var _a, _b, _c;
        /**
         * Whether the user's email address has been verified
         */
        this.emailVerified = false;
        /**
         * Whether the user has to change their password
         */
        this.changePassword = false;
        Object.assign(this, user);
        if (!user.uid) {
            throw new Error('User details is missing required uid field');
        }
        this.uid = user.uid;
        this.displayName = (_a = user.displayName) !== null && _a !== void 0 ? _a : 'unknown';
        this.created = (_b = user.created) !== null && _b !== void 0 ? _b : new Date(0).toISOString();
        this.settings = (_c = user.settings) !== null && _c !== void 0 ? _c : {};
    }
}
exports.AceBaseUser = AceBaseUser;
//# sourceMappingURL=user.js.map