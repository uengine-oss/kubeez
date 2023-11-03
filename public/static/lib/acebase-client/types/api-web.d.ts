import { Api, EventSubscriptionCallback, DebugLogger, Query, QueryOptions, ValueChange, ValueMutation, Utils } from 'acebase-core';
import { AceBaseUser } from './user';
import { ConnectionSettings } from './acebase-client';
export interface IAceBaseAuthProviderSignInResult {
    user: AceBaseUser;
    accessToken: string;
    provider: IAceBaseAuthProviderTokens;
}
export interface IAceBaseAuthProviderTokens {
    name: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}
declare type EventSubscriptionSettings = {
    newOnly: boolean;
    cancelCallback: (reason: Error) => any;
    syncFallback: 'reload' | (() => any | Promise<any>);
};
export declare type HttpMethod = 'get' | 'post' | 'put' | 'delete';
/**
 * Api to connect to a remote AceBase server over http(s)
 */
export declare class WebApi extends Api {
    private dbname;
    private settings;
    private _id;
    private socket;
    private _autoConnect;
    private _autoConnectDelay;
    private _connectionState;
    private _serverVersion;
    private _cursor;
    /**
     * Allow cursor used for synchronization to be changed. Should only be done while not connected.
     */
    setSyncCursor(cursor: string | null): void;
    getSyncCursor(): string | null;
    private _eventTimeline;
    get host(): string;
    get url(): string;
    private _updateCursor;
    private _cache?;
    private get hasCache();
    private get cache();
    private _subscriptions;
    private _realtimeQueries;
    private debug;
    private accessToken;
    private manualConnectionMonitor;
    private eventCallback;
    constructor(dbname: string, settings: Pick<ConnectionSettings, 'network' | 'sync' | 'logLevel' | 'autoConnect' | 'autoConnectDelay' | 'cache' | 'rootPath'> & {
        debug: DebugLogger;
        url: string;
    }, callback: (event: string, ...args: any[]) => void);
    private checkConnection;
    private _handleDetectedDisconnect;
    connect(retry?: boolean): Promise<void>;
    disconnect(): void;
    subscribe(path: string, event: string, callback: EventSubscriptionCallback, settings: EventSubscriptionSettings): Promise<void>;
    unsubscribe(path: string, event?: string, callback?: EventSubscriptionCallback): Promise<void>;
    transaction(path: string, callback: (val: any) => any, options?: {
        context: any;
    }): Promise<{
        cursor?: string;
    }>;
    /**
     * @returns returns a promise that resolves with the returned data, or (when options.includeContext === true) an object containing data and returned context
     */
    private _request;
    private handleSignInResult;
    signIn(username: string, password: string): Promise<IAceBaseAuthProviderSignInResult>;
    signInWithEmail(email: string, password: string): Promise<IAceBaseAuthProviderSignInResult>;
    signInWithToken(token: string, emitEvent?: boolean): Promise<IAceBaseAuthProviderSignInResult>;
    setAccessToken(token: string): void;
    startAuthProviderSignIn(providerName: string, callbackUrl: string, options: any): Promise<{
        redirectUrl: any;
    }>;
    finishAuthProviderSignIn(callbackResult: string): Promise<IAceBaseAuthProviderSignInResult>;
    refreshAuthProviderToken(providerName: string, refreshToken: string): Promise<{
        provider: IAceBaseAuthProviderTokens;
    }>;
    signOut(options: boolean | {
        everywhere?: boolean;
        clearCache?: boolean;
    }): Promise<void>;
    changePassword(uid: string, currentPassword: string, newPassword: string): Promise<{
        accessToken: string;
    }>;
    forgotPassword(email: string): Promise<any>;
    verifyEmailAddress(verificationCode: string): Promise<any>;
    resetPassword(resetCode: string, newPassword: string): Promise<any>;
    signUp(details: any, signIn?: boolean): Promise<IAceBaseAuthProviderSignInResult | {
        user: AceBaseUser;
        accessToken: string | null;
    }>;
    updateUserDetails(details: any): Promise<{
        user: AceBaseUser;
    }>;
    deleteAccount(uid: string, signOut?: boolean): Promise<boolean>;
    get isConnected(): boolean;
    get isConnecting(): boolean;
    get connectionState(): "disconnected" | "connecting" | "connected" | "disconnecting";
    stats(options?: any): Promise<any>;
    sync(options?: {
        firstSync?: boolean;
        fetchFreshData?: boolean;
        /** TODO: fire events on instance instead of custom callback? */
        eventCallback?: ((event: string, data?: any) => void) | null;
    }): Promise<{
        local: number;
        remote: number;
        method: string;
        cursor: string | null;
    }>;
    /**
     * Gets all relevant mutations for specific events on a path and since specified cursor
     */
    getMutations(filter: {
        /**
         * path to get all mutations for, only used if `for` property isn't used
         */
        path?: string;
        /**
         * paths and events to get relevant mutations for
         */
        for?: Array<{
            path: string;
            events: string[];
        }>;
        /**
         * cursor to use
         */
        cursor?: string | null;
        /**
         * timestamp to use
         */
        timestamp?: number;
    }): Promise<{
        used_cursor: string | null;
        new_cursor: string;
        mutations: ValueMutation[];
    }>;
    /**
     * Gets all relevant effective changes for specific events on a path and since specified cursor
     */
    getChanges(filter: {
        /**
         * path to get changes for, only used if `for` property isn't used
         */
        path?: string;
        /**
         * paths and events to get relevant changes for
         */
        for?: Array<{
            path: string;
            events: string[];
        }>;
        /**
         * cursor to use
         */
        cursor?: string | null;
        /**
         * timestamp to use
         */
        timestamp?: number;
    }): Promise<{
        used_cursor: string | null;
        new_cursor: string;
        changes: ValueChange[];
    }>;
    _addCacheSetMutation(path: string, value: any, context: any): Promise<{
        cursor?: string | undefined;
    } | undefined>;
    set(path: string, value: any, options?: {
        allow_cache?: boolean;
        context?: any;
    }): Promise<{
        cursor?: string;
    }>;
    update(path: string, updates: Record<string | number, any>, options?: {
        allow_cache?: boolean;
        context?: any;
    }): Promise<{
        cursor?: string;
    }>;
    /**
     * @returns Returns a promise that resolves with the value, context and optionally a server cursor
     */
    get(path: string, options?: {
        /**
         * If a cached value is allowed or forced to be served.
         * @default 'allow'
         */
        cache_mode?: 'allow' | 'bypass' | 'force';
        /**
         * Use a cursor to update the local cache with mutations from the server, then load and serve the entire value from cache.
         * Only works in combination with `cache_mode: 'allow'` (previously `allow_cache: true`)
         */
        cache_cursor?: string;
        /**
         * @deprecated use `cache_mode` option instead
         */
        allow_cache?: boolean;
        include?: (string | number)[];
        exclude?: (string | number)[];
        child_objects?: boolean;
    }): Promise<{
        value: any;
        context: any;
        cursor?: string;
    }>;
    exists(path: string, options?: {
        allow_cache: boolean;
    }): Promise<boolean>;
    callExtension(method: HttpMethod | Uppercase<HttpMethod>, path: string, data?: any): Promise<any>;
    /**
     * Clears the entire cache, or a specific path without raising any events
     */
    clearCache(path?: string): Promise<{
        cursor?: string | undefined;
    } | undefined>;
    /**
     * Updates the local cache with remote changes by retrieving all mutations to `path` since given `cursor` and applying them to the local cache database.
     * If the local path does not exist or no cursor is given, its entire value will be loaded from the server and stored in cache. If no cache database is used, an error will be thrown.
     */
    updateCache(
    /**
     * Path to update. The root path will be used if not given, synchronizing the entire database.
     */
    path: string | undefined, 
    /**
     * A previously acquired cursor to update the cache with. If not specified, `path`'s entire value will be loaded from the server
     */
    cursor: string | null): Promise<{
        path: string;
        used_cursor: string | null;
        new_cursor: string;
        loaded_value: boolean;
        changes: Array<{
            path: string;
            previous: any;
            value: any;
            context: any;
        }>;
    }>;
    /**
     * @returns returns a promise that resolves with matching data or paths in `results`
     */
    query(path: string, query: Query, options?: QueryOptions): Promise<{
        results: Array<{
            path: string;
            val: any;
        }> | string[];
        context: any;
        stop(): Promise<void>;
    }>;
    createIndex(path: string, key: string, options: any): Promise<any>;
    getIndexes(): Promise<any>;
    deleteIndex(fileName: string): Promise<any>;
    reflect(path: string, type: 'info' | 'children', args: any): Promise<any>;
    export(path: string, write: (chunk: string) => Promise<void>, options?: {
        format: string;
        type_safe: boolean;
    }): ReturnType<Api['export']>;
    import(path: string, read: (length: number) => string | Utils.TypedArrayLike | Promise<string | Utils.TypedArrayLike>, options?: {
        format: string;
        suppress_events: boolean;
    }): Promise<any>;
    get serverPingUrl(): string;
    getServerInfo(): Promise<any>;
    setSchema(path: string, schema: string | Record<string, any>): Promise<any>;
    getSchema(path: string): Promise<any>;
    getSchemas(): Promise<any>;
    validateSchema(path: string, value: any, isUpdate: boolean): ReturnType<Api['validateSchema']>;
}
export {};
//# sourceMappingURL=api-web.d.ts.map