import { AceBaseBase, LoggingLevel, DataSnapshot } from 'acebase-core';
import { HttpMethod, WebApi } from './api-web';
import { AceBaseClientAuth } from './auth';
/**
 * Settings to connect to a remote AceBase server
 * @internal (for internal use only)
 */
export declare class ConnectionSettings {
    /**
     * Name of the database you want to access
     */
    dbname: string;
    /**
     * Host name, eg "localhost", or "mydb.domain.com"
     */
    host: string;
    /**
     * Port number the server is running on
     */
    port: number;
    /**
     * Use SSL (https) to access the server or not. Default: `true`
     * @default true
     */
    https: boolean;
    /**
     * Root path of the AceBase server instance. Specify this if the server's `rootPath` has been configured.
     * @default ''
     */
    rootPath: string;
    /**
     * Automatically connect to the server, or wait until `db.connect()` is called
     * @default true
     */
    autoConnect: boolean;
    /**
     * Delay in ms before auto connecting. Useful for testing scenarios where both server and client start at the same time, and server needs to come online first.
     * @default 0
     */
    autoConnectDelay: number;
    /**
     * Settings for local cache
     */
    cache: {
        /**
         * AceBase database to use as local cache. Any data loaded from the server is
         * automatically cached and become available offline. Any changes you make will
         * update both the server and the cache. When offline, all changes will be
         * synchronized with the server upon reconnect.
         */
        db: AceBaseBase | null;
        /**
         * Whether to use cache or not. This value can not be changed while running.
         * @default true
         */
        enabled: boolean;
        /**
         * Which database to use as primary target for getting and updating data.
         *
         * Using `'server'` (default) is recommended.
         *
         * Using `'cache'` will be faster, but has some disadvantages:
         * - When getting values, cache is not updated with server data so any remote changes
         *    will not be updated in cache unless you have change events setup, or fetch fresh
         *    data manually.
         * - When storing values, you won't know if the server update failed.
         *
         * Summary: use `'server'` unless you know what you're doing.
         * @default 'server'
         */
        priority: 'cache' | 'server';
    };
    /**
     * debug logging level
     */
    logLevel: LoggingLevel;
    /**
     * Settings for synchronization
     */
    sync: {
        /**
         * Determines when synchronization should execute:
         *
         * - after `"connect"` event
         * - after `"signin"` event
         * - `"manual"` with `client.sync()`, or
         * - `"auto"`, which is 2.5s after `"connect"` event, or immediately after `"signin"` event. (legacy, default behaviour)
         *
         * If your app needs to sync data that is only accessible to the signed in user, set this
         * to `"signin"`. If not, set this to `"connect"`. The `"auto"` setting is default and provided
         * for backward compatibility, but should only be used if you have no other option. If you want to manually
         * trigger synchronization with `client.sync()`, set this to `"manual"`
         * @default 'auto'
         */
        timing: 'connect' | 'signin' | 'auto' | 'manual';
        /**
         * Specifies whether to use cursor synchronization if transaction logging is enabled in the server configuration.
         * Synchronization with a cursor is faster and consumes (a lot) less bandwidth
         * @default true
         */
        useCursor: boolean;
    };
    /**
     * Network settings
     */
    network: {
        /**
         * Whether to actively monitor the network, checks connectivity with the server every `interval` seconds.
         * NOTE: disconnects to the server are discovered automatically under normal circumstances,
         * enabling this might cause disconnects to be detected earlier.
         *
         * Default is `false` if `realtime` is `true` (default) and vice versa
         */
        monitor: boolean;
        /**
         * Perform connectivity check every `interval` seconds if `monitor` is `true`. Default is `60`
         * @default 60
         */
        interval: number;
        /**
         * Transport methods to try connecting to the server for realtime event notifications (in specified order).
         * Default is `['websocket']` because websockets are now widely supported. Supported transport methods are
         * `"websocket"` and `"polling"`. Older versions of acebase-client used `['polling','websocket']`.
         * @default ['websocket']
         */
        transports: Array<'websocket' | 'polling'>;
        /**
         * Whether to connect to a server websocket to enable realtime event notifications. Default is `true`.
         * Disable this option if you only want to use the server's REST API.
         * @default true
         */
        realtime: boolean;
    };
    /**
     * You can turn this on if you are a sponsor. See https://github.com/appy-one/acebase/discussions/100 for more info
     */
    sponsor: boolean;
    constructor(settings: AceBaseClientConnectionSettings);
}
/**
 * Settings to connect to a remote AceBase server
 */
export declare type AceBaseClientConnectionSettings = Omit<Partial<ConnectionSettings>, 'dbname' | 'host' | 'port' | 'sync' | 'network' | 'cache'> & Pick<ConnectionSettings, 'dbname' | 'host' | 'port'> & {
    sync?: Partial<ConnectionSettings['sync']>;
    network?: Partial<ConnectionSettings['network']>;
    cache?: Partial<ConnectionSettings['cache']>;
};
/**
 * Cache settings to enable offline access and synchronization
 */
export declare type AceBaseClientCacheSettings = AceBaseClientConnectionSettings['cache'];
/**
 * Settings for synchronization between server and cache databases
 */
export declare type AceBaseClientSyncSettings = AceBaseClientConnectionSettings['sync'];
/**
 * AceBaseClient lets you connect to a remote (or local) AceBase server over http(s)
 */
export declare class AceBaseClient extends AceBaseBase {
    /**
     * @internal (for internal use)
     */
    api: WebApi;
    /**
     * User authentication methods
     */
    auth: AceBaseClientAuth;
    /**
     * Create a client to access an AceBase server
     */
    constructor(init: AceBaseClientConnectionSettings);
    /**
     * Initiates manual synchronization with the server of any paths with active event subscriptions. Use this if you have set the `sync.timing` connection setting to 'manual'
     */
    sync(): ReturnType<WebApi['sync']>;
    /**
     * Whether the client is connected to the server
     */
    get connected(): boolean;
    /**
     * Current connection state
     */
    get connectionState(): "disconnected" | "connecting" | "connected" | "disconnecting";
    /**
     * Manually connects to the server: use this if you have `autoConnect` disabled in your client config
     * @param retry Whether to keep retrying to connect if the connection fails. Default is `true`
     */
    connect(retry?: boolean): Promise<void>;
    /**
     * Disconnects from the server
     */
    disconnect(): void;
    /**
     * Disconnects from the server
     */
    close(): void;
    /**
     * Calls an extension method that was added to the connected server with the .extend method and returns the result
     * @param method method of your extension
     * @param path path of your extension
     * @param data data to post (put/post methods) or to add to querystring
     */
    callExtension(method: HttpMethod | Uppercase<HttpMethod>, path: string, data?: any): Promise<any>;
    /**
     * Gets the current sync cursor
     */
    getCursor(): string | null;
    /**
     * Sets the sync cursor to use
     */
    setCursor(cursor: string): void;
    /**
     * Cache specific operations
     */
    get cache(): {
        clear: (path?: string) => Promise<void>;
        update: (path?: string, cursor?: string | null) => Promise<{
            path: string;
            used_cursor: string | null;
            new_cursor: string;
            loaded_value: boolean;
            changes: {
                path: string;
                previous: any;
                value: any;
                context: any;
            }[];
        }>;
        get: (path: string, cursor?: string | null) => Promise<DataSnapshot>;
    };
}
//# sourceMappingURL=acebase-client.d.ts.map