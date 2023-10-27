import { AceBaseUser } from './user';
import type { AceBaseClient } from './acebase-client';
import { IAceBaseAuthProviderSignInResult } from './api-web';
/**
 * User authentication methods
 */
export declare class AceBaseClientAuth {
    private client;
    private eventCallback;
    /**
     * Currently signed in user
     */
    user: AceBaseUser | null;
    /**
     * Access token of currently signed in user
     */
    accessToken: string | null;
    constructor(client: AceBaseClient, eventCallback: (event: string, data: any) => void);
    /**
     * Sign into a user account using a username and password
     * @param username A database username
     * @param password The password
     * @returns returns a promise that resolves with the signed in user and access token
     */
    signIn(username: string, password: string): Promise<{
        user: AceBaseUser;
        accessToken: string;
    }>;
    /**
     * Sign into a user account using a username and password
     * @param email An email address
     * @param password The password
     * @returns returns a promise that resolves with the signed in user and access token
     */
    signInWithEmail(email: string, password: string): Promise<{
        user: AceBaseUser;
        accessToken: string;
    }>;
    /**
     * Sign into an account using a previously acquired access token
     * @param accessToken a previously acquired access token
     * @returns returns a promise that resolves with the signed in user and access token. If the token is not right, the thrown `error.code` will be `'not_found'` or `'invalid_token'`
     */
    signInWithToken(accessToken: string): Promise<{
        user: AceBaseUser;
        accessToken: string;
    }>;
    /**
     * If the client is offline, you can specify an access token to automatically try signing in the user once a connection is made.
     * Doing this is recommended if you are subscribing to event paths that require user authentication/authorization. Subscribing to
     * those server events will then be done after signing in, instead of failing after connecting anonymously.
     * @param accessToken A previously acquired access token
     */
    setAccessToken(accessToken: string): void;
    /**
     * If the server has been configured with OAuth providers, use this to kick off the authentication flow.
     * This method returs a Promise that resolves with the url you have to redirect your user to authenticate
     * with the requested provider. After the user has authenticated, they will be redirected back to your callbackUrl.
     * Your code in the callbackUrl will have to call finishOAuthProviderSignIn with the result querystring parameter
     * to finish signing in.
     * @param providerName one of the configured providers (eg 'facebook', 'google', 'apple', 'spotify')
     * @param callbackUrl url on your website/app that will receive the sign in result
     * @param options optional provider specific authentication settings
     * @returns returns a Promise that resolves with the url you have to redirect your user to.
     */
    startAuthProviderSignIn(providerName: string, callbackUrl: string, options?: any): Promise<string>;
    /**
     * Use this method to finish OAuth flow from your callbackUrl.
     * @param callbackResult result received in your.callback/url?result
     */
    finishAuthProviderSignIn(callbackResult: string): Promise<IAceBaseAuthProviderSignInResult>;
    /**
     * Refreshes an expiring access token with the refresh token returned from finishAuthProviderSignIn
     */
    refreshAuthProviderToken(providerName: string, refreshToken: string): Promise<{
        provider: import("./api-web").IAceBaseAuthProviderTokens;
    }>;
    /**
     * Signs in with an external auth provider by redirecting the user to the provider's login page.
     * After signing in, the user will be redirected to the current browser url. Execute
     * getRedirectResult() when your page is loaded again to check if the user was authenticated.
     */
    signInWithRedirect(providerName: string): Promise<void>;
    /**
     * Checks if the user authentication with an auth provider.
     */
    getRedirectResult(): Promise<IAceBaseAuthProviderSignInResult | null>;
    /**
     * Signs out of the current account
     * @param options options object, or boolean specifying whether to signout everywhere
     * @returnsreturns a promise that resolves when user was signed out successfully
     */
    signOut(options?: boolean | {
        /**
         * whether to sign out all clients, or only this one
         */
        everywhere?: boolean;
        /**
         * if cache database is used: whether to clear cached data
         * (recommended, currently not enabled by default, might change in next major version)
         */
        clearCache?: boolean;
    }): Promise<void>;
    /**
     * Changes the password of the currently signed into account
     * @param oldPassword
     * @param newPassword
     * @returns returns a promise that resolves with a new access token
     */
    changePassword(oldPassword: string, newPassword: string): Promise<{
        accessToken: string;
    }>;
    /**
     * Requests a password reset for the account with specified email address
     * @param email
     * @returns returns a promise that resolves once the request has been processed
     */
    forgotPassword(email: string): Promise<void>;
    /**
     * Requests a password to be changed using a previously acquired reset code, sent to the email address with `forgotPassword`
     * @param resetCode code sent to the user
     * @param newPassword new password chosen by the user
     * @returns returns a promise that resolves once the password has been changed. The user is now able to sign in with the new password
     */
    resetPassword(resetCode: string, newPassword: string): Promise<void>;
    /**
     * Verifies an e-mail address using the code sent to the email address upon signing up
     * @param verificationCode
     * @returns returns a promise that resolves when verification was successful
     */
    verifyEmailAddress(verificationCode: string): Promise<void>;
    /**
     * Updates one or more user account details
     * @returns returns a promise with the updated user details
     */
    updateUserDetails(details: {
        /**
         * New username
         */
        username?: string;
        /**
         * New email address
         */
        email?: string;
        /**
         * New display name
         */
        display_name?: string;
        /**
         * New profile picture
         */
        picture?: {
            url: string;
            width: number;
            height: number;
        };
        /**
         * Selection of user settings to update
         */
        settings?: Record<string, boolean | string | number>;
    }): Promise<{
        user: null;
    } | {
        user: AceBaseUser;
    }>;
    /**
     * Changes the username of the currrently signed into account
     * @returns returns a promise that resolves with the updated user details
     */
    changeUsername(newUsername: string): Promise<{
        user: null;
    } | {
        user: AceBaseUser;
    }>;
    /**
     * Changes the display name of the currrently signed into account
     * @param newName
     * @returns returns a promise that resolves with the updated user details
     */
    changeDisplayName(newName: string): Promise<{
        user: null;
    } | {
        user: AceBaseUser;
    }>;
    /**
     * Changes the email address of the currrently signed in user
     * @param newEmail
     * @returns returns a promise that resolves with the updated user details
     */
    changeEmail(newEmail: string): Promise<{
        user: null;
    } | {
        user: AceBaseUser;
    }>;
    /**
     * Changes the user's profile picture
     * @returns returns a promise that resolves with the updated user details
     */
    changePicture(newPicture: {
        url: string;
        width: number;
        height: number;
    }): Promise<{
        user: null;
    } | {
        user: AceBaseUser;
    }>;
    /**
     * Updates settings of the currrently signed in user. Passed settings will be merged with the user's current settings
     * @param settings the settings to update
     * @returns returns a promise that resolves with the updated user details
     */
    updateUserSettings(settings: Record<string, string | number | boolean>): Promise<{
        user: null;
    } | {
        user: AceBaseUser;
    }>;
    /**
     * Creates a new user account with the given details. If successful, you will automatically be
     * signed into the account. Note: the request will fail if the server has disabled this option
     * @returns returns a promise that resolves with the signed in user and access token
     */
    signUp(details: ({
        username: string;
        email?: string;
    } | {
        username?: string;
        email: string;
    }) & {
        password: string;
        displayName: string;
        /**
         * optional settings
         */
        settings?: Record<string, string | number | boolean>;
    }): Promise<{
        user: AceBaseUser;
        accessToken?: string;
    }>;
    /**
     * Removes the currently signed in user account and signs out. Note: this will only
     * remove the database user account, not any data stored in the database by this user. It is
     * your own responsibility to remove that data.
     * @param uid for admin user only: remove account with specific uid
     */
    deleteAccount(uid?: string): Promise<void>;
}
//# sourceMappingURL=auth.d.ts.map