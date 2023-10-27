export class AceBaseUser {
    constructor(user) {
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
        this.displayName = user.displayName ?? 'unknown';
        this.created = user.created ?? new Date(0).toISOString();
        this.settings = user.settings ?? {};
    }
}
//# sourceMappingURL=user.js.map