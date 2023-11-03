(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.acebaseclient = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AceBaseClient = exports.ConnectionSettings = void 0;
const acebase_core_1 = require("acebase-core");
const api_web_1 = require("./api-web");
const auth_1 = require("./auth");
const server_date_1 = require("./server-date");
/**
 * Settings to connect to a remote AceBase server
 * @internal (for internal use only)
 */
class ConnectionSettings {
    constructor(settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        /**
         * Use SSL (https) to access the server or not. Default: `true`
         * @default true
         */
        this.https = true;
        /**
         * Root path of the AceBase server instance. Specify this if the server's `rootPath` has been configured.
         * @default ''
         */
        this.rootPath = '';
        /**
         * Automatically connect to the server, or wait until `db.connect()` is called
         * @default true
         */
        this.autoConnect = true;
        /**
         * Delay in ms before auto connecting. Useful for testing scenarios where both server and client start at the same time, and server needs to come online first.
         * @default 0
         */
        this.autoConnectDelay = 0;
        /**
         * debug logging level
         */
        this.logLevel = 'log';
        this.dbname = settings.dbname;
        this.host = settings.host;
        this.port = settings.port;
        this.https = typeof settings.https === 'boolean' ? settings.https : true;
        if (typeof settings.rootPath === 'string') {
            this.rootPath = settings.rootPath.replace(/^\/|\/$/g, '');
        }
        this.autoConnect = typeof settings.autoConnect === 'boolean' ? settings.autoConnect : true;
        this.autoConnectDelay = typeof settings.autoConnectDelay === 'number' ? settings.autoConnectDelay : 0;
        this.logLevel = typeof settings.logLevel === 'string' ? settings.logLevel : 'log';
        this.sponsor = typeof settings.sponsor === 'boolean' ? settings.sponsor : false;
        // Set cache settings
        this.cache = {
            enabled: typeof ((_a = settings.cache) === null || _a === void 0 ? void 0 : _a.db) !== 'object' ? false : typeof ((_b = settings.cache) === null || _b === void 0 ? void 0 : _b.enabled) === 'boolean' ? settings.cache.enabled : true,
            db: typeof ((_c = settings.cache) === null || _c === void 0 ? void 0 : _c.db) === 'object' ? settings.cache.db : null,
            priority: typeof ((_d = settings.cache) === null || _d === void 0 ? void 0 : _d.priority) === 'string' && ['server', 'cache'].includes(settings.cache.priority) ? settings.cache.priority : 'server',
        };
        // Set sync settings
        this.sync = {
            timing: typeof ((_e = settings.sync) === null || _e === void 0 ? void 0 : _e.timing) === 'string' && ['connect', 'signin', 'auto', 'manual'].includes(settings.sync.timing) ? settings.sync.timing : 'auto',
            useCursor: typeof ((_f = settings.sync) === null || _f === void 0 ? void 0 : _f.useCursor) === 'boolean' ? settings.sync.useCursor : true,
        };
        // Set network settings
        const realtime = typeof ((_g = settings.network) === null || _g === void 0 ? void 0 : _g.realtime) === 'boolean' ? settings.network.realtime : true;
        this.network = {
            transports: ((_h = settings.network) === null || _h === void 0 ? void 0 : _h.transports) instanceof Array ? settings.network.transports : ['websocket'],
            realtime,
            monitor: typeof ((_j = settings.network) === null || _j === void 0 ? void 0 : _j.monitor) === 'boolean' ? settings.network.monitor : !realtime,
            interval: typeof ((_k = settings.network) === null || _k === void 0 ? void 0 : _k.interval) === 'number' ? settings.network.interval : 60,
        };
    }
}
exports.ConnectionSettings = ConnectionSettings;
/**
 * AceBaseClient lets you connect to a remote (or local) AceBase server over http(s)
 */
class AceBaseClient extends acebase_core_1.AceBaseBase {
    /**
     * Create a client to access an AceBase server
     */
    constructor(init) {
        var _a;
        if (typeof init !== 'object') {
            // Use old constructor signature: host, port, dbname, https = true
            // eslint-disable-next-line prefer-rest-params
            const [host, port, dbname, https] = arguments;
            init = { host, port, dbname, https };
        }
        const settings = new ConnectionSettings(init); // init instanceof ConnectionSettings ? init : new ConnectionSettings(init);
        super(settings.dbname, { info: 'realtime database client', sponsor: settings.sponsor });
        /*
            TODO: improve init flow with await/async (requires Node 7.6+)
        */
        const cacheDb = (_a = settings.cache) === null || _a === void 0 ? void 0 : _a.db;
        const cacheReadyPromise = cacheDb ? cacheDb.ready() : Promise.resolve();
        let ready = false;
        this.on('ready', () => { ready = true; });
        this.debug = new acebase_core_1.DebugLogger(settings.logLevel, `[${settings.dbname}]`.colorize(acebase_core_1.ColorStyle.blue)); // `[ ${settings.dbname} ]`
        const synchronizeClocks = async () => {
            // Synchronize date/time
            // const start = Date.now(); // performance.now();
            const info = await this.api.getServerInfo();
            const now = Date.now(), 
            // roundtrip = now - start, //performance.now() - start,
            // expectedTime = now - Math.floor(roundtrip / 2),
            // bias = info.time - expectedTime;
            bias = info.time - now;
            (0, server_date_1.setServerBias)(bias);
        };
        this.on('connect', () => {
            // Disable cache db's ipc events, we are already notified of data changes by the server (prevents double event callbacks)
            if (cacheDb && 'settings' in cacheDb) {
                cacheDb.settings.ipcEvents = false;
            }
            synchronizeClocks();
        });
        this.on('disconnect', () => {
            // Enable cache db's ipc events, so we get event notifications of changes by other ipc peers while offline
            if (cacheDb && 'settings' in cacheDb) {
                cacheDb.settings.ipcEvents = true;
            }
        });
        this.sync = async () => {
            const result = await syncPendingChanges(true);
            return result;
        };
        let syncRunning = false, firstSync = true;
        const syncPendingChanges = async (throwErrors = false) => {
            if (syncRunning) {
                // Already syncing
                if (throwErrors) {
                    throw new Error('sync already running');
                }
                return;
            }
            if (!this.api.isConnected) {
                // We'll retry once connected
                // // Do set firstSync to false, this fixes the issue of the first sync firing after
                // // an initial succesful connection, but quick disconnect (sync does not run)
                // // and later reconnect --> Fresh data needs to be loaded
                // firstSync = false;
                if (throwErrors) {
                    throw new Error('not connected');
                }
                return;
            }
            syncRunning = true;
            try {
                await cacheReadyPromise;
                return await this.api.sync({
                    firstSync,
                    fetchFreshData: !firstSync,
                    eventCallback: (eventName, args) => {
                        this.debug.log(eventName, args || '');
                        this.emit(eventName, args); // this.emit('cache_sync_event', { name: eventName, args });
                    },
                });
            }
            catch (err) {
                // Sync failed for some reason
                if (throwErrors) {
                    throw err;
                }
                else {
                    console.error(`Failed to synchronize:`, err);
                }
            }
            finally {
                syncRunning = false;
                firstSync = false;
            }
        };
        let syncTimeout;
        this.on('connect', () => {
            if (settings.sync.timing === 'connect' || (settings.sync.timing === 'signin' && this.auth.accessToken)) {
                syncPendingChanges();
            }
            else if (settings.sync.timing === 'auto') {
                syncTimeout && clearTimeout(syncTimeout);
                syncTimeout = setTimeout(syncPendingChanges, 2500); // Start sync with a short delay to allow client to sign in first
            }
        });
        this.on('signin', () => {
            if (settings.sync.timing === 'auto') {
                syncTimeout && clearTimeout(syncTimeout);
            }
            if (['auto', 'signin'].includes(settings.sync.timing)) {
                syncPendingChanges();
            }
        });
        const emitClientReady = async () => {
            if (cacheDb) {
                await cacheDb.ready();
            }
            this.emit('ready');
        };
        if (typeof process === 'object' && typeof (process === null || process === void 0 ? void 0 : process.on) === 'function') {
            // Enable graceful process exits, fixes #32
            process.on('SIGINT', () => {
                if (this.connected) {
                    this.debug.log('Received SIGINT, closing connection');
                    this.disconnect(); // Should be enough to exit process
                }
            });
        }
        this.api = new api_web_1.WebApi(settings.dbname, {
            network: settings.network,
            sync: settings.sync,
            logLevel: settings.logLevel,
            autoConnect: settings.autoConnect,
            autoConnectDelay: settings.autoConnectDelay,
            cache: settings.cache,
            debug: this.debug,
            url: `http${settings.https ? 's' : ''}://${settings.host}:${settings.port}`,
            rootPath: settings.rootPath,
        }, (evt, data) => {
            if (evt === 'connect') {
                this.emit('connect');
                if (!ready) {
                    emitClientReady();
                }
            }
            else if (evt === 'connect_error') {
                this.emit('connect_error', data);
                if (!ready && cacheDb) { // If cache db is used, we can work without connection
                    emitClientReady();
                }
            }
            else if (evt === 'disconnect') {
                this.emit('disconnect');
            }
        });
        this.auth = new auth_1.AceBaseClientAuth(this, (event, arg) => {
            this.emit(event, arg);
        });
    }
    /**
     * Initiates manual synchronization with the server of any paths with active event subscriptions. Use this if you have set the `sync.timing` connection setting to 'manual'
     */
    async sync() {
        throw new Error('Must be set by constructor');
    }
    /**
     * Whether the client is connected to the server
     */
    get connected() {
        return this.api.isConnected;
    }
    /**
     * Current connection state
     */
    get connectionState() {
        return this.api.connectionState;
    }
    /**
     * Manually connects to the server: use this if you have `autoConnect` disabled in your client config
     * @param retry Whether to keep retrying to connect if the connection fails. Default is `true`
     */
    connect(retry = true) {
        return this.api.connect(retry);
    }
    /**
     * Disconnects from the server
     */
    disconnect() {
        this.api.disconnect();
    }
    /**
     * Disconnects from the server
     */
    close() {
        this.disconnect();
    }
    /**
     * Calls an extension method that was added to the connected server with the .extend method and returns the result
     * @param method method of your extension
     * @param path path of your extension
     * @param data data to post (put/post methods) or to add to querystring
     */
    callExtension(method, path, data) {
        return this.api.callExtension(method, path, data);
    }
    /**
     * Gets the current sync cursor
     */
    getCursor() {
        return this.api.getSyncCursor();
    }
    /**
     * Sets the sync cursor to use
     */
    setCursor(cursor) {
        this.api.setSyncCursor(cursor);
    }
    /**
     * Cache specific operations
     */
    get cache() {
        /**
         * Clears the entire cache, or a specific path without raising any events
         */
        const clear = async (path = '') => {
            await this.api.clearCache(path);
        };
        /**
         * Updates the local cache with remote changes by retrieving all mutations to `path` since given `cursor` and applying them to the local cache database.
         * If the local path does not exist or no cursor is given, its entire value will be loaded from the server and stored in cache. If no cache database is used, an error will be thrown.
         * All relevant event listeners will be triggered upon data changes.
         * @param path Path to update. The root path will be used if not given, synchronizing the entire database.
         * @param cursor A previously acquired cursor to update the cache with. If not specified or null, `path`'s entire value will be loaded from the server.
         */
        const update = (path = '', cursor = null) => {
            return this.api.updateCache(path, cursor);
        };
        /**
         * Loads a value from cache database. If a cursor is provided, the cache will be updated with remote changes
         * first. If the value is not available in cache, it will be loaded from the server and stored in cache.
         * This method is a shortcut for common cache logic provided by `db.ref(path).get` with the `cache_mode`
         * and `cache_cursor` options.
         * @param path target path to load
         * @param cursor A previously acquired cursor
         * @returns Returns a Promise that resolves with a snapshot of the value
         */
        const get = async (path, cursor = null) => {
            // Update the cache with provided cursor
            const options = Object.freeze(cursor ? { cache_mode: 'allow', cache_cursor: cursor } : { cache_mode: 'force' });
            const snap = await this.ref(path).get(options);
            return snap;
        };
        return { clear, update, get };
    }
}
exports.AceBaseClient = AceBaseClient;

}).call(this)}).call(this,require('_process'))
},{"./api-web":2,"./auth":3,"./server-date":12,"_process":40,"acebase-core":25}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebApi = void 0;
const acebase_core_1 = require("acebase-core");
const socket_io_client_1 = require("socket.io-client");
const Base64 = require("./base64");
const error_1 = require("./request/error");
const errors_1 = require("./errors");
const promise_timeout_1 = require("./promise-timeout");
const request_1 = require("./request");
const _websocketRequest = (socket, event, data, accessToken) => {
    if (!socket) {
        throw new Error(`Cannot send request because websocket connection is not open`);
    }
    const requestId = acebase_core_1.ID.generate();
    // const request = data;
    // request.req_id = requestId;
    // request.access_token = accessToken;
    const request = Object.assign(Object.assign({}, data), { req_id: requestId, access_token: accessToken });
    return new Promise((resolve, reject) => {
        if (!socket) {
            return reject(new error_1.AceBaseRequestError(request, null, 'websocket', 'No open websocket connection'));
        }
        let timeout;
        const send = (retry = 0) => {
            socket.emit(event, request);
            timeout = setTimeout(() => {
                if (retry < 2) {
                    return send(retry + 1);
                }
                socket.off('result', handle);
                const err = new error_1.AceBaseRequestError(request, null, 'timeout', `Server did not respond to "${event}" request after ${retry + 1} tries`);
                reject(err);
            }, 1000);
        };
        const handle = (response) => {
            if (response.req_id === requestId) {
                clearTimeout(timeout);
                socket.off('result', handle);
                if (response.success) {
                    return resolve(response);
                }
                // Access denied?
                const code = typeof response.reason === 'object' ? response.reason.code : response.reason;
                const message = typeof response.reason === 'object' ? response.reason.message : `request failed: ${code}`;
                const err = new error_1.AceBaseRequestError(request, response, code, message);
                reject(err);
            }
        };
        socket.on('result', handle);
        send();
    });
};
/**
 * TODO: Find out if we can use acebase-core's EventSubscription, extended with some properties
 */
class EventSubscription {
    constructor(path, event, callback, settings) {
        this.path = path;
        this.event = event;
        this.callback = callback;
        this.settings = settings;
        this.state = 'requested';
        this.added = Date.now();
        this.activated = 0;
        this.lastEvent = 0;
        this.lastSynced = 0;
        this.cursor = null;
        this.cacheCallback = null;
    }
    activate() {
        this.state = 'active';
        if (this.activated === 0) {
            this.activated = Date.now();
        }
    }
    cancel(reason) {
        this.state = 'canceled';
        this.settings.cancelCallback(reason);
    }
}
const CONNECTION_STATE_DISCONNECTED = 'disconnected';
const CONNECTION_STATE_CONNECTING = 'connecting';
const CONNECTION_STATE_CONNECTED = 'connected';
const CONNECTION_STATE_DISCONNECTING = 'disconnecting';
// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => { };
/**
 * Api to connect to a remote AceBase server over http(s)
 */
class WebApi extends acebase_core_1.Api {
    constructor(dbname = 'default', settings, callback) {
        // operations are done through http calls,
        // events are triggered through a websocket
        super();
        this.dbname = dbname;
        this.settings = settings;
        this._id = acebase_core_1.ID.generate(); // For mutation contexts, not using websocket client id because that might cause security issues
        this.socket = null;
        this._serverVersion = 'unknown';
        this._cursor = {
            /** Last cursor received by the server */
            current: null,
            /** Last cursor received before client went offline, will be used for sync. */
            sync: null,
        };
        this._eventTimeline = { init: Date.now(), connect: 0, signIn: 0, sync: 0, disconnect: 0 };
        this._subscriptions = {};
        this._realtimeQueries = {};
        this.accessToken = null;
        this.manualConnectionMonitor = new acebase_core_1.SimpleEventEmitter();
        this._id = acebase_core_1.ID.generate(); // For mutation contexts, not using websocket client id because that might cause security issues
        this._autoConnect = typeof settings.autoConnect === 'boolean' ? settings.autoConnect : true;
        this._autoConnectDelay = typeof settings.autoConnectDelay === 'number' ? settings.autoConnectDelay : 0;
        this._connectionState = CONNECTION_STATE_DISCONNECTED;
        if (settings.cache.enabled !== false) {
            this._cache = {
                db: settings.cache.db,
                priority: settings.cache.priority,
            };
        }
        if (settings.network.monitor) {
            // Mobile devices might go offline while the app is suspended (running in the backgound)
            // no events will fire and when the app resumes, it might assume it is still connected while
            // it is not. We'll manually poll the server to check the connection
            const interval = setInterval(() => this.checkConnection(), settings.network.interval * 1000); // ping every x seconds
            interval.unref && interval.unref();
        }
        this.debug = settings.debug;
        this.eventCallback = (event, ...args) => {
            if (event === 'disconnect') {
                this._cursor.sync = this._cursor.current;
            }
            callback && callback(event, ...args);
        };
        if (this._autoConnect) {
            if (this._autoConnectDelay) {
                setTimeout(() => this.connect().catch(NOOP), this._autoConnectDelay);
            }
            else {
                this.connect().catch(NOOP);
            }
        }
    }
    /**
     * Allow cursor used for synchronization to be changed. Should only be done while not connected.
     */
    setSyncCursor(cursor) {
        this._cursor.sync = cursor;
    }
    getSyncCursor() {
        return this._cursor.sync;
    }
    get host() { return this.settings.url; }
    get url() { return `${this.settings.url}${this.settings.rootPath ? `/${this.settings.rootPath}` : ''}`; }
    async _updateCursor(cursor) {
        if (!cursor || (this._cursor.current && cursor < this._cursor.current)) {
            return; // Just in case this ever happens, ignore events with earlier cursors.
        }
        this._cursor.current = cursor;
    }
    get hasCache() { return !!this._cache; }
    get cache() {
        if (!this._cache) {
            throw new Error('DEV ERROR: no cache db is used');
        }
        return this._cache;
    }
    async checkConnection() {
        var _a, _b;
        // Websocket connection is used
        if (((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.realtime) && !this.isConnected) {
            // socket.io handles reconnects, we don't have to monitor
            return;
        }
        if (!((_b = this.settings.network) === null || _b === void 0 ? void 0 : _b.realtime) && ![CONNECTION_STATE_CONNECTING, CONNECTION_STATE_CONNECTED].includes(this._connectionState)) {
            // No websocket connection. Do not check if we're not connecting or connected
            return;
        }
        const wasConnected = this.isConnected;
        try {
            // Websocket is connected (or realtime is not used), check connectivity to server by sending http/s ping
            await this._request({ url: this.serverPingUrl, ignoreConnectionState: true });
            if (!wasConnected) {
                this.manualConnectionMonitor.emit('connect');
            }
        }
        catch (err) {
            // No need to handle error here, _request will have handled the disconnect by calling this._handleDetectedDisconnect
        }
    }
    _handleDetectedDisconnect(err) {
        var _a;
        if ((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.realtime) {
            // Launch reconnect flow by recycling the websocket
            this._connectionState === CONNECTION_STATE_DISCONNECTED;
            this.connect().catch(NOOP);
            // console.assert(this._connectionState === CONNECTION_STATE_CONNECTING, 'wrong connection state');
        }
        else {
            if (this._connectionState === CONNECTION_STATE_CONNECTING) {
                this.manualConnectionMonitor.emit('connect_error', err);
            }
            else if (this._connectionState === CONNECTION_STATE_CONNECTED) {
                this.manualConnectionMonitor.emit('disconnect');
            }
        }
    }
    connect(retry = true) {
        var _a;
        if (this.socket !== null && typeof this.socket === 'object') {
            this.disconnect();
        }
        this._connectionState = CONNECTION_STATE_CONNECTING;
        this.debug.log(`Connecting to AceBase server "${this.url}"`);
        if (!this.url.startsWith('https')) {
            this.debug.warn(`WARNING: The server you are connecting to does not use https, any data transferred may be intercepted!`.colorize(acebase_core_1.ColorStyle.red));
        }
        // Change default socket.io (engine.io) transports setting of ['polling', 'websocket']
        // We should only use websocket (it's almost 2022!), because if an AceBaseServer is running in a cluster,
        // polling should be disabled entirely because the server is not stateless: the client might reach
        // a different node on a next long-poll connection.
        // For backward compatibility the transports setting is allowed to be overriden with a setting:
        const transports = ((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.transports) instanceof Array
            ? this.settings.network.transports
            : ['websocket'];
        this.debug.log(`Using ${transports.join(',')} transport${transports.length > 1 ? 's' : ''} for socket.io`);
        return new Promise((resolve, reject) => {
            var _a;
            if (!((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.realtime)) {
                // New option: not using websocket connection. Check if we can reach the server.
                // Make sure any previously attached events are removed
                this.manualConnectionMonitor.off('connect');
                this.manualConnectionMonitor.off('connect_error');
                this.manualConnectionMonitor.off('disconnect');
                this.manualConnectionMonitor.on('connect', () => {
                    this._connectionState = CONNECTION_STATE_CONNECTED;
                    this._eventTimeline.connect = Date.now();
                    this.manualConnectionMonitor.off('connect_error'); // prevent connect_error to fire after a successful connect
                    this.eventCallback('connect');
                    resolve();
                });
                this.manualConnectionMonitor.on('connect_error', (err) => {
                    // New connection failed to establish. Attempts will be made to reconnect, but fail for now
                    this.debug.error(`API connection error: ${err.message || err}`);
                    this.eventCallback('connect_error', err);
                    reject(err);
                });
                this.manualConnectionMonitor.on('disconnect', () => {
                    // Existing connection was broken, by us or network
                    if (this._connectionState === CONNECTION_STATE_DISCONNECTING) {
                        // Disconnect was requested by us: reason === 'client namespace disconnect'
                        this._connectionState = CONNECTION_STATE_DISCONNECTED;
                        // Remove event listeners
                        this.manualConnectionMonitor.off('connect');
                        this.manualConnectionMonitor.off('disconnect');
                        this.manualConnectionMonitor.off('connect_error');
                    }
                    else {
                        // Disconnect was not requested.
                        this._connectionState = CONNECTION_STATE_CONNECTING;
                        this._eventTimeline.disconnect = Date.now();
                    }
                    this.eventCallback('disconnect');
                });
                this._connectionState = CONNECTION_STATE_CONNECTING;
                return setTimeout(() => this.checkConnection(), 0);
            }
            const socket = this.socket = (0, socket_io_client_1.connect)(this.host, {
                // Use default socket.io connection settings:
                path: `/${this.settings.rootPath ? `${this.settings.rootPath}/` : ''}socket.io`,
                autoConnect: true,
                reconnection: retry,
                reconnectionAttempts: retry ? Infinity : 0,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                randomizationFactor: 0.5,
                transports, // Override default setting of ['polling', 'websocket']
            });
            socket.on('connect_error', (err) => {
                // New connection failed to establish. Attempts will be made to reconnect, but fail for now
                this.debug.error(`Websocket connection error: ${err}`);
                this.eventCallback('connect_error', err);
                reject(err);
            });
            socket.on('connect', async () => {
                this._connectionState = CONNECTION_STATE_CONNECTED;
                this._eventTimeline.connect = Date.now();
                if (this.accessToken) {
                    // User must be signed in again (NOTE: this does not emit the "signin" event if the user was signed in before)
                    const isFirstSignIn = this._eventTimeline.signIn === 0;
                    try {
                        await this.signInWithToken(this.accessToken, isFirstSignIn);
                    }
                    catch (err) {
                        this.debug.error(`Could not automatically sign in user with access token upon reconnect: ${err.code || err.message}`);
                    }
                }
                const subscribeTo = async (sub) => {
                    // Function is called for each unique path/event combination
                    // We must activate or cancel all subscriptions with this combination
                    const subs = this._subscriptions[sub.path].filter(s => s.event === sub.event);
                    try {
                        const result = await _websocketRequest(this.socket, 'subscribe', { path: sub.path, event: sub.event }, this.accessToken);
                        subs.forEach(s => s.activate());
                    }
                    catch (err) {
                        if (err.code === 'access_denied' && !this.accessToken) {
                            this.debug.error(`Could not subscribe to event "${sub.event}" on path "${sub.path}" because you are not signed in. If you added this event while offline and have a user access token, you can prevent this by using client.auth.setAccessToken(token) to automatically try signing in after connecting`);
                        }
                        else {
                            this.debug.error(err);
                        }
                        subs.forEach(s => s.cancel(err));
                    }
                };
                // (re)subscribe to any active subscriptions
                const subscribePromises = [];
                Object.keys(this._subscriptions).forEach(path => {
                    const events = [];
                    this._subscriptions[path].forEach(sub => {
                        if (sub.event === 'mutated') {
                            return;
                        } // Skip mutated events for now
                        const serverAlreadyNotifying = events.includes(sub.event);
                        if (!serverAlreadyNotifying) {
                            events.push(sub.event);
                            const promise = subscribeTo(sub);
                            subscribePromises.push(promise);
                        }
                    });
                });
                // Now, subscribe to all top path mutated events
                const subscribeToMutatedEvents = async () => {
                    let retry = false;
                    const promises = Object.keys(this._subscriptions)
                        .filter(path => this._subscriptions[path].some(sub => sub.event === 'mutated' && sub.state !== 'canceled'))
                        .filter((path, i, arr) => !arr.some(otherPath => acebase_core_1.PathInfo.get(otherPath).isAncestorOf(path)))
                        .reduce((topPaths, path) => (topPaths.includes(path) || topPaths.push(path)) && topPaths, [])
                        .map(topEventPath => {
                        const sub = this._subscriptions[topEventPath].find(s => s.event === 'mutated');
                        const promise = subscribeTo(sub).then(() => {
                            if (sub.state === 'canceled') {
                                // Oops, could not subscribe to 'mutated' event on topEventPath, other event(s) at child path(s) should now take over
                                retry = true;
                            }
                        });
                        return promise;
                    });
                    await Promise.all(promises);
                    if (retry) {
                        await subscribeToMutatedEvents();
                    }
                };
                subscribePromises.push(subscribeToMutatedEvents());
                await Promise.all(subscribePromises);
                this.eventCallback('connect'); // Safe to let client know we're connected
                resolve(); // Resolve the .connect() promise
            });
            socket.on('disconnect', (reason) => {
                this.debug.warn(`Websocket disconnected: ${reason}`);
                // Existing connection was broken, by us or network
                if (this._connectionState === CONNECTION_STATE_DISCONNECTING) {
                    // disconnect was requested by us: reason === 'client namespace disconnect'
                    this._connectionState = CONNECTION_STATE_DISCONNECTED;
                }
                else {
                    // Automatic reconnect should be done by socket.io
                    this._connectionState = CONNECTION_STATE_CONNECTING;
                    this._eventTimeline.disconnect = Date.now();
                    if (reason === 'io server disconnect') {
                        // if the server has shut down and disconnected all clients, we have to reconnect manually
                        this.socket = null;
                        this.connect().catch(err => {
                            // Immediate reconnect failed, which is ok.
                            // socket.io will retry now
                        });
                    }
                }
                this.eventCallback('disconnect');
            });
            socket.on('data-event', (data) => {
                var _a;
                const val = acebase_core_1.Transport.deserialize(data.val);
                const context = data.context || {};
                context.acebase_event_source = 'server';
                this._updateCursor(context.acebase_cursor); // If the server passes a cursor, it supports transaction logging. Save it for sync later on
                /*
                    Using the new context, we can determine how we should handle this data event.
                    From client v0.9.29 on, the set and update API methods add an acebase_mutation object
                    to the context with the following info:

                    client_id: which client initiated the mutation (web api instance, also different per browser tab)
                    id: a unique id of the mutation
                    op: operation used: 'set' or 'update'
                    path: the path the operation was executed on
                    flow: the flow used:
                        - 'server': app was connected, cache was not used.
                        - 'cache': app was offline while mutating, now syncs its change
                        - 'parallel': app was connected, cache was used and updated

                    To determine how to handle this data event, we have to know what events may have already
                    been fired.

                    [Mutation initiated:]
                        - Cache database used?
                            - No -> 'server' flow
                            - Yes -> Client was online/connected?
                                - No -> 'cache' flow (saved to cache db, sycing once connected)
                                - Yes -> 'parallel' flow

                    During 'cache' and 'parallel' flow, any change events will have fired on the cache database
                    already. If we are receiving this data event on the same client, that means we don't have to
                    fire those events again. If we receive this event on a different client, we only have to fire
                    events if they change cached data.

                    [Change event received:]
                        - Is mutation done by us?
                            - No -> Are we using cache?
                                - No -> Fire events
                                - Yes -> Update cache with events disabled*, fire events
                            - Yes -> Are we using cache?
                                - No -> Fire events ourself
                                - Yes -> Skip cache update, don't fire events (both done already)

                    * Different browser tabs use the same cache database. If we would let the cache database fire data change
                    events, they would only fire in 1 browser tab - the first one to update the cache, the others will see
                    no changes because the data will have been updated already.

                    NOTE: While offline, the in-memory state of 2 separate browser tabs will go out of sync
                    because they rely on change notifications from the server - to tackle this problem,
                    cross-tab communication has been implemented. (TODO: let cache db's use the same client
                    ID for server communications)
                */
                const causedByUs = ((_a = context.acebase_mutation) === null || _a === void 0 ? void 0 : _a.client_id) === this._id;
                const cacheEnabled = this.hasCache; //!!this._cache?.db;
                const fireThisEvent = !causedByUs || !cacheEnabled;
                const updateCache = !causedByUs && cacheEnabled;
                const fireCacheEvents = false; // See above flow documentation
                // console.log(`${this._cache ? `[${this._cache.db.api.storage.name}] ` : ''}Received data event "${data.event}" on path "${data.path}":`, val);
                // console.log(`Received data event "${data.event}" on path "${data.path}":`, val);
                const pathSubs = this._subscriptions[data.subscr_path];
                if (!pathSubs && data.event !== 'mutated') {
                    // NOTE: 'mutated' events fire on the mutated path itself. 'mutations' events fire on subscription path
                    // We are not subscribed on this path. Happens when an event fires while a server unsubscribe
                    // has been requested, but not processed yet: the local subscription will be gone already.
                    // This can be confusing when using cache, an unsubscribe may have been requested after a cache
                    // event fired - the server event will follow but we're not listening anymore!
                    // this.debug.warn(`Received a data-event on a path we did not subscribe to: "${data.subscr_path}"`);
                    return;
                }
                if (updateCache) {
                    if (data.path.startsWith('__')) {
                        // Don't cache private data. This happens when the admin user is signed in
                        // and has an event subscription on the root, or private path.
                        // NOTE: fireThisEvent === true, because it is impossible that this mutation was caused by us (well, it should be!)
                    }
                    else if (data.event === 'mutations') {
                        // Apply all mutations
                        const mutations = val.current;
                        mutations.forEach(m => {
                            const path = m.target.reduce((path, key) => acebase_core_1.PathInfo.getChildPath(path, key), acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, data.path));
                            this.cache.db.api.set(path, m.val, { suppress_events: !fireCacheEvents, context });
                        });
                    }
                    else if (data.event === 'notify_child_removed') {
                        this.cache.db.api.set(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, data.path), null, { suppress_events: !fireCacheEvents, context }); // Remove cached value
                    }
                    else if (!data.event.startsWith('notify_')) {
                        this.cache.db.api.set(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, data.path), val.current, { suppress_events: !fireCacheEvents, context }); // Update cached value
                    }
                }
                if (!fireThisEvent) {
                    return;
                }
                // The cache db will not have fired any events (const fireCacheEvents = false), so we can fire them here now.
                const targetSubs = data.event === 'mutated'
                    ? Object.keys(this._subscriptions)
                        .filter(path => {
                        const pathInfo = acebase_core_1.PathInfo.get(path);
                        return path === data.path || pathInfo.equals(data.subscr_path) || pathInfo.isAncestorOf(data.path);
                    })
                        .reduce((subs, path) => {
                        const add = this._subscriptions[path].filter(sub => sub.event === 'mutated');
                        subs.push(...add);
                        return subs;
                    }, [])
                    : pathSubs.filter(sub => sub.event === data.event);
                targetSubs.forEach(subscr => {
                    subscr.lastEvent = Date.now();
                    subscr.cursor = context.acebase_cursor;
                    subscr.callback(null, data.path, val.current, val.previous, context);
                });
            });
            socket.on('query-event', (data) => {
                data = acebase_core_1.Transport.deserialize(data);
                const query = this._realtimeQueries[data.query_id];
                let keepMonitoring = true;
                try {
                    keepMonitoring = query.options.eventHandler(data);
                }
                catch (err) {
                    keepMonitoring = false;
                }
                if (keepMonitoring === false) {
                    delete this._realtimeQueries[data.query_id];
                    socket.emit('query-unsubscribe', { query_id: data.query_id });
                }
            });
        });
    }
    disconnect() {
        var _a;
        if (!((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.realtime)) {
            // No websocket connectino is used
            this._connectionState = CONNECTION_STATE_DISCONNECTING;
            this._eventTimeline.disconnect = Date.now();
            this.manualConnectionMonitor.emit('disconnect');
        }
        else if (this.socket !== null && typeof this.socket === 'object') {
            if (this._connectionState === CONNECTION_STATE_CONNECTED) {
                this._eventTimeline.disconnect = Date.now();
            }
            this._connectionState = CONNECTION_STATE_DISCONNECTING;
            this.socket.close();
            this.socket = null;
        }
    }
    async subscribe(path, event, callback, settings) {
        var _a;
        if (!((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.realtime)) {
            throw new Error(`Cannot subscribe to realtime events because it has been disabled in the network settings`);
        }
        let pathSubs = this._subscriptions[path];
        if (!pathSubs) {
            pathSubs = this._subscriptions[path] = [];
        }
        const serverAlreadyNotifying = pathSubs.some(sub => sub.event === event)
            || (event === 'mutated' && Object.keys(this._subscriptions).some(otherPath => acebase_core_1.PathInfo.get(otherPath).isAncestorOf(path) && this._subscriptions[otherPath].some(sub => sub.event === event && sub.state === 'active')));
        const subscr = new EventSubscription(path, event, callback, settings);
        // { path, event, callback, settings, added: Date.now(), activate() { this.activated = Date.now() }, activated: null, lastEvent: null, cursor: null };
        pathSubs.push(subscr);
        if (this.hasCache) {
            // Events are also handled by cache db
            subscr.cacheCallback = (err, path, newValue, oldValue, context) => subscr.callback(err, path.slice(`${this.dbname}/cache/`.length), newValue, oldValue, context);
            this.cache.db.api.subscribe(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path), event, subscr.cacheCallback);
        }
        if (serverAlreadyNotifying || !this.isConnected) {
            // If we're offline, the event will be subscribed once connected
            return;
        }
        if (event === 'mutated') {
            // Unsubscribe from 'mutated' events set on descendant paths of current path
            Object.keys(this._subscriptions)
                .filter(otherPath => acebase_core_1.PathInfo.get(otherPath).isDescendantOf(path)
                && this._subscriptions[otherPath].some(sub => sub.event === 'mutated'))
                .map(path => _websocketRequest(this.socket, 'unsubscribe', { path, event: 'mutated' }, this.accessToken))
                .map(promise => promise.catch(err => console.error(err)));
        }
        const result = await _websocketRequest(this.socket, 'subscribe', { path, event }, this.accessToken);
        subscr.activate();
        // return result;
    }
    async unsubscribe(path, event, callback) {
        var _a;
        if (!((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.realtime)) {
            throw new Error(`Cannot unsubscribe from realtime events because it has been disabled in the network settings`);
        }
        const pathSubs = this._subscriptions[path];
        if (!pathSubs) {
            return Promise.resolve();
        }
        const unsubscribeFrom = (subscriptions) => {
            subscriptions.forEach(subscr => {
                pathSubs.splice(pathSubs.indexOf(subscr), 1);
                if (this.hasCache) {
                    // Events are also handled by cache db, also remove those
                    if (typeof subscr.cacheCallback !== 'function') {
                        throw new Error('DEV ERROR: When subscription was added, cacheCallback must have been set');
                    }
                    this.cache.db.api.unsubscribe(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path), subscr.event, subscr.cacheCallback);
                }
            });
        };
        const hadMutatedEvents = pathSubs.some(sub => sub.event === 'mutated');
        if (!event) {
            // Unsubscribe from all events on path
            unsubscribeFrom(pathSubs);
        }
        else if (!callback) {
            // Unsubscribe from specific event on path
            const subscriptions = pathSubs.filter(subscr => subscr.event === event);
            unsubscribeFrom(subscriptions);
        }
        else {
            // Unsubscribe from a specific callback on path event
            const subscriptions = pathSubs.filter(subscr => subscr.event === event && subscr.callback === callback);
            unsubscribeFrom(subscriptions);
        }
        const hasMutatedEvents = pathSubs.some(sub => sub.event === 'mutated');
        let promise = Promise.resolve();
        if (pathSubs.length === 0) {
            // Unsubscribed from all events on path
            delete this._subscriptions[path];
            if (this.isConnected) {
                promise = _websocketRequest(this.socket, 'unsubscribe', { path, access_token: this.accessToken }, this.accessToken)
                    .catch(err => this.debug.error(`Failed to unsubscribe from event(s) on "${path}": ${err.message}`));
            }
        }
        else if (this.isConnected && !pathSubs.some(subscr => subscr.event === event)) {
            // No callbacks left for specific event
            promise = _websocketRequest(this.socket, 'unsubscribe', { path: path, event, access_token: this.accessToken }, this.accessToken)
                .catch(err => this.debug.error(`Failed to unsubscribe from event "${event}" on "${path}": ${err.message}`));
        }
        if (this.isConnected && hadMutatedEvents && !hasMutatedEvents) {
            // If any descendant paths have mutated events, resubscribe those
            const promises = Object.keys(this._subscriptions)
                .filter(otherPath => acebase_core_1.PathInfo.get(otherPath).isDescendantOf(path) && this._subscriptions[otherPath].some(sub => sub.event === 'mutated'))
                .map(path => _websocketRequest(this.socket, 'subscribe', { path: path, event: 'mutated' }, this.accessToken))
                .map(promise => promise.catch(err => this.debug.error(`Failed to subscribe to event "${event}" on path "${path}": ${err.message}`)));
            promise = Promise.all([promise, ...promises]);
        }
        await promise;
    }
    transaction(path, callback, options = { context: {} }) {
        const id = acebase_core_1.ID.generate();
        options.context = options.context || {};
        // TODO: reduce this contextual overhead to 'client_id' only, or additional debugging info upon request
        options.context.acebase_mutation = {
            client_id: this._id,
            id,
            op: 'transaction',
            path,
            flow: 'server',
        };
        const cachePath = acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path);
        return new Promise(async (resolve, reject) => {
            var _a;
            let cacheUpdateVal;
            const handleSuccess = async (context) => {
                if (this.hasCache && typeof cacheUpdateVal !== 'undefined') {
                    // Update cache db value
                    await this.cache.db.api.set(cachePath, cacheUpdateVal);
                }
                resolve({ cursor: context === null || context === void 0 ? void 0 : context.acebase_cursor });
            };
            if (this.isConnected && ((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.realtime)) {
                // Use websocket connection
                const socket = this.socket;
                const startedCallback = async (data) => {
                    if (data.id === id) {
                        socket.off('tx_started', startedCallback);
                        const currentValue = acebase_core_1.Transport.deserialize(data.value);
                        let newValue = callback(currentValue);
                        if (newValue instanceof Promise) {
                            newValue = await newValue;
                        }
                        socket.emit('transaction', { action: 'finish', id: id, path, value: acebase_core_1.Transport.serialize(newValue), access_token: this.accessToken });
                        if (this.hasCache) {
                            cacheUpdateVal = newValue;
                        }
                    }
                };
                const completedCallback = (data) => {
                    if (data.id === id) {
                        socket.off('tx_completed', completedCallback);
                        socket.off('tx_error', errorCallback);
                        handleSuccess(data.context);
                    }
                };
                const errorCallback = (data) => {
                    if (data.id === id) {
                        socket.off('tx_started', startedCallback);
                        socket.off('tx_completed', completedCallback);
                        socket.off('tx_error', errorCallback);
                        reject(new Error(data.reason));
                    }
                };
                socket.on('tx_started', startedCallback);
                socket.on('tx_completed', completedCallback);
                socket.on('tx_error', errorCallback);
                // TODO: socket.on('disconnect', disconnectedCallback);
                socket.emit('transaction', { action: 'start', id, path, access_token: this.accessToken, context: options.context });
            }
            else {
                // Websocket not connected. Try http call instead
                const startData = JSON.stringify({ path });
                try {
                    const tx = await this._request({ ignoreConnectionState: true, method: 'POST', url: `${this.url}/transaction/${this.dbname}/start`, data: startData, context: options.context });
                    const id = tx.id;
                    const currentValue = acebase_core_1.Transport.deserialize(tx.value);
                    let newValue = callback(currentValue);
                    if (newValue instanceof Promise) {
                        newValue = await newValue;
                    }
                    if (this.hasCache) {
                        cacheUpdateVal = newValue;
                    }
                    const finishData = JSON.stringify({ id, value: acebase_core_1.Transport.serialize(newValue) });
                    const { context } = await this._request({ ignoreConnectionState: true, method: 'POST', url: `${this.url}/transaction/${this.dbname}/finish`, data: finishData, context: options.context, includeContext: true });
                    await handleSuccess(context);
                }
                catch (err) {
                    if (['ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED', 'EPIPE', 'fetch_failed'].includes(err.code)) {
                        err.message = error_1.NOT_CONNECTED_ERROR_MESSAGE;
                    }
                    reject(err);
                }
            }
        });
    }
    /**
     * @returns returns a promise that resolves with the returned data, or (when options.includeContext === true) an object containing data and returned context
     */
    async _request(options) {
        var _a;
        if (this.isConnected || options.ignoreConnectionState === true) {
            const result = await (async () => {
                try {
                    return await (0, request_1.default)(options.method || 'GET', options.url, { data: options.data, accessToken: this.accessToken, dataReceivedCallback: options.dataReceivedCallback, dataRequestCallback: options.dataRequestCallback, context: options.context });
                }
                catch (err) {
                    if (this.isConnected && err.isNetworkError) {
                        // This is a network error, but the websocket thinks we are still connected.
                        this.debug.warn(`A network error occurred loading ${options.url}`);
                        // Start reconnection flow
                        this._handleDetectedDisconnect(err);
                    }
                    // Rethrow the error
                    throw err;
                }
            })();
            if (result.context && result.context.acebase_cursor) {
                this._updateCursor(result.context.acebase_cursor);
            }
            if (options.includeContext === true) {
                if (!result.context) {
                    result.context = {};
                }
                return result;
            }
            else {
                return result.data;
            }
        }
        else {
            // We're not connected. We can wait for the connection to be established,
            // or fail the request now. Because we have now implemented caching, live requests
            // are only executed if they are not allowed to use cached responses. Wait for a
            // connection to be established (max 1s), then retry or fail
            if (!this.isConnecting || !((_a = this.settings.network) === null || _a === void 0 ? void 0 : _a.realtime)) {
                // We're currently not trying to connect, or not using websocket connection (normal connection logic is still used).
                // Fail now
                throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
            }
            const connectPromise = new Promise(resolve => { var _a; return (_a = this.socket) === null || _a === void 0 ? void 0 : _a.once('connect', resolve); });
            await (0, promise_timeout_1.promiseTimeout)(connectPromise, 1000, 'Waiting for connection').catch(err => {
                throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
            });
            return this._request(options); // Retry
        }
    }
    handleSignInResult(result, emitEvent = true) {
        var _a;
        this._eventTimeline.signIn = Date.now();
        const details = { user: result.user, accessToken: result.access_token, provider: result.provider || 'acebase' };
        this.accessToken = details.accessToken;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('signin', details.accessToken); // Make sure the connected websocket server knows who we are as well.
        emitEvent && this.eventCallback('signin', details);
        return details;
    }
    async signIn(username, password) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/signin`, data: { method: 'account', username, password, client_id: this.socket && this.socket.id } });
        return this.handleSignInResult(result);
    }
    async signInWithEmail(email, password) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/signin`, data: { method: 'email', email, password, client_id: this.socket && this.socket.id } });
        return this.handleSignInResult(result);
    }
    async signInWithToken(token, emitEvent = true) {
        if (!this.isConnected) {
            throw new Error('Cannot sign in because client is not connected to the server. If you want to automatically sign in the user with this access token once a connection is established, use client.auth.setAccessToken(token)');
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/signin`, data: { method: 'token', access_token: token, client_id: this.socket && this.socket.id } });
        return this.handleSignInResult(result, emitEvent);
    }
    setAccessToken(token) {
        this.accessToken = token;
    }
    async startAuthProviderSignIn(providerName, callbackUrl, options) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const optionParams = typeof options === 'object'
            ? '&' + Object.keys(options).map(key => `option_${key}=${encodeURIComponent(options[key])}`).join('&')
            : '';
        const result = await this._request({ url: `${this.url}/oauth2/${this.dbname}/init?provider=${providerName}&callbackUrl=${callbackUrl}${optionParams}` });
        return { redirectUrl: result.redirectUrl };
    }
    async finishAuthProviderSignIn(callbackResult) {
        let result;
        try {
            result = JSON.parse(Base64.decode(callbackResult));
        }
        catch (err) {
            throw new Error(`Invalid result`);
        }
        if (!result.user) {
            // AceBaseServer 1.9.0+ does not include user details in the redirect.
            // We must get (and validate) auth state with received access token
            this.accessToken = result.access_token;
            const authState = await this._request({ url: `${this.url}/auth/${this.dbname}/state` });
            if (!authState.signed_in) {
                this.accessToken = null;
                throw new Error(`Invalid access token received: not signed in`);
            }
            result.user = authState.user;
        }
        return this.handleSignInResult(result);
    }
    async refreshAuthProviderToken(providerName, refreshToken) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ url: `${this.url}/oauth2/${this.dbname}/refresh?provider=${providerName}&refresh_token=${refreshToken}` });
        return result;
    }
    async signOut(options) {
        if (typeof options === 'boolean') {
            // Old signature signOut(everywhere:boolean = false)
            options = { everywhere: options };
        }
        else if (typeof options !== 'object') {
            throw new TypeError('options must be an object');
        }
        if (typeof options.everywhere !== 'boolean') {
            options.everywhere = false;
        }
        if (typeof options.clearCache !== 'boolean') {
            options.clearCache = false;
        }
        if (!this.accessToken) {
            return;
        }
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/signout`, data: { client_id: this.socket && this.socket.id, everywhere: options.everywhere } });
        this.socket && this.socket.emit('signout', this.accessToken); // Make sure the connected websocket server knows we signed out as well.
        this.accessToken = null;
        if (this.hasCache && options.clearCache) {
            // Clear cache, but don't wait for it to finish
            this.clearCache().catch(err => {
                console.error(`Could not clear cache:`, err);
            });
        }
        this.eventCallback('signout');
    }
    async changePassword(uid, currentPassword, newPassword) {
        if (!this.accessToken) {
            throw new Error(`not_signed_in`);
        }
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/change_password`, data: { uid, password: currentPassword, new_password: newPassword } });
        this.accessToken = result.access_token;
        return { accessToken: this.accessToken };
    }
    async forgotPassword(email) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/forgot_password`, data: { email } });
        return result;
    }
    async verifyEmailAddress(verificationCode) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/verify_email`, data: { code: verificationCode } });
        return result;
    }
    async resetPassword(resetCode, newPassword) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/reset_password`, data: { code: resetCode, password: newPassword } });
        return result;
    }
    async signUp(details, signIn = true) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/signup`, data: details });
        if (signIn) {
            return this.handleSignInResult(result);
        }
        return { user: result.user, accessToken: this.accessToken };
    }
    async updateUserDetails(details) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/update`, data: details });
        return { user: result.user };
    }
    async deleteAccount(uid, signOut = true) {
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        const result = await this._request({ method: 'POST', url: `${this.url}/auth/${this.dbname}/delete`, data: { uid } });
        if (signOut) {
            this.socket && this.socket.emit('signout', this.accessToken);
            this.accessToken = null;
            this.eventCallback('signout');
        }
        return true;
    }
    get isConnected() {
        return this._connectionState === CONNECTION_STATE_CONNECTED;
    }
    get isConnecting() {
        return this._connectionState === CONNECTION_STATE_CONNECTING;
    }
    get connectionState() {
        return this._connectionState;
    }
    stats(options) {
        return this._request({ url: `${this.url}/stats/${this.dbname}` });
    }
    async sync(options = {
        firstSync: false,
        fetchFreshData: true,
        eventCallback: null,
    }) {
        var _a, _b, _c;
        // Sync cache
        if (!this.isConnected) {
            throw new Error(error_1.NOT_CONNECTED_ERROR_MESSAGE);
        }
        if (this.hasCache && !this.cache.db.isReady) {
            throw new Error(`cache database is not ready yet`);
        }
        this._eventTimeline.sync = Date.now();
        (_a = options.eventCallback) === null || _a === void 0 ? void 0 : _a.call(options, 'sync_start');
        const handleStatsUpdateError = (err) => {
            this.debug.error(`Failed to update cache db stats:`, err);
        };
        try {
            let totalPendingChanges = 0;
            const useCursor = ((_b = this.settings.sync) === null || _b === void 0 ? void 0 : _b.useCursor) !== false;
            const cursor = useCursor ? this._cursor.sync : null;
            if (this.hasCache) {
                // Part 1: PUSH local changes
                const cacheApi = this.cache.db.api;
                const { value, context } = await cacheApi.get(`${this.dbname}/pending`);
                const pendingChanges = value;
                cacheApi.set(`${this.dbname}/stats/last_sync_start`, new Date()).catch(handleStatsUpdateError);
                try {
                    const ids = Object.keys(pendingChanges || {}).sort(); // sort a-z, process oldest mutation first
                    const compatibilityMode = ids.map(id => pendingChanges[id]).some(m => m.type === 'update');
                    const mutations = compatibilityMode
                        ? ids.map(id => {
                            // If any "update" mutations are in the db, these are old mutations. Process them unaltered. This is for backward compatibility only, can be removed later. (if code was able to update, mutations could have already been synced too, right?)
                            const mutation = pendingChanges[id];
                            mutation.ids = [id];
                            return mutation;
                        })
                        : ids.reduce((mutations, id) => {
                            const change = pendingChanges[id];
                            console.assert(['set', 'remove'].includes(change.type), 'Only "set" and "remove" mutations should be present');
                            if (change.path === '') {
                                // 'set' on the root path - can't turn this into an update on the parent.
                                // With new approach, there should be no previous 'set' or 'remove' mutation on any node because they
                                // have been removed by _addCacheSetMutation. But... if there are old mutations in the db
                                // without 'update' mutations (because then we'd have been in compatibilityMode above) - we'll filter
                                // them out here. In the future we could just add this change without checking, but code below doesn't
                                // harm the process, so it's ok to stay.
                                const rootUpdate = mutations.find(u => u.path === '');
                                if (rootUpdate) {
                                    rootUpdate.data = change.data;
                                }
                                else {
                                    change.ids = [id];
                                    mutations.push(change);
                                }
                            }
                            else {
                                const pathInfo = acebase_core_1.PathInfo.get(change.path);
                                const parentPath = pathInfo.parentPath;
                                const parentUpdate = mutations.find(u => u.path === parentPath);
                                const value = change.type === 'remove' || change.data === null || typeof change.data === 'undefined' ? null : change.data;
                                if (!parentUpdate) {
                                    // Create new parent update
                                    // change.context.acebase_sync = { }; // TODO: Think about what context we could add to let receivers know why this merged update happens
                                    mutations.push({ ids: [id], type: 'update', path: parentPath, data: { [pathInfo.key]: value }, context: change.context });
                                }
                                else {
                                    // Add this change to parent update
                                    parentUpdate.data[pathInfo.key] = value;
                                    parentUpdate.ids.push(id);
                                }
                            }
                            return mutations;
                        }, []);
                    for (const m of mutations) {
                        const ids = m.ids;
                        this.debug.verbose(`SYNC pushing mutations ${ids.join(',')}: `, m);
                        totalPendingChanges++;
                        try {
                            if (m.type === 'update') {
                                await this.update(m.path, m.data, { allow_cache: false, context: m.context });
                            }
                            else if (m.type === 'set') {
                                if (!m.data) {
                                    m.data = null;
                                } // Before type 'remove' was implemented
                                await this.set(m.path, m.data, { allow_cache: false, context: m.context });
                            }
                            else if (m.type === 'remove') {
                                await this.set(m.path, null, { allow_cache: false, context: m.context });
                            }
                            else {
                                throw new Error(`unsupported mutation type "${m.type}"`);
                            }
                            this.debug.verbose(`SYNC mutation ${ids.join(',')} processed ok`);
                            const updates = ids.reduce((updates, id) => (updates[id] = null, updates), {});
                            cacheApi.update(`${this.dbname}/pending`, updates); // delete from cache db
                        }
                        catch (err) {
                            // Updating remote db failed
                            this.debug.error(`SYNC mutations ${ids.join(',')} failed: ${err.message}`);
                            if (!this.isConnected) {
                                // Connection was broken, should retry later
                                throw err;
                            }
                            // We are connected, so the mutation is not allowed or otherwise denied.
                            if (typeof err === 'string') {
                                err = { code: 'unknown', message: err, stack: 'n/a' };
                            }
                            // Store error report
                            const errorReport = { date: new Date(), code: err.code || 'unknown', message: err.message, stack: err.stack };
                            ids.forEach(id => {
                                cacheApi.transaction(`${this.dbname}/pending/${id}`, m => {
                                    if (!m.error) {
                                        m.error = {
                                            first: errorReport,
                                            last: errorReport,
                                            retries: 0,
                                        };
                                    }
                                    else {
                                        m.error.last = errorReport;
                                        m.error.retries++;
                                    }
                                    if (m.error.retries === 3) {
                                        // After 3 failed retries, move to /dbname/failed/id
                                        cacheApi.set(`${this.dbname}/failed/${id}`, m);
                                        return null; // remove pending
                                    }
                                    return m;
                                });
                            });
                            cacheApi.set(`${this.dbname}/stats/last_sync_error`, errorReport).catch(handleStatsUpdateError);
                            // TODO: Send error report to server?
                            // this.reportError({ code: 'sync-mutation', report: errorReport });
                            (_c = options.eventCallback) === null || _c === void 0 ? void 0 : _c.call(options, 'sync_change_error', { error: err, change: m });
                        }
                    }
                    this.debug.verbose(`SYNC push done`);
                    // Update stats
                    cacheApi.set(`${this.dbname}/stats/last_sync_end`, new Date()).catch(handleStatsUpdateError);
                }
                catch (err) {
                    // 1 or more pending changes could not be processed.
                    this.debug.error(`SYNC push error: ${err.message}`);
                    if (typeof err === 'string') {
                        err = { code: 'unknown', message: err, stack: 'n/a' };
                    }
                    cacheApi.set(`${this.dbname}/stats/last_sync_error`, { date: new Date(), code: err.code || 'unknown', message: err.message, stack: err.stack }).catch(handleStatsUpdateError);
                    throw err;
                }
            }
            // We've pushed our changes, now get fresh data for all paths with active subscriptions
            // Using a cursor we can get changes since disconnect
            // - If we have a cursor, we were connected before.
            // - A cursor can only be used for events added while connected, not for events added while offline
            // - A cursor can currently only be used if a cache db is used.
            // - If there is no cursor because there were no events fired during a previous connection, use disconnected logic for all events
            //
            //  -------------------------------------------------------------
            // |                 |           event subscribe time           |
            // |     event       |  pre-connect | connected | disconnected  |
            // |------------------------------------------------------------|
            // | value           |     get      |   cursor  |     get       |
            // | child_added     |     get*     |   cursor  |     get*      |
            // | child_removed   |     warn     |   cursor  |     warn      |
            // | child_changed   |     warn     |   cursor  |     warn      |
            // | mutated         |     warn     |   cursor  |     warn      |
            // | mutations       |     warn     |   cursor  |     warn      |
            // | notify_*        |     warn     |   warn    |     warn      |
            // --------------------------------------------------------------
            // * only if sub.newOnly === false, warn otherwise
            // --------------------------------------------------------------
            let totalRemoteChanges = 0, usedSyncMethod = 'reload';
            const subscriptionPaths = Object.keys(this._subscriptions);
            const subscriptions = subscriptionPaths.reduce((subs, path) => {
                this._subscriptions[path].forEach(sub => subs.push(sub));
                return subs;
            }, []);
            const subscriptionsFor = (path) => subscriptions.filter(sub => sub.path === path);
            if (this.hasCache) { //  && options.fetchFreshData
                // Part 2: PULL remote changes / fresh data
                const cacheApi = this.cache.db.api;
                // Attach temp events to cache db so they will fire for data changes (just for counting)
                subscriptions.forEach(sub => {
                    sub.tempCallback = () => {
                        totalRemoteChanges++;
                    };
                    cacheApi.subscribe(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, sub.path), sub.event, sub.tempCallback);
                });
                const strategy = {
                    /** Data paths to reload */
                    reload: [],
                    /** Event targets to fetch changes with cursor */
                    cursor: [],
                    /** Subscriptions that have custom sync fallback logic, used when there is no automated way to synchronize */
                    fallback: [],
                    /** Event targets to warn about */
                    warn: [],
                    /** Subscriptions that require no action because they were added after last connect event */
                    noop: [],
                };
                // const wasAddedOffline = sub => {
                //     return sub.lastSynced === 0 && sub.added > this._eventTimeline.disconnect && sub.added < this._eventTimeline.connect;
                // };
                const hasStaleValue = (sub) => {
                    // --------------------------------
                    // | cursor |   added   | stale   |
                    // -------------------------------|
                    // |   no   |  online   |  no     |
                    // |   no   |  offline  |  yes    |
                    // |   no   |  b/disct  |  yes    |
                    // |   yes  |  online   |  no     |
                    // |   yes  |  offline  |  yes    |
                    // |   yes  |  b/disct  |  no     |
                    // --------------------------------
                    const addedWhileOffline = sub.added > this._eventTimeline.disconnect && sub.added < this._eventTimeline.connect;
                    const addedBeforeDisconnection = sub.added < this._eventTimeline.disconnect;
                    if (addedWhileOffline) {
                        return true;
                    }
                    if (addedBeforeDisconnection) {
                        return cursor ? false : true;
                    }
                    return false;
                };
                strategy.reload = subscriptionPaths
                    .filter(path => {
                    if (path.includes('*') || path.includes('$')) {
                        return false;
                    } // Can't load wildcard paths
                    return subscriptionsFor(path).some(sub => {
                        if (hasStaleValue(sub)) {
                            if (typeof sub.settings.syncFallback === 'function') {
                                return false;
                            }
                            if (sub.settings.syncFallback === 'reload') {
                                return true;
                            }
                            if (sub.event === 'value') {
                                return true;
                            }
                            if (sub.event === 'child_added' && !sub.settings.newOnly) {
                                return true;
                            }
                        }
                        return false;
                    });
                })
                    .reduce((reloadPaths, path) => {
                    !reloadPaths.some(p => p === path || acebase_core_1.PathInfo.get(p).isAncestorOf(path)) && reloadPaths.push(path);
                    return reloadPaths;
                }, []);
                strategy.fallback = subscriptionPaths
                    .filter(path => !strategy.reload.some(p => p === path || acebase_core_1.PathInfo.get(p).isAncestorOf(path)))
                    .reduce((fallbackItems, path) => {
                    subscriptionsFor(path).forEach(sub => {
                        if (hasStaleValue(sub) && typeof sub.settings.syncFallback === 'function') {
                            fallbackItems.push(sub);
                        }
                    });
                    return fallbackItems;
                }, []);
                strategy.cursor = !cursor ? [] : subscriptionPaths
                    .filter(path => !strategy.reload.some(p => p === path || acebase_core_1.PathInfo.get(p).isAncestorOf(path)))
                    .reduce((cursorItems, path) => {
                    const subs = subscriptionsFor(path);
                    const events = subs.filter(sub => !hasStaleValue(sub) && !strategy.fallback.includes(sub))
                        .reduce((events, sub) => (events.includes(sub.event) || events.push(sub.event)) && events, []);
                    events.length > 0 && cursorItems.push({ path, events });
                    return cursorItems;
                }, []);
                strategy.warn = subscriptionPaths
                    .filter(path => !strategy.reload.some(p => p === path || acebase_core_1.PathInfo.get(p).isAncestorOf(path)))
                    .reduce((warnItems, path) => {
                    const subs = subscriptionsFor(path).filter(sub => !strategy.fallback.includes(sub));
                    subs.forEach(sub => {
                        if (typeof sub.settings.syncFallback === 'function' || sub.added > this._eventTimeline.connect) {
                            strategy.noop.push(sub);
                        }
                        else if (!strategy.cursor.some(item => item.path === sub.path && item.events.includes(sub.event))) {
                            const item = warnItems.find(item => item.path === sub.path);
                            if (!item) {
                                warnItems.push({ path: sub.path, events: [sub.event] });
                            }
                            else if (!item.events.includes(sub.event)) {
                                item.events.push(sub.event);
                            }
                        }
                    });
                    return warnItems;
                }, []);
                console.log(`SYNC strategy`, strategy);
                const syncPromises = [];
                if (strategy.cursor.length > 0) {
                    this.debug.log(`SYNC using cursor "${cursor}" for event(s) ${strategy.cursor.map(item => `${item.events.join(', ')} on "/${item.path}"`).join(', ')}`);
                    const cursorPromise = (async () => {
                        let remoteMutations;
                        try {
                            const result = await this.getChanges({ for: strategy.cursor, cursor });
                            remoteMutations = result.changes;
                            this._updateCursor(result.new_cursor);
                        }
                        catch (err) {
                            this.debug.error(`SYNC: Could not load remote changes`, err);
                            options.eventCallback && options.eventCallback('sync_cursor_error', err);
                            if (err.code === 'no_transaction_logging') {
                                // Apparently the server did support transaction logging before, but is now disabled.
                                // Remove cursor so it won't be used again.
                                this._updateCursor(null);
                            }
                            // Check which subscriptions we'll be able to reload, and which we'll have to issue warnings for
                            strategy.cursor.forEach(item => {
                                if (item.events.includes('value')) {
                                    strategy.reload.push(item.path);
                                }
                                else {
                                    strategy.warn.push(item);
                                }
                            });
                        }
                        if (remoteMutations) {
                            usedSyncMethod = 'cursor';
                            this.debug.log(`SYNC: Got ${remoteMutations.length} remote mutations`, remoteMutations);
                            const promises = remoteMutations.map(m => {
                                const cachePath = `${this.dbname}/cache/${m.path}`;
                                if (m.type === 'update') {
                                    return cacheApi.update(cachePath, m.value, { context: m.context });
                                }
                                else if (m.type === 'set') {
                                    return cacheApi.set(cachePath, m.value, { context: m.context });
                                }
                            });
                            await Promise.all(promises);
                        }
                    })();
                    syncPromises.push(cursorPromise);
                }
                if (strategy.reload.length > 0) {
                    this.debug.log(`SYNC reloading data for event paths ${strategy.reload.map(path => `"/${path}"`).join(', ')}`);
                    const reloadPromise = (async () => {
                        const promises = strategy.reload.map(path => {
                            this.debug.verbose(`SYNC: load "/${path}"`);
                            return this.get(path, { cache_mode: 'bypass' }) // allow_cache: false
                                .catch(err => {
                                this.debug.error(`SYNC: could not load "/${path}"`, err);
                                options.eventCallback && options.eventCallback('sync_pull_error', err);
                            });
                        });
                        await Promise.all(promises);
                    })();
                    syncPromises.push(reloadPromise);
                }
                if (strategy.fallback.length > 0) {
                    this.debug.log(`SYNC using fallback functions for event(s) ${strategy.fallback.map(sub => `${sub.event} on "/${sub.path}"`).join(', ')}`);
                    const fallbackPromise = (async () => {
                        const promises = strategy.fallback.map(async (sub) => {
                            this.debug.verbose(`SYNC: running fallback for event ${sub.event} on "/${sub.path}"`);
                            try {
                                if (sub.settings.syncFallback === 'reload') {
                                    throw new Error(`DEV ERROR: Not expecting "reload" as fallback`);
                                }
                                await sub.settings.syncFallback();
                            }
                            catch (err) {
                                this.debug.error(`SYNC: error running fallback function for ${sub.event} on "/${sub.path}"`, err);
                                options.eventCallback && options.eventCallback('sync_fallback_error', err);
                            }
                        });
                        await Promise.all(promises);
                    })();
                    syncPromises.push(fallbackPromise);
                }
                if (strategy.warn.length > 0) {
                    this.debug.warn(`SYNC warning: unable to sync event(s) ${strategy.warn.map(item => `${item.events.map(event => `"${event}"`).join(', ')} on "/${item.path}"`).join(', ')}. To resolve this, provide syncFallback functions for these events`);
                }
                // Wait until they're all done
                await Promise.all(syncPromises);
                // Wait shortly to allow any pending temp cache events to fire
                await new Promise(resolve => setTimeout(resolve, 10));
                // Unsubscribe temp cache subscriptions
                subscriptions.forEach(sub => {
                    if (typeof sub.tempCallback !== 'function') {
                        throw new Error('DEV ERROR: tempCallback must be a function');
                    }
                    cacheApi.unsubscribe(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, sub.path), sub.event, sub.tempCallback);
                    delete sub.tempCallback;
                });
            }
            else if (!this._cache) {
                // Not using cache
                const syncPromises = [];
                // No cache database used
                // Until acebase-server supports getting missed events with a cursor (in addition to getting mutations),
                // there is no way for the client to determine exact data changes at this moment - we have no previous values.
                // We can only fetch fresh data for 'value' events, run syncFallback functions and warn about all other events
                subscriptionPaths.forEach(path => {
                    const subs = subscriptionsFor(path);
                    const warnEvents = [];
                    subs.filter(sub => sub.event !== 'value').forEach(sub => {
                        if (typeof sub.settings.syncFallback === 'function') {
                            syncPromises.push(sub.settings.syncFallback());
                        }
                        else {
                            !warnEvents.includes(sub.event) && warnEvents.push(sub.event);
                        }
                    });
                    if (warnEvents.length > 0) {
                        this.debug.warn(`Subscriptions ${warnEvents.join(', ')} on path "${path}" might have missed events while offline. Data should be reloaded!`);
                    }
                    const valueSubscriptions = subs.filter(sub => sub.event === 'value');
                    if (valueSubscriptions.length > 0) {
                        const p = this.get(path, { allow_cache: false }).then(value => {
                            valueSubscriptions.forEach(subscr => subscr.callback(null, path, value)); // No previous value!
                        });
                        syncPromises.push(p);
                    }
                });
                await Promise.all(syncPromises);
            }
            // Update subscription sync stats
            subscriptions.forEach(sub => sub.lastSynced = Date.now());
            this.debug.verbose(`SYNC done`);
            const info = { local: totalPendingChanges, remote: totalRemoteChanges, method: usedSyncMethod, cursor };
            options.eventCallback && options.eventCallback('sync_done', info);
            return info;
        }
        catch (err) {
            this.debug.error(`SYNC error`, err);
            options.eventCallback && options.eventCallback('sync_error', err);
            throw err;
        }
    }
    /**
     * Gets all relevant mutations for specific events on a path and since specified cursor
     */
    async getMutations(filter) {
        var _a;
        if (typeof filter !== 'object') {
            throw new Error('No filter specified');
        }
        if (typeof filter.cursor !== 'string' && typeof filter.timestamp !== 'number') {
            throw new Error('No cursor or timestamp given');
        }
        const query = Object.keys(filter)
            .map(key => {
            let val = filter[key];
            if (key === 'for') {
                val = encodeURIComponent(JSON.stringify(val));
            }
            return typeof val !== 'undefined' ? `${key}=${val}` : null;
        })
            .filter(p => p != null)
            .join('&');
        const { data, context } = await this._request({ url: `${this.url}/sync/mutations/${this.dbname}?${query}`, includeContext: true });
        const mutations = acebase_core_1.Transport.deserialize2(data);
        return { used_cursor: (_a = filter.cursor) !== null && _a !== void 0 ? _a : null, new_cursor: context.acebase_cursor, mutations };
    }
    /**
     * Gets all relevant effective changes for specific events on a path and since specified cursor
     */
    async getChanges(filter) {
        var _a;
        if (typeof filter !== 'object') {
            throw new Error('No filter specified');
        }
        if (typeof filter.cursor !== 'string' && typeof filter.timestamp !== 'number') {
            throw new Error('No cursor or timestamp given');
        }
        const query = Object.keys(filter)
            .map(key => {
            let val = filter[key];
            if (key === 'for') {
                val = encodeURIComponent(JSON.stringify(val));
            }
            return typeof val !== 'undefined' ? `${key}=${val}` : null;
        })
            .filter(p => p != null)
            .join('&');
        const { data, context } = await this._request({ url: `${this.url}/sync/changes/${this.dbname}?${query}`, includeContext: true });
        const changes = acebase_core_1.Transport.deserialize2(data);
        return { used_cursor: (_a = filter.cursor) !== null && _a !== void 0 ? _a : null, new_cursor: context.acebase_cursor, changes };
    }
    async _addCacheSetMutation(path, value, context) {
        var _a, _b;
        // Remove all previous mutations on this exact path, and descendants
        const escapedPath = path.replace(/([.*+?\\$^\(\)\[\]\{\}])/g, '\\$1'); // Replace any character that could cripple the regex. NOTE: nobody should use these characters in their data paths in the first place.
        const re = new RegExp(`^${escapedPath}(?:\\[|/|$)`); // matches path, path/child, path[0], path[0]/etc, path/child/etc/etc
        await ((_a = this._cache) === null || _a === void 0 ? void 0 : _a.db.query(`${this.dbname}/pending`).filter('path', 'matches', re).remove());
        // Add new mutation
        return (_b = this._cache) === null || _b === void 0 ? void 0 : _b.db.api.set(`${this.dbname}/pending/${acebase_core_1.ID.generate()}`, { type: value !== null ? 'set' : 'remove', path, data: value, context });
    }
    set(path, value, options = {
        allow_cache: true,
        context: {},
    }) {
        var _a;
        // TODO: refactor allow_cache to cache_mode
        if (!options.context) {
            options.context = {};
        }
        const useCache = this._cache && options.allow_cache !== false;
        const useServer = this.isConnected;
        // TODO: reduce this contextual overhead to 'client_id' only, or additional debugging info upon request
        options.context.acebase_mutation = options.context.acebase_mutation || {
            client_id: this._id,
            id: acebase_core_1.ID.generate(),
            op: 'set',
            path,
            flow: useCache ? useServer ? 'parallel' : 'cache' : 'server',
        };
        const updateServer = async () => {
            const data = JSON.stringify(acebase_core_1.Transport.serialize(value));
            const { context } = await this._request({ method: 'PUT', url: `${this.url}/data/${this.dbname}/${path}`, data, context: options.context, includeContext: true });
            Object.assign(options.context, context); // Add to request context
            const cursor = context === null || context === void 0 ? void 0 : context.acebase_cursor;
            return { cursor }; // And return the cursor
        };
        if (!useCache) {
            return updateServer();
        }
        const cachePath = acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path);
        let rollbackValue;
        const updateCache = () => {
            return this.cache.db.api.transaction(cachePath, (currentValue) => {
                rollbackValue = currentValue;
                return value;
            }, { context: options.context });
        };
        const rollbackCache = async () => {
            await cachePromise; // Must be ready first before we can rollback to previous value
            return this.cache.db.api.set(cachePath, rollbackValue, { context: options.context });
        };
        const addPendingTransaction = async () => {
            await this._addCacheSetMutation(path, value, options.context);
        };
        const cachePromise = updateCache();
        const tryCachePromise = cachePromise
            .then(() => ({ success: true, error: null }))
            .catch(err => ({ success: false, error: err }));
        const serverPromise = !useServer ? null : updateServer();
        const tryServerPromise = !useServer ? null : serverPromise
            .then(() => ({ success: true, error: null }))
            .catch(err => ({ success: false, error: err }));
        Promise.all([tryCachePromise, tryServerPromise])
            .then(([cacheResult, serverResult]) => {
            var _a;
            const networkError = serverPromise && !(serverResult === null || serverResult === void 0 ? void 0 : serverResult.success) && ((_a = serverResult === null || serverResult === void 0 ? void 0 : serverResult.error) === null || _a === void 0 ? void 0 : _a.isNetworkError) === true;
            if (serverPromise && !networkError) {
                // Server update succeeded, or failed with a non-network related reason
                if (serverResult === null || serverResult === void 0 ? void 0 : serverResult.success) {
                    // Server update success
                    if (!cacheResult.success) {
                        // Cache update failed for some reason?
                        this.debug.error(`Failed to set cache for "${path}". Error: `, cacheResult.error);
                    }
                }
                else {
                    // Server update failed (with a non-network related reason)
                    if (cacheResult.success) {
                        // Cache update did succeed, rollback to previous value
                        this.debug.error(`Failed to set server value for "${path}", rolling back cache to previous value. Error:`, serverResult === null || serverResult === void 0 ? void 0 : serverResult.error);
                        rollbackCache().catch(err => {
                            this.debug.error(`Failed to roll back cache? Error:`, err);
                        });
                    }
                }
            }
            else if (cacheResult.success) {
                // Server was not updated (because we're offline, or a network error occurred), cache update was successful.
                // Add pending sync action
                addPendingTransaction().catch(err => {
                    this.debug.error(`Failed to add pending sync action for "${path}", rolling back cache to previous value. Error:`, err);
                    rollbackCache().catch(err => {
                        this.debug.error(`Failed to roll back cache? Error:`, err);
                    });
                });
            }
        });
        if (!useServer) {
            // Fixes issue #7
            return cachePromise;
        }
        // return server promise by default, so caller can handle potential authorization issues
        return ((_a = this._cache) === null || _a === void 0 ? void 0 : _a.priority) === 'cache' ? cachePromise : serverPromise;
    }
    update(path, updates, options = {
        allow_cache: true,
        context: {},
    }) {
        var _a, _b;
        // TODO: refactor allow_cache to cache_mode
        const useCache = this._cache && options && options.allow_cache !== false;
        const useServer = this.isConnected;
        // TODO: reduce this contextual overhead to 'client_id' only, or additional debugging info upon request
        options.context.acebase_mutation = options.context.acebase_mutation || {
            client_id: this._id,
            id: acebase_core_1.ID.generate(),
            op: 'update',
            path,
            flow: useCache ? useServer ? 'parallel' : 'cache' : 'server',
        };
        const updateServer = async () => {
            const data = JSON.stringify(acebase_core_1.Transport.serialize(updates));
            const { context } = await this._request({ method: 'POST', url: `${this.url}/data/${this.dbname}/${path}`, data, context: options.context, includeContext: true });
            Object.assign(options.context, context); // Add to request context
            const cursor = context.acebase_cursor;
            return { cursor }; // And return the cursor
        };
        if (!useCache) {
            return updateServer();
        }
        const cacheApi = (_a = this._cache) === null || _a === void 0 ? void 0 : _a.db.api;
        const cachePath = acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path);
        let rollbackValue;
        const updateCache = async () => {
            const properties = Object.keys(updates);
            const result = await cacheApi.get(cachePath, { include: properties });
            rollbackValue = result.value;
            if (typeof rollbackValue === 'object' && rollbackValue !== null) {
                // current cache value is an object, set properties being created now to null so they'll be deleted upon rollback
                properties.forEach(prop => {
                    if (!(prop in rollbackValue) && updates[prop] !== null) {
                        // Property being updated doesn't exist in current value, set to null
                        rollbackValue[prop] = null;
                    }
                });
            }
            return cacheApi.update(cachePath, updates, { context: options.context });
        };
        const rollbackCache = async () => {
            await cachePromise; // Must be ready first before we can rollback to previous value
            if (typeof rollbackValue === 'object' && rollbackValue !== null && Object.keys(rollbackValue).length > 0) {
                // previous cache value is an object with at least 1 property
                return cacheApi.update(cachePath, rollbackValue, { context: options.context });
            }
            else {
                // previous cache value was not an object or did not have any properties
                return cacheApi.set(cachePath, rollbackValue, { context: options.context });
            }
        };
        const addPendingTransaction = async () => {
            /*

            In the old method, making multiple changes to the same data would store AND SYNC each
            mutation separately. To only store net changes to the db, having mixed 'update' and 'set' mutations
            make this hard. Consider the following mutations:

                1. update 'users/ewout': { name: 'Ewout', surname: 'Stortenbeker' }
                2. update 'users/ewout/address': { street: 'Main street', nr: 3 }
                3. update 'users/ewout': { name: 'E', address: null }
                4. update 'users/ewout': { name: 'E', address: { street: '2nd Ave', nr: 48 } }
                5. set 'users/ewout/address/street': 'Main street'
                6. set 'users/ewout/address/nr': 3
                7. set 'users/ewout/name': 'Ewout'

            If all updated properties are saved as 'set' operations, things become easier:

                1a. set 'users/ewout/name': 'Ewout'
                1b. set 'users/ewout/surname': 'Stortenbeker'
                2a. set 'users/ewout/address/street': 'Main street'
                2b. set 'users/ewout/address/nr': 3
                3a. set 'users/ewout/name': 'E'
                3b. set 'users/ewout/address': null
                4a. set 'users/ewout/name': 'E'
                4b. set 'users/ewout/address': { street: '2nd Ave', nr: 48 }
                5.  set 'users/ewout/address/street': 'Main street'
                6.  set 'users/ewout/address/nr': 3
                7.  set 'users/ewout/name': 'Ewout'

            Now it's easy to remove obsolete mutations, only keeping the last ones:

                1b. set 'users/ewout/surname': 'Stortenbeker'
                4b. set 'users/ewout/address': { street: '2nd Ave', nr: 48 }
                5.  set 'users/ewout/address/street': 'Main street'
                6.  set 'users/ewout/address/nr': 3
                7.  set 'users/ewout/name': 'Ewout'

            */
            // Create 'set' mutations for all of this 'update's properties
            const pathInfo = acebase_core_1.PathInfo.get(path);
            const mutations = Object.keys(updates).map((prop) => {
                if (updates instanceof Array) {
                    prop = parseInt(prop);
                }
                return {
                    path: pathInfo.childPath(prop),
                    value: updates[prop],
                };
            });
            // Store new pending 'set' operations (null values will be stored as 'remove')
            const promises = mutations.map(m => this._addCacheSetMutation(m.path, m.value, options.context));
            await Promise.all(promises);
        };
        const cachePromise = updateCache();
        const tryCachePromise = cachePromise
            .then(() => ({ success: true, error: null }))
            .catch(err => ({ success: false, error: err }));
        const serverPromise = !useServer ? null : updateServer();
        const tryServerPromise = !useServer ? { executed: false, success: false, error: null } : serverPromise
            .then(() => ({ executed: true, success: true, error: null }))
            .catch(err => ({ executed: true, success: false, error: err }));
        Promise.all([tryCachePromise, tryServerPromise])
            .then(([cacheResult, serverResult]) => {
            const networkError = serverResult.executed && !serverResult.success && serverResult.error.isNetworkError === true;
            if (serverResult.executed && !networkError) {
                // Server update succeeded, or failed with a non-network related reason
                if (serverResult.success) {
                    // Server update success
                    if (!cacheResult.success) {
                        // Cache update failed for some reason?
                        this.debug.error(`Failed to update cache for "${path}". Error: `, cacheResult.error);
                    }
                }
                else {
                    // Server update failed
                    if (cacheResult.success) {
                        // Cache update did succeed, rollback to previous value
                        this.debug.error(`Failed to update server value for "${path}", rolling back cache to previous value. Error:`, serverResult.error);
                        rollbackCache().catch(err => {
                            this.debug.error(`Failed to roll back cache? Error:`, err);
                        });
                    }
                }
            }
            else if (cacheResult.success) {
                // Server was not updated, cache update was successful.
                // Add pending sync action
                addPendingTransaction().catch(err => {
                    this.debug.error(`Failed to add pending sync action for "${path}", rolling back cache to previous value. Error:`, err);
                    rollbackCache().catch(err => {
                        this.debug.error(`Failed to roll back cache? Error:`, err);
                    });
                });
            }
        });
        if (!useServer) {
            // Fixes issue #7
            return cachePromise;
        }
        // return server promise by default, so caller can handle potential authorization issues
        return ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.priority) === 'cache' ? cachePromise : serverPromise;
    }
    /**
     * @returns Returns a promise that resolves with the value, context and optionally a server cursor
     */
    async get(path, options = {
        cache_mode: 'allow',
    }) {
        var _a, _b;
        if (typeof options.cache_mode !== 'string') {
            options.cache_mode = 'allow';
        }
        const useCache = this._cache && options.cache_mode !== 'bypass';
        const getServerValue = async () => {
            // Get from server
            let url = `${this.url}/data/${this.dbname}/${path}`;
            let filtered = false;
            if (options) {
                const query = [];
                if (options.exclude instanceof Array) {
                    query.push(`exclude=${options.exclude.join(',')}`);
                }
                if (options.include instanceof Array) {
                    query.push(`include=${options.include.join(',')}`);
                }
                if (typeof options.child_objects === 'boolean') {
                    query.push(`child_objects=${options.child_objects}`);
                }
                if (query.length > 0) {
                    filtered = true;
                    url += `?${query.join('&')}`;
                }
            }
            const result = await this._request({ url, includeContext: true });
            const context = result.context;
            const cursor = context && context.acebase_cursor;
            const value = acebase_core_1.Transport.deserialize(result.data);
            if (this._cache) {
                // Update cache without waiting
                // DISABLED: if filtered data was requested, it should be merged with current data (nested objects in particular)
                // if (filtered) {
                //     this._cache.db.api.update(`${this.dbname}/cache/${path}`, val);
                // }
                if (!filtered) {
                    const cachePath = acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path);
                    this._cache.db.api.set(cachePath, value, { context: { acebase_operation: 'update_cache', acebase_server_context: context } })
                        .catch(err => {
                        this.debug.error(`Error caching data for "/${path}"`, err);
                    });
                }
            }
            return { value, context, cursor };
        };
        const getCacheValue = async (throwOnNull = false) => {
            if (!this._cache) {
                throw new Error(`DEV ERROR: cannot get cached value if no cache is used!`);
            }
            const result = await this._cache.db.api.get(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path), options);
            let { value, context } = result;
            if (!('value' in result && 'context' in result)) {
                console.warn(`Missing context from cache results. Update your acebase package`);
                value = result, context = {};
            }
            if (value === null && throwOnNull) {
                throw new errors_1.CachedValueUnavailableError(path);
            }
            delete context.acebase_cursor; // Do NOT pass along use cache cursor!!
            return { value, context };
        };
        if (options.cache_mode === 'force') {
            // Only load cached value
            const { value, context } = await getCacheValue(false); // Do not throw on null with cache_mode: 'force'
            context.acebase_origin = 'cache';
            return { value, context };
        }
        if (useCache && typeof options.cache_cursor === 'string') {
            // Update cache with mutations from cursor, then load cached value
            let syncResult;
            try {
                syncResult = await this.updateCache(path, options.cache_cursor);
            }
            catch (err) {
                // Failed to update cache, we might be offline. Proceed with cache value
            }
            const { value, context } = await getCacheValue(false); // don't throw on null value, it was updated from the server just now
            if (syncResult) {
                context.acebase_cursor = syncResult.new_cursor;
                context.acebase_origin = 'hybrid';
            }
            else {
                context.acebase_cursor = options.cache_cursor;
                context.acebase_origin = 'cache';
            }
            return { value, context, cursor: context.acebase_cursor };
        }
        if (!useCache) {
            // Cache not available or allowed to be used, get server value
            const { value, context, cursor } = await getServerValue();
            context.acebase_origin = 'server';
            return { value, context, cursor };
        }
        if (!this.isConnected || ((_a = this._cache) === null || _a === void 0 ? void 0 : _a.priority) === 'cache') {
            // Server not connected, or priority is set to 'cache'. Get cached value
            const throwOnNull = ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.priority) !== 'cache';
            const { value, context } = await getCacheValue(throwOnNull);
            context.acebase_origin = 'cache';
            return { value, context };
        }
        // Get both, use cached value if available and server version takes too long
        return new Promise((resolve, reject) => {
            let wait = true, done = false;
            const gotValue = (source, val) => {
                var _a;
                this.debug.verbose(`Got ${source} value of "${path}":`, val);
                if (done) {
                    return;
                }
                const { value, context, cursor } = val;
                if (source === 'server') {
                    done = true;
                    this.debug.verbose(`Using server value for "${path}"`);
                    context.acebase_origin = 'server';
                    resolve({ value, context, cursor });
                }
                else if (value === null) {
                    // Cached value is not available
                    if (!wait) {
                        const serverError = (_a = errors.find(e => e.source === 'server')) === null || _a === void 0 ? void 0 : _a.error;
                        if (serverError.isNetworkError) {
                            // On network related errors, we thought we were connected but apparently weren't.
                            // If we had known this up-front, getCachedValue(true) would have been executed and
                            // thrown a CachedValueUnavailableError with default message. Let's do that now
                            return reject(new errors_1.CachedValueUnavailableError(path));
                        }
                        // Could not get server value because of a non-network related issue - possibly unauthorized access
                        const error = new errors_1.CachedValueUnavailableError(path, `Value for "${path}" not found in cache, and server value could not be loaded. See serverError for more details`);
                        error.serverError = serverError;
                        return reject(error);
                    }
                }
                else if (!wait) {
                    // Cached results, don't wait for server value
                    done = true;
                    this.debug.verbose(`Using cache value for "${path}"`);
                    context.acebase_origin = 'cache';
                    resolve({ value, context });
                }
                else {
                    // Cached results, wait 1s before resolving with this value, server value might follow soon
                    setTimeout(() => {
                        if (done) {
                            return;
                        }
                        this.debug.verbose(`Using (delayed) cache value for "${path}"`);
                        done = true;
                        context.acebase_origin = 'cache';
                        resolve({ value, context });
                    }, 1000);
                }
            };
            const errors = [];
            const gotError = (source, error) => {
                var _a;
                errors.push({ source, error });
                if (errors.length === 2) {
                    // Both failed, reject with server error
                    reject((_a = errors.find(e => e.source === 'server')) === null || _a === void 0 ? void 0 : _a.error);
                }
            };
            getServerValue()
                .then(val => gotValue('server', val))
                .catch(err => (wait = false, gotError('server', err)));
            getCacheValue(false)
                .then(val => gotValue('cache', val))
                .catch(err => gotError('cache', err));
        });
    }
    exists(path, options = {
        allow_cache: true,
    }) {
        // TODO: refactor allow_cache to cache_mode
        // TODO: refactor to include context in return value: acebase_origin: 'cache' or 'server'
        const useCache = this._cache && options.allow_cache !== false;
        const getCacheExists = () => {
            if (!this._cache) {
                throw new Error('DEV ERROR: no cache db available to check exists');
            }
            return this._cache.db.api.exists(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path));
        };
        const getServerExists = () => {
            return this._request({ url: `${this.url}/exists/${this.dbname}/${path}` })
                .then(res => res.exists)
                .catch(err => {
                throw err;
            });
        };
        if (!useCache) {
            return getServerExists();
        }
        else if (!this.isConnected) {
            return getCacheExists();
        }
        else {
            // Check both
            return new Promise((resolve, reject) => {
                let wait = true, done = false;
                const gotExists = (source, exists) => {
                    if (done) {
                        return;
                    }
                    if (source === 'server') {
                        done = true;
                        resolve(exists);
                    }
                    else if (!wait) {
                        // Cached results, don't wait for server value
                        done = true;
                        resolve(exists);
                    }
                    else {
                        // Cached results, wait 1s before resolving with this value, server value might follow soon
                        setTimeout(() => {
                            if (done) {
                                return;
                            }
                            done = true;
                            resolve(exists);
                        }, 1000);
                    }
                };
                const errors = [];
                const gotError = (source, error) => {
                    errors.push({ source, error });
                    if (errors.length === 2) {
                        // Both failed, reject with server error
                        reject(errors.find(e => e.source === 'server'));
                    }
                };
                getServerExists()
                    .then(exists => gotExists('server', exists))
                    .catch(err => (wait = false, gotError('server', err)));
                getCacheExists()
                    .then(exists => gotExists('cache', exists))
                    .catch(err => gotError('cache', err));
            });
        }
    }
    callExtension(method, path, data) {
        method = method.toUpperCase();
        const postData = ['PUT', 'POST'].includes(method) ? data : null;
        let url = `${this.url}/ext/${this.dbname}/${path}`;
        if (data && !['PUT', 'POST'].includes(method)) {
            // Add to query string
            if (typeof data === 'object') {
                // Convert object to querystring
                data = Object.keys(data)
                    .filter(key => typeof data[key] !== 'undefined')
                    .map(key => key + '=' + encodeURIComponent(JSON.stringify(data[key])))
                    .join('&');
            }
            else if (typeof data !== 'string' || !data.includes('=')) {
                throw new Error('data must be an object, or a string with query parameters, like "index=3&name=Something"');
            }
            url += `?` + data;
        }
        return this._request({ method, url, data: postData, ignoreConnectionState: true });
    }
    /**
     * Clears the entire cache, or a specific path without raising any events
     */
    async clearCache(path = '') {
        if (this._cache) {
            const value = path === '' ? {} : null;
            const cachePath = acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path);
            return this._cache.db.api.set(cachePath, value, { suppress_events: true });
        }
    }
    /**
     * Updates the local cache with remote changes by retrieving all mutations to `path` since given `cursor` and applying them to the local cache database.
     * If the local path does not exist or no cursor is given, its entire value will be loaded from the server and stored in cache. If no cache database is used, an error will be thrown.
     */
    async updateCache(
    /**
     * Path to update. The root path will be used if not given, synchronizing the entire database.
     */
    path = '', 
    /**
     * A previously acquired cursor to update the cache with. If not specified, `path`'s entire value will be loaded from the server
     */
    cursor) {
        if (!this._cache) {
            throw new Error(`No cache database used`);
        }
        const cachePath = acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path);
        const cacheApi = this._cache.db.api;
        const loadValue = cursor === null || typeof cursor === 'undefined' || !(await cacheApi.exists(cachePath));
        if (loadValue) {
            // Load from server, store in cache (.get takes care of that)
            const { value, context } = await this.get(path, { cache_mode: 'bypass' });
            return { path, used_cursor: cursor, new_cursor: context.acebase_cursor, loaded_value: true, changes: [] };
        }
        // Get effective changes from server
        const { changes, new_cursor } = await this.getChanges({ path, cursor });
        for (const ch of changes) {
            // Apply to local cache
            const cachePath = acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, ch.path);
            const options = { context: ch.context, suppress_events: false };
            if (ch.type === 'update') {
                await cacheApi.update(cachePath, ch.value, options);
            }
            else if (ch.type === 'set') {
                await cacheApi.set(cachePath, ch.value, options);
            }
        }
        return { path, used_cursor: cursor, new_cursor, loaded_value: false, changes };
    }
    /**
     * @returns returns a promise that resolves with matching data or paths in `results`
     */
    async query(path, query, options = { snapshots: false, cache_mode: 'allow', monitor: { add: false, change: false, remove: false } }) {
        const useCache = this.hasCache && (options.cache_mode === 'force' || (options.cache_mode === 'allow' && !this.isConnected));
        if (useCache) {
            // Not connected, or "force" cache_mode: query cache db
            const data = await this.cache.db.api.query(acebase_core_1.PathInfo.getChildPath(`${this.dbname}/cache`, path), query, options);
            let { results, context } = data;
            const { stop } = data;
            if (!('results' in data && 'context' in data)) {
                // OLD api did not return context
                console.warn(`Missing context from local query results. Update your acebase package`);
                results = data;
                context = {};
            }
            context.acebase_origin = 'cache';
            delete context.acebase_cursor; // Do NOT pass along use cache cursor!!
            return { results, context, stop };
        }
        const request = {
            query,
            options,
        };
        if (options.monitor === true || (typeof options.monitor === 'object' && (options.monitor.add || options.monitor.change || options.monitor.remove))) {
            console.assert(typeof options.eventHandler === 'function', `no eventHandler specified to handle realtime changes`);
            if (!this.socket) {
                throw new Error(`Cannot create realtime query because websocket is not connected. Check your AceBaseClient network.realtime setting`);
            }
            request.query_id = acebase_core_1.ID.generate();
            request.client_id = this.socket.id;
            this._realtimeQueries[request.query_id] = { query, options };
        }
        const reqData = JSON.stringify(acebase_core_1.Transport.serialize(request));
        try {
            const { data, context } = await this._request({ method: 'POST', url: `${this.url}/query/${this.dbname}/${path}`, data: reqData, includeContext: true });
            const results = acebase_core_1.Transport.deserialize(data);
            context.acebase_origin = 'server';
            const stop = async () => {
                // Stops subscription of realtime query results. Requires acebase-server v1.10.0+
                delete this._realtimeQueries[request.query_id];
                await _websocketRequest(this.socket, 'query-unsubscribe', { query_id: request.query_id }, this.accessToken);
            };
            return { results: results.list, context, stop };
        }
        catch (err) {
            throw err;
        }
    }
    async createIndex(path, key, options) {
        if (options && options.config && Object.values(options.config).find(val => typeof val === 'function')) {
            throw new Error(`Cannot create an index with callback functions through a client. Move your code serverside`);
        }
        const version = this._serverVersion.split('.');
        if (version.length === 3 && +version[0] >= 1 && +version[1] >= 10) {
            // acebase-server v1.10+ has a new dedicated endpoint at /index/dbname/create
            const data = JSON.stringify({ path, key, options });
            return await this._request({ method: 'POST', url: `${this.url}/index/${this.dbname}/create`, data });
        }
        else {
            const data = JSON.stringify({ action: 'create', path, key, options });
            return await this._request({ method: 'POST', url: `${this.url}/index/${this.dbname}`, data });
        }
    }
    getIndexes() {
        return this._request({ url: `${this.url}/index/${this.dbname}` });
    }
    async deleteIndex(fileName) {
        // Requires acebase-server v1.10+
        const version = this._serverVersion.split('.');
        if (version.length === 3 && +version[0] >= 1 && +version[1] >= 10) {
            const data = JSON.stringify({ fileName });
            return this._request({ method: 'POST', url: `${this.url}/index/${this.dbname}/delete`, data });
        }
        else {
            throw new Error(`not supported, requires acebase-server 1.10 or higher`);
        }
    }
    reflect(path, type, args) {
        let url = `${this.url}/reflect/${this.dbname}/${path}?type=${type}`;
        if (typeof args === 'object') {
            const query = Object.keys(args).map(key => {
                return `${key}=${args[key]}`;
            });
            if (query.length > 0) {
                url += `&${query.join('&')}`;
            }
        }
        return this._request({ url });
    }
    export(path, write, options = { format: 'json', type_safe: true }) {
        options.format = 'json';
        options.type_safe = options.type_safe !== false;
        const url = `${this.url}/export/${this.dbname}/${path}?format=${options.format}&type_safe=${options.type_safe ? 1 : 0}`;
        return this._request({ url, dataReceivedCallback: chunk => write(chunk) });
    }
    import(path, read, options = { format: 'json', suppress_events: false }) {
        options.format = 'json';
        options.suppress_events = options.suppress_events === true;
        const url = `${this.url}/import/${this.dbname}/${path}?format=${options.format}&suppress_events=${options.suppress_events ? 1 : 0}`;
        return this._request({ method: 'POST', url, dataRequestCallback: length => read(length) });
    }
    get serverPingUrl() {
        return `${this.url}/ping/${this.dbname}`;
    }
    async getServerInfo() {
        const info = await this._request({ url: `${this.url}/info/${this.dbname}` }).catch(err => {
            // Prior to acebase-server v0.9.37, info was at /info (no dbname attached)
            if (!err.isNetworkError) {
                this.debug.warn(`Could not get server info, update your acebase server version`);
            }
            return { version: 'unknown', time: Date.now() };
        });
        this._serverVersion = info.version;
        return info;
    }
    setSchema(path, schema) {
        if (schema !== null) {
            schema = (new acebase_core_1.SchemaDefinition(schema)).text;
        }
        const data = JSON.stringify({ action: 'set', path, schema });
        return this._request({ method: 'POST', url: `${this.url}/schema/${this.dbname}`, data });
    }
    getSchema(path) {
        return this._request({ url: `${this.url}/schema/${this.dbname}/${path}` });
    }
    getSchemas() {
        return this._request({ url: `${this.url}/schema/${this.dbname}` });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validateSchema(path, value, isUpdate) {
        throw new Error(`Manual schema validation can only be used on standalone databases`);
    }
}
exports.WebApi = WebApi;

},{"./base64":4,"./errors":6,"./promise-timeout":9,"./request":10,"./request/error":11,"acebase-core":25,"socket.io-client":41}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AceBaseClientAuth = void 0;
const user_1 = require("./user");
/**
 * User authentication methods
 */
class AceBaseClientAuth {
    constructor(client, eventCallback) {
        this.client = client;
        this.eventCallback = eventCallback;
        /**
         * Currently signed in user
         */
        this.user = null;
        /**
         * Access token of currently signed in user
         */
        this.accessToken = null;
    }
    /**
     * Sign into a user account using a username and password
     * @param username A database username
     * @param password The password
     * @returns returns a promise that resolves with the signed in user and access token
     */
    async signIn(username, password) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        const details = await this.client.api.signIn(username, password);
        if (this.user) {
            this.eventCallback('signout', { source: 'signin', user: this.user });
        }
        this.accessToken = details.accessToken;
        this.user = new user_1.AceBaseUser(details.user);
        this.eventCallback('signin', { source: 'signin', user: this.user, accessToken: this.accessToken });
        return { user: this.user, accessToken: this.accessToken };
    }
    /**
     * Sign into a user account using a username and password
     * @param email An email address
     * @param password The password
     * @returns returns a promise that resolves with the signed in user and access token
     */
    async signInWithEmail(email, password) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        const details = await this.client.api.signInWithEmail(email, password);
        if (this.user) {
            this.eventCallback('signout', { source: 'email_signin', user: this.user });
        }
        this.accessToken = details.accessToken;
        this.user = new user_1.AceBaseUser(details.user);
        this.eventCallback('signin', { source: 'email_signin', user: this.user, accessToken: this.accessToken });
        return { user: this.user, accessToken: this.accessToken }; //success: true,
    }
    /**
     * Sign into an account using a previously acquired access token
     * @param accessToken a previously acquired access token
     * @returns returns a promise that resolves with the signed in user and access token. If the token is not right, the thrown `error.code` will be `'not_found'` or `'invalid_token'`
     */
    async signInWithToken(accessToken) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        const details = await this.client.api.signInWithToken(accessToken);
        if (this.user) {
            this.eventCallback('signout', { source: 'token_signin', user: this.user });
        }
        this.accessToken = details.accessToken;
        this.user = new user_1.AceBaseUser(details.user);
        this.eventCallback('signin', { source: 'token_signin', user: this.user, accessToken: this.accessToken });
        return { user: this.user, accessToken: this.accessToken }; // success: true,
    }
    /**
     * If the client is offline, you can specify an access token to automatically try signing in the user once a connection is made.
     * Doing this is recommended if you are subscribing to event paths that require user authentication/authorization. Subscribing to
     * those server events will then be done after signing in, instead of failing after connecting anonymously.
     * @param accessToken A previously acquired access token
     */
    setAccessToken(accessToken) {
        this.client.api.setAccessToken(accessToken);
    }
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
    async startAuthProviderSignIn(providerName, callbackUrl, options) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        const details = await this.client.api.startAuthProviderSignIn(providerName, callbackUrl, options);
        return details.redirectUrl;
    }
    /**
     * Use this method to finish OAuth flow from your callbackUrl.
     * @param callbackResult result received in your.callback/url?result
     */
    async finishAuthProviderSignIn(callbackResult) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        const details = await this.client.api.finishAuthProviderSignIn(callbackResult);
        const isOtherUser = !this.user || this.user.uid !== details.user.uid;
        isOtherUser && this.eventCallback('signout', { source: 'oauth_signin', user: this.user });
        this.accessToken = details.accessToken;
        this.user = new user_1.AceBaseUser(details.user);
        isOtherUser && this.eventCallback('signin', { source: 'oauth_signin', user: this.user, accessToken: this.accessToken });
        return { user: this.user, accessToken: this.accessToken, provider: details.provider }; // success: true,
    }
    /**
     * Refreshes an expiring access token with the refresh token returned from finishAuthProviderSignIn
     */
    async refreshAuthProviderToken(providerName, refreshToken) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        const details = await this.client.api.refreshAuthProviderToken(providerName, refreshToken);
        return { provider: details.provider };
    }
    /**
     * Signs in with an external auth provider by redirecting the user to the provider's login page.
     * After signing in, the user will be redirected to the current browser url. Execute
     * getRedirectResult() when your page is loaded again to check if the user was authenticated.
     */
    async signInWithRedirect(providerName) {
        if (typeof window === 'undefined') {
            throw new Error(`signInWithRedirect can only be used within a browser context`);
        }
        const redirectUrl = await this.startAuthProviderSignIn(providerName, window.location.href);
        window.location.href = redirectUrl;
    }
    // TODO:
    // signInWithPopup(providerName: string): Promise<IAceBaseAuthProviderSignInResult>;
    /**
     * Checks if the user authentication with an auth provider.
     */
    async getRedirectResult() {
        if (typeof window === 'undefined') {
            throw new Error(`getRedirectResult can only be used within a browser context`);
        }
        const match = window.location.search.match(/[?&]result=(.*?)(?:&|$)/);
        const callbackResult = match && decodeURIComponent(match[1]);
        if (!callbackResult) {
            return null;
        }
        return await this.finishAuthProviderSignIn(callbackResult);
    }
    /**
     * Signs out of the current account
     * @param options options object, or boolean specifying whether to signout everywhere
     * @returnsreturns a promise that resolves when user was signed out successfully
     */
    async signOut(options = {
        everywhere: false,
        clearCache: false,
    }) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        else if (!this.user) {
            throw { code: 'not_signed_in', message: 'Not signed in!' };
        }
        if (this.client.connected) {
            await this.client.api.signOut(options);
        }
        this.accessToken = null;
        const user = this.user;
        this.user = null;
        this.eventCallback('signout', { source: 'signout', user });
    }
    /**
     * Changes the password of the currently signed into account
     * @param oldPassword
     * @param newPassword
     * @returns returns a promise that resolves with a new access token
     */
    async changePassword(oldPassword, newPassword) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        if (!this.user) {
            throw { code: 'not_signed_in', message: 'Not signed in!' };
        }
        const result = await this.client.api.changePassword(this.user.uid, oldPassword, newPassword);
        this.accessToken = result.accessToken;
        this.eventCallback('signin', { source: 'password_change', user: this.user, accessToken: this.accessToken });
        return { accessToken: result.accessToken }; //success: true,
    }
    /**
     * Requests a password reset for the account with specified email address
     * @param email
     * @returns returns a promise that resolves once the request has been processed
     */
    async forgotPassword(email) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        await this.client.api.forgotPassword(email);
    }
    /**
     * Requests a password to be changed using a previously acquired reset code, sent to the email address with `forgotPassword`
     * @param resetCode code sent to the user
     * @param newPassword new password chosen by the user
     * @returns returns a promise that resolves once the password has been changed. The user is now able to sign in with the new password
     */
    async resetPassword(resetCode, newPassword) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        await this.client.api.resetPassword(resetCode, newPassword);
    }
    /**
     * Verifies an e-mail address using the code sent to the email address upon signing up
     * @param verificationCode
     * @returns returns a promise that resolves when verification was successful
     */
    async verifyEmailAddress(verificationCode) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        await this.client.api.verifyEmailAddress(verificationCode);
    }
    /**
     * Updates one or more user account details
     * @returns returns a promise with the updated user details
     */
    async updateUserDetails(details) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        if (!this.user) {
            throw { code: 'not_signed_in', message: 'Not signed in!' };
        }
        if (typeof details !== 'object') {
            throw { code: 'invalid_details', message: 'details must be an object' };
        }
        const result = await this.client.api.updateUserDetails(details);
        if (!this.user) {
            // Signed out in the mean time
            return { user: null };
        }
        for (const key of Object.keys(result.user)) {
            this.user[key] = result.user[key];
        }
        return { user: this.user };
    }
    /**
     * Changes the username of the currrently signed into account
     * @returns returns a promise that resolves with the updated user details
     */
    async changeUsername(newUsername) {
        return this.updateUserDetails({ username: newUsername });
    }
    /**
     * Changes the display name of the currrently signed into account
     * @param newName
     * @returns returns a promise that resolves with the updated user details
     */
    async changeDisplayName(newName) {
        return this.updateUserDetails({ display_name: newName });
    }
    /**
     * Changes the email address of the currrently signed in user
     * @param newEmail
     * @returns returns a promise that resolves with the updated user details
     */
    async changeEmail(newEmail) {
        return this.updateUserDetails({ email: newEmail });
    }
    /**
     * Changes the user's profile picture
     * @returns returns a promise that resolves with the updated user details
     */
    async changePicture(newPicture) {
        return await this.updateUserDetails({ picture: newPicture });
    }
    /**
     * Updates settings of the currrently signed in user. Passed settings will be merged with the user's current settings
     * @param settings the settings to update
     * @returns returns a promise that resolves with the updated user details
     */
    async updateUserSettings(settings) {
        return await this.updateUserDetails({ settings });
    }
    /**
     * Creates a new user account with the given details. If successful, you will automatically be
     * signed into the account. Note: the request will fail if the server has disabled this option
     * @returns returns a promise that resolves with the signed in user and access token
     */
    async signUp(details) {
        if (!details.username && !details.email) {
            throw { code: 'invalid_details', message: 'No username or email set' };
        }
        if (!details.password) {
            throw { code: 'invalid_details', message: 'No password given' };
        }
        if (!this.client.isReady) {
            await this.client.ready();
        }
        const isAdmin = this.user && this.user.uid === 'admin';
        if (this.user && !isAdmin) {
            // Sign out of current account
            const user = this.user;
            this.user = null;
            this.eventCallback('signout', { source: 'signup', user });
        }
        const result = await this.client.api.signUp(details, !isAdmin);
        if (isAdmin) {
            return { user: result.user };
        }
        else {
            // Sign into new account
            this.accessToken = result.accessToken;
            this.user = new user_1.AceBaseUser(result.user);
            this.eventCallback('signin', { source: 'signup', user: this.user, accessToken: this.accessToken });
            return { user: this.user, accessToken: this.accessToken }; //success: true,
        }
    }
    /**
     * Removes the currently signed in user account and signs out. Note: this will only
     * remove the database user account, not any data stored in the database by this user. It is
     * your own responsibility to remove that data.
     * @param uid for admin user only: remove account with specific uid
     */
    async deleteAccount(uid) {
        if (!this.client.isReady) {
            await this.client.ready();
        }
        if (!this.user) {
            throw { code: 'not_signed_in', message: 'Not signed in!' };
        }
        if (uid && this.user.uid !== 'admin') {
            throw { code: 'not_admin', message: 'Cannot remove other accounts than signed into account, unless you are admin' };
        }
        const deleteUid = uid || this.user.uid;
        if (deleteUid === 'admin') {
            throw { code: 'not_allowed', message: 'Cannot remove admin user' };
        }
        const signOut = this.user.uid !== 'admin';
        const result = await this.client.api.deleteAccount(deleteUid, signOut);
        if (signOut) {
            // Sign out of the account
            this.accessToken = null;
            const user = this.user;
            this.user = null;
            this.eventCallback('signout', { source: 'delete_account', user });
        }
    }
}
exports.AceBaseClientAuth = AceBaseClientAuth;

},{"./user":13}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
/*
    * This file is used to generate a browser bundle to use as an include
    (re)generate it with: npm run browserify

    * To use AceBaseClient in the browser:
    <script type="text/javascript" src="dist/browser.min.js"></script>
    <script type="text/javascript">
        const db = new AceBaseClient({ dbname: 'dbname', host: 'localhost', port: 3000, https: false });
        db.ready(() => {
            // Ready to do some work
        })
    </script>
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const acebaseclient = require("./index");
window.acebaseclient = acebaseclient;
window.AceBaseClient = acebaseclient.AceBaseClient; // Shortcut to AceBaseClient
__exportStar(require("./index"), exports);

},{"./index":7}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = exports.PartialArray = exports.proxyAccess = exports.ID = exports.ObjectCollection = exports.TypeMappings = exports.PathReference = exports.EventSubscription = exports.EventStream = exports.DataReferencesArray = exports.DataSnapshotsArray = exports.DataSnapshot = exports.DataReference = exports.CachedValueUnavailableError = exports.ServerDate = exports.AceBaseUser = exports.AceBaseClientAuth = exports.AceBaseClient = void 0;
/**
   ________________________________________________________________________________

      ___          ______
     / _ \         | ___ \
    / /_\ \ ___ ___| |_/ / __ _ ___  ___
    |  _  |/ __/ _ \ ___ \/ _` / __|/ _ \
    | | | | (_|  __/ |_/ / (_| \__ \  __/
    \_| |_/\___\___\____/ \__,_|___/\___|
                 realtime database client

   Copyright 2018-2022 by Ewout Stortenbeker <http://appy.one>
   Released under MIT license

   See docs at https://github.com/appy-one/acebase-client
   ________________________________________________________________________________

*/
/*!
 * AceBaseClient
 * (c) 2018-2022 Ewout Stortenbeker <http://appy.one>
 * Released under MIT license
 */
var acebase_client_1 = require("./acebase-client");
Object.defineProperty(exports, "AceBaseClient", { enumerable: true, get: function () { return acebase_client_1.AceBaseClient; } });
var auth_1 = require("./auth");
Object.defineProperty(exports, "AceBaseClientAuth", { enumerable: true, get: function () { return auth_1.AceBaseClientAuth; } });
var user_1 = require("./user");
Object.defineProperty(exports, "AceBaseUser", { enumerable: true, get: function () { return user_1.AceBaseUser; } });
var server_date_1 = require("./server-date");
Object.defineProperty(exports, "ServerDate", { enumerable: true, get: function () { return server_date_1.ServerDate; } });
var errors_1 = require("./errors");
Object.defineProperty(exports, "CachedValueUnavailableError", { enumerable: true, get: function () { return errors_1.CachedValueUnavailableError; } });
var acebase_core_1 = require("acebase-core");
Object.defineProperty(exports, "DataReference", { enumerable: true, get: function () { return acebase_core_1.DataReference; } });
Object.defineProperty(exports, "DataSnapshot", { enumerable: true, get: function () { return acebase_core_1.DataSnapshot; } });
Object.defineProperty(exports, "DataSnapshotsArray", { enumerable: true, get: function () { return acebase_core_1.DataSnapshotsArray; } });
Object.defineProperty(exports, "DataReferencesArray", { enumerable: true, get: function () { return acebase_core_1.DataReferencesArray; } });
Object.defineProperty(exports, "EventStream", { enumerable: true, get: function () { return acebase_core_1.EventStream; } });
Object.defineProperty(exports, "EventSubscription", { enumerable: true, get: function () { return acebase_core_1.EventSubscription; } });
Object.defineProperty(exports, "PathReference", { enumerable: true, get: function () { return acebase_core_1.PathReference; } });
Object.defineProperty(exports, "TypeMappings", { enumerable: true, get: function () { return acebase_core_1.TypeMappings; } });
Object.defineProperty(exports, "ObjectCollection", { enumerable: true, get: function () { return acebase_core_1.ObjectCollection; } });
Object.defineProperty(exports, "ID", { enumerable: true, get: function () { return acebase_core_1.ID; } });
Object.defineProperty(exports, "proxyAccess", { enumerable: true, get: function () { return acebase_core_1.proxyAccess; } });
Object.defineProperty(exports, "PartialArray", { enumerable: true, get: function () { return acebase_core_1.PartialArray; } });
Object.defineProperty(exports, "Transport", { enumerable: true, get: function () { return acebase_core_1.Transport; } });

},{"./acebase-client":1,"./auth":3,"./errors":6,"./server-date":12,"./user":13,"acebase-core":25}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = performance;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseTimeout = exports.PromiseTimeoutError = void 0;
class PromiseTimeoutError extends Error {
}
exports.PromiseTimeoutError = PromiseTimeoutError;
function promiseTimeout(promise, ms, comment) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new PromiseTimeoutError(`Promise ${comment ? `"${comment}" ` : ''}timed out after ${ms}ms`)), ms);
        function success(result) {
            clearTimeout(timeout);
            resolve(result);
        }
        promise.then(success).catch(reject);
    });
}
exports.promiseTimeout = promiseTimeout;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
/**
 * @returns returns a promise that resolves with an object containing data and an optionally returned context
 */
async function request(method, url, options = { accessToken: null, data: null, dataReceivedCallback: null, dataRequestCallback: null, context: null }) {
    var _a;
    let postData = options.data;
    if (typeof postData === 'undefined' || postData === null) {
        postData = '';
    }
    else if (typeof postData === 'object') {
        postData = JSON.stringify(postData);
    }
    const headers = {
        'AceBase-Context': JSON.stringify(options.context || null),
    };
    const init = {
        method,
        headers,
        body: undefined,
    };
    if (typeof options.dataRequestCallback === 'function') {
        // Stream data to the server instead of posting all from memory at once
        headers['Content-Type'] = 'text/plain'; // Prevent server middleware parsing the content as JSON
        const supportsStreaming = false;
        if (supportsStreaming) {
            // Streaming uploads appears not to be implemented in Chromium/Chrome yet.
            // Setting the body property to a ReadableStream results in the string "[object ReadableStream]"
            // See https://bugs.chromium.org/p/chromium/issues/detail?id=688906 and https://stackoverflow.com/questions/40939857/fetch-with-readablestream-as-request-body
            let canceled = false;
            init.body = new ReadableStream({
                async pull(controller) {
                    var _a;
                    const chunkSize = controller.desiredSize || 1024 * 16;
                    const chunk = await ((_a = options.dataRequestCallback) === null || _a === void 0 ? void 0 : _a.call(options, chunkSize));
                    if (canceled || [null, ''].includes(chunk)) {
                        controller.close();
                    }
                    else {
                        controller.enqueue(chunk);
                    }
                },
                // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
                async start(controller) { },
                cancel() {
                    canceled = true;
                },
            });
        }
        else {
            // Streaming not supported
            postData = '';
            const chunkSize = 1024 * 512; // Use large chunk size, we have to store everything in memory anyway.
            let chunk;
            while ((chunk = await options.dataRequestCallback(chunkSize))) {
                postData += chunk;
            }
            init.body = postData;
        }
    }
    else if (postData.length > 0) {
        headers['Content-Type'] = 'application/json';
        init.body = postData;
    }
    if (options.accessToken) {
        headers['Authorization'] = `Bearer ${options.accessToken}`;
    }
    const request = { url, method, headers, body: undefined };
    const res = await fetch(request.url, init).catch(err => {
        // console.error(err);
        throw new error_1.AceBaseRequestError(request, null, 'fetch_failed', err.message);
    });
    let data = '';
    if (typeof options.dataReceivedCallback === 'function') {
        // Stream response
        const reader = (_a = res.body) === null || _a === void 0 ? void 0 : _a.getReader();
        await new Promise((resolve, reject) => {
            (async function readNext() {
                var _a;
                try {
                    const result = await (reader === null || reader === void 0 ? void 0 : reader.read());
                    (_a = options.dataReceivedCallback) === null || _a === void 0 ? void 0 : _a.call(options, result === null || result === void 0 ? void 0 : result.value);
                    if (result === null || result === void 0 ? void 0 : result.done) {
                        return resolve();
                    }
                    readNext();
                }
                catch (err) {
                    reader === null || reader === void 0 ? void 0 : reader.cancel('error');
                    reject(err);
                }
            })();
        });
    }
    else {
        data = await res.text();
    }
    const isJSON = data[0] === '{' || data[0] === '['; // || (res.headers['content-type'] || '').startsWith('application/json')
    if (res.status === 200) {
        const contextHeader = res.headers.get('AceBase-Context');
        let context;
        if (contextHeader && contextHeader[0] === '{') {
            context = JSON.parse(contextHeader);
        }
        else {
            context = {};
        }
        if (isJSON) {
            data = JSON.parse(data);
        }
        return { context, data };
    }
    else {
        request.body = postData;
        const response = {
            statusCode: res.status,
            statusMessage: res.statusText,
            headers: res.headers,
            body: data,
        };
        let code = res.status, message = res.statusText;
        if (isJSON) {
            const err = JSON.parse(data);
            if (err.code) {
                code = err.code;
            }
            if (err.message) {
                message = err.message;
            }
        }
        throw (new error_1.AceBaseRequestError(request, response, code, message));
    }
}
exports.default = request;

},{"./error":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOT_CONNECTED_ERROR_MESSAGE = exports.AceBaseRequestError = void 0;
class AceBaseRequestError extends Error {
    constructor(request, response, code, message = 'unknown error') {
        super(message);
        this.request = request;
        this.response = response;
        this.code = code;
        this.message = message;
    }
    get isNetworkError() {
        return this.response === null;
    }
}
exports.AceBaseRequestError = AceBaseRequestError;
exports.NOT_CONNECTED_ERROR_MESSAGE = 'remote database is not connected'; //'AceBaseClient is not connected';

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerDate = exports.setServerBias = void 0;
const acebase_core_1 = require("acebase-core");
const performance_1 = require("./performance");
const time = {
    serverBias: 0,
    localBias: 0,
    lastTime: Date.now(),
    lastPerf: performance_1.default.now(),
    get bias() { return this.serverBias + this.localBias; },
};
function biasChanged() {
    console.log(`Bias changed. server bias = ${time.serverBias}ms, local bias = ${time.localBias}ms`);
    acebase_core_1.ID.timeBias = time.bias; // undocumented
}
// Keep monitoring local time for changes, adjust local bias accordingly
const interval = 10000; // 10s
function checkLocalTime() {
    // console.log('Checking time...');
    const now = Date.now(), // eg 20:00:00
    perf = performance_1.default.now(), msPassed = perf - time.lastPerf, // now - time.lastTime, //
    expected = time.lastTime + Math.round(msPassed), // 19:00:00
    diff = expected - now; // -1h
    if (Math.abs(diff) > 1) {
        console.log(`Local time changed. diff = ${diff}ms`);
        time.localBias += diff;
        biasChanged();
    }
    time.lastTime = now;
    time.lastPerf = perf;
    scheduleLocalTimeCheck();
}
function scheduleLocalTimeCheck() {
    const timeout = setTimeout(checkLocalTime, interval);
    timeout.unref && timeout.unref(); // Don't delay exiting the main process when the event loop is empty
}
scheduleLocalTimeCheck();
function setServerBias(bias) {
    if (typeof bias === 'number') {
        time.serverBias = bias;
        time.localBias = 0;
        biasChanged();
    }
}
exports.setServerBias = setServerBias;
class ServerDate extends Date {
    constructor() {
        const biasedTime = Date.now() + time.bias;
        super(biasedTime);
    }
}
exports.ServerDate = ServerDate;

},{"./performance":8,"acebase-core":25}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AceBaseBase = exports.AceBaseBaseSettings = void 0;
/**
   ________________________________________________________________________________

      ___          ______
     / _ \         | ___ \
    / /_\ \ ___ ___| |_/ / __ _ ___  ___
    |  _  |/ __/ _ \ ___ \/ _` / __|/ _ \
    | | | | (_|  __/ |_/ / (_| \__ \  __/
    \_| |_/\___\___\____/ \__,_|___/\___|
                        realtime database

   Copyright 2018-2022 by Ewout Stortenbeker (me@appy.one)
   Published under MIT license

   See docs at https://github.com/appy-one/acebase
   ________________________________________________________________________________

*/
const simple_event_emitter_1 = require("./simple-event-emitter");
const data_reference_1 = require("./data-reference");
const type_mappings_1 = require("./type-mappings");
const optional_observable_1 = require("./optional-observable");
const debug_1 = require("./debug");
const simple_colors_1 = require("./simple-colors");
class AceBaseBaseSettings {
    constructor(options) {
        /**
         * What level to use for console logging.
         * @default 'log'
         */
        this.logLevel = 'log';
        /**
         * Whether to use colors in the console logs output
         * @default true
         */
        this.logColors = true;
        /**
         * @internal (for internal use)
         */
        this.info = 'realtime database';
        /**
         * You can turn this on if you are a sponsor. See https://github.com/appy-one/acebase/discussions/100 for more info
         */
        this.sponsor = false;
        if (typeof options !== 'object') {
            options = {};
        }
        if (typeof options.logLevel === 'string') {
            this.logLevel = options.logLevel;
        }
        if (typeof options.logColors === 'boolean') {
            this.logColors = options.logColors;
        }
        if (typeof options.info === 'string') {
            this.info = options.info;
        }
        if (typeof options.sponsor === 'boolean') {
            this.sponsor = options.sponsor;
        }
    }
}
exports.AceBaseBaseSettings = AceBaseBaseSettings;
class AceBaseBase extends simple_event_emitter_1.SimpleEventEmitter {
    /**
     * @param dbname Name of the database to open or create
     */
    constructor(dbname, options = {}) {
        super();
        this._ready = false;
        options = new AceBaseBaseSettings(options);
        this.name = dbname;
        // Setup console logging
        this.debug = new debug_1.DebugLogger(options.logLevel, `[${dbname}]`);
        // Enable/disable logging with colors
        (0, simple_colors_1.SetColorsEnabled)(options.logColors);
        // ASCI art: http://patorjk.com/software/taag/#p=display&f=Doom&t=AceBase
        const logoStyle = [simple_colors_1.ColorStyle.magenta, simple_colors_1.ColorStyle.bold];
        const logo = '     ___          ______                ' + '\n' +
            '    / _ \\         | ___ \\               ' + '\n' +
            '   / /_\\ \\ ___ ___| |_/ / __ _ ___  ___ ' + '\n' +
            '   |  _  |/ __/ _ \\ ___ \\/ _` / __|/ _ \\' + '\n' +
            '   | | | | (_|  __/ |_/ / (_| \\__ \\  __/' + '\n' +
            '   \\_| |_/\\___\\___\\____/ \\__,_|___/\\___|';
        const info = (options.info ? ''.padStart(40 - options.info.length, ' ') + options.info + '\n' : '');
        if (!options.sponsor) {
            // if you are a sponsor, you can switch off the "AceBase banner ad"
            this.debug.write(logo.colorize(logoStyle));
            info && this.debug.write(info.colorize(simple_colors_1.ColorStyle.magenta));
        }
        // Setup type mapping functionality
        this.types = new type_mappings_1.TypeMappings(this);
        this.once('ready', () => {
            // console.log(`database "${dbname}" (${this.constructor.name}) is ready to use`);
            this._ready = true;
        });
    }
    /**
     * Waits for the database to be ready before running your callback.
     * @param callback (optional) callback function that is called when the database is ready to be used. You can also use the returned promise.
     * @returns returns a promise that resolves when ready
     */
    async ready(callback) {
        if (!this._ready) {
            // Wait for ready event
            await new Promise(resolve => this.on('ready', resolve));
        }
        callback === null || callback === void 0 ? void 0 : callback();
    }
    get isReady() {
        return this._ready;
    }
    /**
     * Allow specific observable implementation to be used
     * @param ObservableImpl Implementation to use
     */
    setObservable(ObservableImpl) {
        (0, optional_observable_1.setObservable)(ObservableImpl);
    }
    /**
     * Creates a reference to a node
     * @param path
     * @returns reference to the requested node
     */
    ref(path) {
        return new data_reference_1.DataReference(this, path);
    }
    /**
     * Get a reference to the root database node
     * @returns reference to root node
     */
    get root() {
        return this.ref('');
    }
    /**
     * Creates a query on the requested node
     * @param path
     * @returns query for the requested node
     */
    query(path) {
        const ref = new data_reference_1.DataReference(this, path);
        return new data_reference_1.DataReferenceQuery(ref);
    }
    get indexes() {
        return {
            /**
             * Gets all indexes
             */
            get: () => {
                return this.api.getIndexes();
            },
            /**
             * Creates an index on "key" for all child nodes at "path". If the index already exists, nothing happens.
             * Example: creating an index on all "name" keys of child objects of path "system/users",
             * will index "system/users/user1/name", "system/users/user2/name" etc.
             * You can also use wildcard paths to enable indexing and quering of fragmented data.
             * Example: path "users/*\/posts", key "title": will index all "title" keys in all posts of all users.
             * @param path path to the container node
             * @param key name of the key to index every container child node
             * @param options any additional options
             */
            create: (path, key, options) => {
                return this.api.createIndex(path, key, options);
            },
            /**
             * Deletes an existing index from the database
             */
            delete: async (filePath) => {
                return this.api.deleteIndex(filePath);
            },
        };
    }
    get schema() {
        return {
            get: (path) => {
                return this.api.getSchema(path);
            },
            set: (path, schema) => {
                return this.api.setSchema(path, schema);
            },
            all: () => {
                return this.api.getSchemas();
            },
            check: (path, value, isUpdate) => {
                return this.api.validateSchema(path, value, isUpdate);
            },
        };
    }
}
exports.AceBaseBase = AceBaseBase;

},{"./data-reference":21,"./debug":23,"./optional-observable":27,"./simple-colors":34,"./simple-event-emitter":35,"./type-mappings":38}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
class NotImplementedError extends Error {
    constructor(name) { super(`${name} is not implemented`); }
}
/**
 * Refactor to type/interface once acebase and acebase-client have been ported to TS
 */
class Api {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }
    /**
     * Provides statistics
     * @param options
     */
    stats(options) { throw new NotImplementedError('stats'); }
    /**
     * @param path
     * @param event event to subscribe to ("value", "child_added" etc)
     * @param callback callback function
     */
    subscribe(path, event, callback, settings) { throw new NotImplementedError('subscribe'); }
    unsubscribe(path, event, callback) { throw new NotImplementedError('unsubscribe'); }
    update(path, updates, options) { throw new NotImplementedError('update'); }
    set(path, value, options) { throw new NotImplementedError('set'); }
    get(path, options) { throw new NotImplementedError('get'); }
    transaction(path, callback, options) { throw new NotImplementedError('transaction'); }
    exists(path) { throw new NotImplementedError('exists'); }
    query(path, query, options) { throw new NotImplementedError('query'); }
    reflect(path, type, args) { throw new NotImplementedError('reflect'); }
    export(path, write, options) { throw new NotImplementedError('export'); }
    import(path, read, options) { throw new NotImplementedError('import'); }
    /** Creates an index on key for all child nodes at path */
    createIndex(path, key, options) { throw new NotImplementedError('createIndex'); }
    getIndexes() { throw new NotImplementedError('getIndexes'); }
    deleteIndex(filePath) { throw new NotImplementedError('deleteIndex'); }
    setSchema(path, schema) { throw new NotImplementedError('setSchema'); }
    getSchema(path) { throw new NotImplementedError('getSchema'); }
    getSchemas() { throw new NotImplementedError('getSchemas'); }
    validateSchema(path, value, isUpdate) { throw new NotImplementedError('validateSchema'); }
    getMutations(filter) { throw new NotImplementedError('getMutations'); }
    getChanges(filter) { throw new NotImplementedError('getChanges'); }
}
exports.Api = Api;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ascii85 = void 0;
function c(input, length, result) {
    const b = [0, 0, 0, 0, 0];
    for (let i = 0; i < length; i += 4) {
        let n = ((input[i] * 256 + input[i + 1]) * 256 + input[i + 2]) * 256 + input[i + 3];
        if (!n) {
            result.push('z');
        }
        else {
            for (let j = 0; j < 5; b[j++] = n % 85 + 33, n = Math.floor(n / 85)) { }
            result.push(String.fromCharCode(b[4], b[3], b[2], b[1], b[0]));
        }
    }
}
function encode(arr) {
    // summary: encodes input data in ascii85 string
    // input: ArrayLike
    const input = arr, result = [], remainder = input.length % 4, length = input.length - remainder;
    c(input, length, result);
    if (remainder) {
        const t = new Uint8Array(4);
        t.set(input.slice(length), 0);
        c(t, 4, result);
        let x = result.pop();
        if (x == 'z') {
            x = '!!!!!';
        }
        result.push(x.substr(0, remainder + 1));
    }
    let ret = result.join(''); // String
    ret = '<~' + ret + '~>';
    return ret;
}
exports.ascii85 = {
    encode: function (arr) {
        if (arr instanceof ArrayBuffer) {
            arr = new Uint8Array(arr, 0, arr.byteLength);
        }
        return encode(arr);
    },
    decode: function (input) {
        // summary: decodes the input string back to an ArrayBuffer
        // input: String: the input string to decode
        if (!input.startsWith('<~') || !input.endsWith('~>')) {
            throw new Error('Invalid input string');
        }
        input = input.substr(2, input.length - 4);
        const n = input.length, r = [], b = [0, 0, 0, 0, 0];
        let t, x, y, d;
        for (let i = 0; i < n; ++i) {
            if (input.charAt(i) == 'z') {
                r.push(0, 0, 0, 0);
                continue;
            }
            for (let j = 0; j < 5; ++j) {
                b[j] = input.charCodeAt(i + j) - 33;
            }
            d = n - i;
            if (d < 5) {
                for (let j = d; j < 4; b[++j] = 0) { }
                b[d] = 85;
            }
            t = (((b[0] * 85 + b[1]) * 85 + b[2]) * 85 + b[3]) * 85 + b[4];
            x = t & 255;
            t >>>= 8;
            y = t & 255;
            t >>>= 8;
            r.push(t >>> 8, t & 255, y, x);
            for (let j = d; j < 5; ++j, r.pop()) { }
            i += 4;
        }
        const data = new Uint8Array(r);
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    },
};

},{}],17:[function(require,module,exports){
"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const pad_1 = require("../pad");
const env = typeof window === 'object' ? window : self, globalCount = Object.keys(env).length, mimeTypesLength = (_b = (_a = navigator.mimeTypes) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0, clientId = (0, pad_1.default)((mimeTypesLength
    + navigator.userAgent.length).toString(36)
    + globalCount.toString(36), 4);
function fingerprint() {
    return clientId;
}
exports.default = fingerprint;

},{"../pad":19}],18:[function(require,module,exports){
"use strict";
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 *
 * time biasing added by Ewout Stortenbeker for AceBase
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fingerprint_1 = require("./fingerprint");
const pad_1 = require("./pad");
let c = 0;
const blockSize = 4, base = 36, discreteValues = Math.pow(base, blockSize);
function randomBlock() {
    return (0, pad_1.default)((Math.random() * discreteValues << 0).toString(base), blockSize);
}
function safeCounter() {
    c = c < discreteValues ? c : 0;
    c++; // this is not subliminal
    return c - 1;
}
function cuid(timebias = 0) {
    // Starting with a lowercase letter makes
    // it HTML element ID friendly.
    const letter = 'c', // hard-coded allows for sequential access
    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    // NOTES Ewout:
    // - added timebias
    // - at '2059/05/25 19:38:27.456', timestamp will become 1 character larger!
    timestamp = (new Date().getTime() + timebias).toString(base), 
    // Prevent same-machine collisions.
    counter = (0, pad_1.default)(safeCounter().toString(base), blockSize), 
    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = (0, fingerprint_1.default)(), 
    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();
    return letter + timestamp + counter + print + random;
}
exports.default = cuid;
// Not using slugs, removed code

},{"./fingerprint":17,"./pad":19}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function pad(num, size) {
    const s = '000000000' + num;
    return s.substr(s.length - size);
}
exports.default = pad;

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderedCollectionProxy = exports.proxyAccess = exports.LiveDataProxy = void 0;
const utils_1 = require("./utils");
const data_reference_1 = require("./data-reference");
const data_snapshot_1 = require("./data-snapshot");
const path_reference_1 = require("./path-reference");
const id_1 = require("./id");
const optional_observable_1 = require("./optional-observable");
const process_1 = require("./process");
const path_info_1 = require("./path-info");
const simple_event_emitter_1 = require("./simple-event-emitter");
class RelativeNodeTarget extends Array {
    static areEqual(t1, t2) {
        return t1.length === t2.length && t1.every((key, i) => t2[i] === key);
    }
    static isAncestor(ancestor, other) {
        return ancestor.length < other.length && ancestor.every((key, i) => other[i] === key);
    }
    static isDescendant(descendant, other) {
        return descendant.length > other.length && other.every((key, i) => descendant[i] === key);
    }
}
const isProxy = Symbol('isProxy');
class LiveDataProxy {
    /**
     * Creates a live data proxy for the given reference. The data of the reference's path will be loaded, and kept in-sync
     * with live data by listening for 'mutations' events. Any changes made to the value by the client will be synced back
     * to the database.
     * @param ref DataReference to create proxy for.
     * @param options proxy initialization options
     * be written to the database.
     */
    static async create(ref, options) {
        var _a;
        ref = new data_reference_1.DataReference(ref.db, ref.path); // Use copy to prevent context pollution on original reference
        let cache, loaded = false;
        let latestCursor = options === null || options === void 0 ? void 0 : options.cursor;
        let proxy;
        const proxyId = id_1.ID.generate(); //ref.push().key;
        // let onMutationCallback: ProxyObserveMutationsCallback;
        // let onErrorCallback: ProxyObserveErrorCallback = err => {
        //     console.error(err.message, err.details);
        // };
        const clientSubscriptions = [];
        const clientEventEmitter = new simple_event_emitter_1.SimpleEventEmitter();
        clientEventEmitter.on('cursor', (cursor) => latestCursor = cursor);
        clientEventEmitter.on('error', (err) => {
            console.error(err.message, err.details);
        });
        const applyChange = (keys, newValue) => {
            // Make changes to cache
            if (keys.length === 0) {
                cache = newValue;
                return true;
            }
            const allowCreation = false; //cache === null; // If the proxy'd target did not exist upon load, we must allow it to be created now.
            if (allowCreation) {
                cache = typeof keys[0] === 'number' ? [] : {};
            }
            let target = cache;
            const trailKeys = keys.slice();
            while (trailKeys.length > 1) {
                const key = trailKeys.shift();
                if (!(key in target)) {
                    if (allowCreation) {
                        target[key] = typeof key === 'number' ? [] : {};
                    }
                    else {
                        // Have we missed an event, or are local pending mutations creating this conflict?
                        return false; // Do not proceed
                    }
                }
                target = target[key];
            }
            const prop = trailKeys.shift();
            if (newValue === null) {
                // Remove it
                target instanceof Array ? target.splice(prop, 1) : delete target[prop];
            }
            else {
                // Set or update it
                target[prop] = newValue;
            }
            return true;
        };
        // Subscribe to mutations events on the target path
        const syncFallback = async () => {
            if (!loaded) {
                return;
            }
            await reload();
        };
        const subscription = ref.on('mutations', { syncFallback }).subscribe(async (snap) => {
            var _a;
            if (!loaded) {
                return;
            }
            const context = snap.context();
            const isRemote = ((_a = context.acebase_proxy) === null || _a === void 0 ? void 0 : _a.id) !== proxyId;
            if (!isRemote) {
                return; // Update was done through this proxy, no need to update cache or trigger local value subscriptions
            }
            const mutations = snap.val(false);
            const proceed = mutations.every(mutation => {
                if (!applyChange(mutation.target, mutation.val)) {
                    return false;
                }
                // if (onMutationCallback) {
                const changeRef = mutation.target.reduce((ref, key) => ref.child(key), ref);
                const changeSnap = new data_snapshot_1.DataSnapshot(changeRef, mutation.val, false, mutation.prev, snap.context());
                // onMutationCallback(changeSnap, isRemote); // onMutationCallback uses try/catch for client callback
                clientEventEmitter.emit('mutation', { snapshot: changeSnap, isRemote });
                // }
                return true;
            });
            if (proceed) {
                clientEventEmitter.emit('cursor', context.acebase_cursor); // // NOTE: cursor is only present in mutations done remotely. For our own updates, server cursors are returned by ref.set and ref.update
                localMutationsEmitter.emit('mutations', { origin: 'remote', snap });
            }
            else {
                console.warn(`Cached value of live data proxy on "${ref.path}" appears outdated, will be reloaded`);
                await reload();
            }
        });
        // Setup updating functionality: enqueue all updates, process them at next tick in the order they were issued
        let processPromise = Promise.resolve();
        const mutationQueue = [];
        const transactions = [];
        const pushLocalMutations = async () => {
            // Sync all local mutations that are not in a transaction
            const mutations = [];
            for (let i = 0, m = mutationQueue[0]; i < mutationQueue.length; i++, m = mutationQueue[i]) {
                if (!transactions.find(t => RelativeNodeTarget.areEqual(t.target, m.target) || RelativeNodeTarget.isAncestor(t.target, m.target))) {
                    mutationQueue.splice(i, 1);
                    i--;
                    mutations.push(m);
                }
            }
            if (mutations.length === 0) {
                return;
            }
            // Add current (new) values to mutations
            mutations.forEach(mutation => {
                mutation.value = (0, utils_1.cloneObject)(getTargetValue(cache, mutation.target));
            });
            // Run local onMutation & onChange callbacks in the next tick
            process_1.default.nextTick(() => {
                // Run onMutation callback for each changed node
                const context = { acebase_proxy: { id: proxyId, source: 'update' } };
                // if (onMutationCallback) {
                mutations.forEach(mutation => {
                    const mutationRef = mutation.target.reduce((ref, key) => ref.child(key), ref);
                    const mutationSnap = new data_snapshot_1.DataSnapshot(mutationRef, mutation.value, false, mutation.previous, context);
                    // onMutationCallback(mutationSnap, false);
                    clientEventEmitter.emit('mutation', { snapshot: mutationSnap, isRemote: false });
                });
                // }
                // Notify local subscribers
                const snap = new data_snapshot_1.MutationsDataSnapshot(ref, mutations.map(m => ({ target: m.target, val: m.value, prev: m.previous })), context);
                localMutationsEmitter.emit('mutations', { origin: 'local', snap });
            });
            // Update database async
            // const batchId = ID.generate();
            processPromise = mutations
                .reduce((mutations, m, i, arr) => {
                // Only keep top path mutations to prevent unneccessary child path updates
                if (!arr.some(other => RelativeNodeTarget.isAncestor(other.target, m.target))) {
                    mutations.push(m);
                }
                return mutations;
            }, [])
                .reduce((updates, m) => {
                // Prepare db updates
                const target = m.target;
                if (target.length === 0) {
                    // Overwrite this proxy's root value
                    updates.push({ ref, target, value: cache, type: 'set', previous: m.previous });
                }
                else {
                    const parentTarget = target.slice(0, -1);
                    const key = target.slice(-1)[0];
                    const parentRef = parentTarget.reduce((ref, key) => ref.child(key), ref);
                    const parentUpdate = updates.find(update => update.ref.path === parentRef.path);
                    const cacheValue = getTargetValue(cache, target); // m.value?
                    const prevValue = m.previous;
                    if (parentUpdate) {
                        parentUpdate.value[key] = cacheValue;
                        parentUpdate.previous[key] = prevValue;
                    }
                    else {
                        updates.push({ ref: parentRef, target: parentTarget, value: { [key]: cacheValue }, type: 'update', previous: { [key]: prevValue } });
                    }
                }
                return updates;
            }, [])
                .reduce(async (promise, update /*, i, updates */) => {
                // Execute db update
                // i === 0 && console.log(`Proxy: processing ${updates.length} db updates to paths:`, updates.map(update => update.ref.path));
                const context = {
                    acebase_proxy: {
                        id: proxyId,
                        source: update.type,
                        // update_id: ID.generate(),
                        // batch_id: batchId,
                        // batch_updates: updates.length
                    },
                };
                await promise;
                await update.ref
                    .context(context)[update.type](update.value) // .set or .update
                    .catch(err => {
                    clientEventEmitter.emit('error', { source: 'update', message: `Error processing update of "/${ref.path}"`, details: err });
                    // console.warn(`Proxy could not update DB, should rollback (${update.type}) the proxy value of "${update.ref.path}" to: `, update.previous);
                    const context = { acebase_proxy: { id: proxyId, source: 'update-rollback' } };
                    const mutations = [];
                    if (update.type === 'set') {
                        setTargetValue(cache, update.target, update.previous);
                        const mutationSnap = new data_snapshot_1.DataSnapshot(update.ref, update.previous, false, update.value, context);
                        clientEventEmitter.emit('mutation', { snapshot: mutationSnap, isRemote: false });
                        mutations.push({ target: update.target, val: update.previous, prev: update.value });
                    }
                    else {
                        // update
                        Object.keys(update.previous).forEach(key => {
                            setTargetValue(cache, update.target.concat(key), update.previous[key]);
                            const mutationSnap = new data_snapshot_1.DataSnapshot(update.ref.child(key), update.previous[key], false, update.value[key], context);
                            clientEventEmitter.emit('mutation', { snapshot: mutationSnap, isRemote: false });
                            mutations.push({ target: update.target.concat(key), val: update.previous[key], prev: update.value[key] });
                        });
                    }
                    // Run onMutation callback for each node being rolled back
                    mutations.forEach(m => {
                        const mutationRef = m.target.reduce((ref, key) => ref.child(key), ref);
                        const mutationSnap = new data_snapshot_1.DataSnapshot(mutationRef, m.val, false, m.prev, context);
                        clientEventEmitter.emit('mutation', { snapshot: mutationSnap, isRemote: false });
                    });
                    // Notify local subscribers:
                    const snap = new data_snapshot_1.MutationsDataSnapshot(update.ref, mutations, context);
                    localMutationsEmitter.emit('mutations', { origin: 'local', snap });
                });
                if (update.ref.cursor) {
                    // Should also be available in context.acebase_cursor now
                    clientEventEmitter.emit('cursor', update.ref.cursor);
                }
            }, processPromise);
            await processPromise;
        };
        let syncInProgress = false;
        const syncPromises = [];
        const syncCompleted = () => {
            let resolve;
            const promise = new Promise(rs => resolve = rs);
            syncPromises.push({ resolve });
            return promise;
        };
        let processQueueTimeout = null;
        const scheduleSync = () => {
            if (!processQueueTimeout) {
                processQueueTimeout = setTimeout(async () => {
                    syncInProgress = true;
                    processQueueTimeout = null;
                    await pushLocalMutations();
                    syncInProgress = false;
                    syncPromises.splice(0).forEach(p => p.resolve());
                }, 0);
            }
        };
        const flagOverwritten = (target) => {
            if (!mutationQueue.find(m => RelativeNodeTarget.areEqual(m.target, target))) {
                mutationQueue.push({ target, previous: (0, utils_1.cloneObject)(getTargetValue(cache, target)) });
            }
            // schedule database updates
            scheduleSync();
        };
        const localMutationsEmitter = new simple_event_emitter_1.SimpleEventEmitter();
        const addOnChangeHandler = (target, callback) => {
            const isObject = (val) => val !== null && typeof val === 'object';
            const mutationsHandler = async (details) => {
                var _a;
                const { snap, origin } = details;
                const context = snap.context();
                const causedByOurProxy = ((_a = context.acebase_proxy) === null || _a === void 0 ? void 0 : _a.id) === proxyId;
                if (details.origin === 'remote' && causedByOurProxy) {
                    // Any local changes already triggered subscription callbacks
                    console.error('DEV ISSUE: mutationsHandler was called from remote event originating from our own proxy');
                    return;
                }
                const mutations = snap.val(false).filter(mutation => {
                    // Keep mutations impacting the subscribed target: mutations on target, or descendant or ancestor of target
                    return mutation.target.slice(0, target.length).every((key, i) => target[i] === key);
                });
                if (mutations.length === 0) {
                    return;
                }
                let newValue, previousValue;
                // If there is a mutation on the target itself, or parent/ancestor path, there can only be one. We can take a shortcut
                const singleMutation = mutations.find(m => m.target.length <= target.length);
                if (singleMutation) {
                    const trailKeys = target.slice(singleMutation.target.length);
                    newValue = trailKeys.reduce((val, key) => !isObject(val) || !(key in val) ? null : val[key], singleMutation.val);
                    previousValue = trailKeys.reduce((val, key) => !isObject(val) || !(key in val) ? null : val[key], singleMutation.prev);
                }
                else {
                    // All mutations are on children/descendants of our target
                    // Construct new & previous values by combining cache and snapshot
                    const currentValue = getTargetValue(cache, target);
                    newValue = (0, utils_1.cloneObject)(currentValue);
                    previousValue = (0, utils_1.cloneObject)(newValue);
                    mutations.forEach(mutation => {
                        // mutation.target is relative to proxy root
                        const trailKeys = mutation.target.slice(target.length);
                        for (let i = 0, val = newValue, prev = previousValue; i < trailKeys.length; i++) { // arr = PathInfo.getPathKeys(mutationPath).slice(PathInfo.getPathKeys(targetRef.path).length)
                            const last = i + 1 === trailKeys.length, key = trailKeys[i];
                            if (last) {
                                val[key] = mutation.val;
                                if (val[key] === null) {
                                    delete val[key];
                                }
                                prev[key] = mutation.prev;
                                if (prev[key] === null) {
                                    delete prev[key];
                                }
                            }
                            else {
                                val = val[key] = key in val ? val[key] : {};
                                prev = prev[key] = key in prev ? prev[key] : {};
                            }
                        }
                    });
                }
                process_1.default.nextTick(() => {
                    // Run callback with read-only (frozen) values in next tick
                    let keepSubscription = true;
                    try {
                        keepSubscription = false !== callback(Object.freeze(newValue), Object.freeze(previousValue), !causedByOurProxy, context);
                    }
                    catch (err) {
                        clientEventEmitter.emit('error', { source: origin === 'remote' ? 'remote_update' : 'local_update', message: 'Error running subscription callback', details: err });
                    }
                    if (keepSubscription === false) {
                        stop();
                    }
                });
            };
            localMutationsEmitter.on('mutations', mutationsHandler);
            const stop = () => {
                localMutationsEmitter.off('mutations').off('mutations', mutationsHandler);
                clientSubscriptions.splice(clientSubscriptions.findIndex(cs => cs.stop === stop), 1);
            };
            clientSubscriptions.push({ target, stop });
            return { stop };
        };
        const handleFlag = (flag, target, args) => {
            if (flag === 'write') {
                return flagOverwritten(target);
            }
            else if (flag === 'onChange') {
                return addOnChangeHandler(target, args.callback);
            }
            else if (flag === 'subscribe' || flag === 'observe') {
                const subscribe = (subscriber) => {
                    const currentValue = getTargetValue(cache, target);
                    subscriber.next(currentValue);
                    const subscription = addOnChangeHandler(target, (value /*, previous, isRemote, context */) => {
                        subscriber.next(value);
                    });
                    return function unsubscribe() {
                        subscription.stop();
                    };
                };
                if (flag === 'subscribe') {
                    return subscribe;
                }
                // Try to load Observable
                const Observable = (0, optional_observable_1.getObservable)();
                return new Observable(subscribe);
            }
            else if (flag === 'transaction') {
                const hasConflictingTransaction = transactions.some(t => RelativeNodeTarget.areEqual(target, t.target) || RelativeNodeTarget.isAncestor(target, t.target) || RelativeNodeTarget.isDescendant(target, t.target));
                if (hasConflictingTransaction) {
                    // TODO: Wait for this transaction to finish, then try again
                    return Promise.reject(new Error('Cannot start transaction because it conflicts with another transaction'));
                }
                return new Promise(async (resolve) => {
                    // If there are pending mutations on target (or deeper), wait until they have been synchronized
                    const hasPendingMutations = mutationQueue.some(m => RelativeNodeTarget.areEqual(target, m.target) || RelativeNodeTarget.isAncestor(target, m.target));
                    if (hasPendingMutations) {
                        if (!syncInProgress) {
                            scheduleSync();
                        }
                        await syncCompleted();
                    }
                    const tx = { target, status: 'started', transaction: null };
                    transactions.push(tx);
                    tx.transaction = {
                        get status() { return tx.status; },
                        get completed() { return tx.status !== 'started'; },
                        get mutations() {
                            return mutationQueue.filter(m => RelativeNodeTarget.areEqual(tx.target, m.target) || RelativeNodeTarget.isAncestor(tx.target, m.target));
                        },
                        get hasMutations() {
                            return this.mutations.length > 0;
                        },
                        async commit() {
                            if (this.completed) {
                                throw new Error(`Transaction has completed already (status '${tx.status}')`);
                            }
                            tx.status = 'finished';
                            transactions.splice(transactions.indexOf(tx), 1);
                            if (syncInProgress) {
                                // Currently syncing without our mutations
                                await syncCompleted();
                            }
                            scheduleSync();
                            await syncCompleted();
                        },
                        rollback() {
                            // Remove mutations from queue
                            if (this.completed) {
                                throw new Error(`Transaction has completed already (status '${tx.status}')`);
                            }
                            tx.status = 'canceled';
                            const mutations = [];
                            for (let i = 0; i < mutationQueue.length; i++) {
                                const m = mutationQueue[i];
                                if (RelativeNodeTarget.areEqual(tx.target, m.target) || RelativeNodeTarget.isAncestor(tx.target, m.target)) {
                                    mutationQueue.splice(i, 1);
                                    i--;
                                    mutations.push(m);
                                }
                            }
                            // Replay mutations in reverse order
                            mutations.reverse()
                                .forEach(m => {
                                if (m.target.length === 0) {
                                    cache = m.previous;
                                }
                                else {
                                    setTargetValue(cache, m.target, m.previous);
                                }
                            });
                            // Remove transaction
                            transactions.splice(transactions.indexOf(tx), 1);
                        },
                    };
                    resolve(tx.transaction);
                });
            }
        };
        const snap = await ref.get({ cache_mode: 'allow', cache_cursor: options === null || options === void 0 ? void 0 : options.cursor });
        // const gotOfflineStartValue = snap.context().acebase_origin === 'cache';
        // if (gotOfflineStartValue) {
        //     console.warn(`Started data proxy with cached value of "${ref.path}", check if its value is reloaded on next connection!`);
        // }
        if (snap.context().acebase_origin !== 'cache') {
            clientEventEmitter.emit('cursor', (_a = ref.cursor) !== null && _a !== void 0 ? _a : null); // latestCursor = snap.context().acebase_cursor ?? null;
        }
        loaded = true;
        cache = snap.val();
        if (cache === null && typeof (options === null || options === void 0 ? void 0 : options.defaultValue) !== 'undefined') {
            cache = options.defaultValue;
            const context = {
                acebase_proxy: {
                    id: proxyId,
                    source: 'default',
                    // update_id: ID.generate()
                },
            };
            await ref.context(context).set(cache);
        }
        proxy = createProxy({ root: { ref, get cache() { return cache; } }, target: [], id: proxyId, flag: handleFlag });
        const assertProxyAvailable = () => {
            if (proxy === null) {
                throw new Error('Proxy was destroyed');
            }
        };
        const reload = async () => {
            // Manually reloads current value when cache is out of sync, which should only
            // be able to happen if an AceBaseClient is used without cache database,
            // and the connection to the server was lost for a while. In all other cases,
            // there should be no need to call this method.
            assertProxyAvailable();
            mutationQueue.splice(0); // Remove pending mutations. Will be empty in production, but might not be while debugging, leading to weird behaviour.
            const snap = await ref.get({ allow_cache: false });
            const oldVal = cache, newVal = snap.val();
            cache = newVal;
            // Compare old and new values
            const mutations = (0, utils_1.getMutations)(oldVal, newVal);
            if (mutations.length === 0) {
                return; // Nothing changed
            }
            // Run onMutation callback for each changed node
            const context = snap.context(); // context might contain acebase_cursor if server support that
            context.acebase_proxy = { id: proxyId, source: 'reload' };
            // if (onMutationCallback) {
            mutations.forEach(m => {
                const targetRef = getTargetRef(ref, m.target);
                const newSnap = new data_snapshot_1.DataSnapshot(targetRef, m.val, m.val === null, m.prev, context);
                clientEventEmitter.emit('mutation', { snapshot: newSnap, isRemote: true });
            });
            // }
            // Notify local subscribers
            const mutationsSnap = new data_snapshot_1.MutationsDataSnapshot(ref, mutations, context);
            localMutationsEmitter.emit('mutations', { origin: 'local', snap: mutationsSnap });
        };
        return {
            async destroy() {
                await processPromise;
                const promises = [
                    subscription.stop(),
                    ...clientSubscriptions.map(cs => cs.stop()),
                ];
                await Promise.all(promises);
                ['cursor', 'mutation', 'error'].forEach(event => clientEventEmitter.off(event));
                cache = null; // Remove cache
                proxy = null;
            },
            stop() {
                this.destroy();
            },
            get value() {
                assertProxyAvailable();
                return proxy;
            },
            get hasValue() {
                assertProxyAvailable();
                return cache !== null;
            },
            set value(val) {
                // Overwrite the value of the proxied path itself!
                assertProxyAvailable();
                if (val !== null && typeof val === 'object' && val[isProxy]) {
                    // Assigning one proxied value to another
                    val = val.valueOf();
                }
                flagOverwritten([]);
                cache = val;
            },
            get ref() {
                return ref;
            },
            get cursor() {
                return latestCursor;
            },
            reload,
            onMutation(callback) {
                // Fires callback each time anything changes
                assertProxyAvailable();
                clientEventEmitter.off('mutation'); // Mimic legacy behaviour that overwrites handler
                clientEventEmitter.on('mutation', ({ snapshot, isRemote }) => {
                    try {
                        callback(snapshot, isRemote);
                    }
                    catch (err) {
                        clientEventEmitter.emit('error', { source: 'mutation_callback', message: 'Error in dataproxy onMutation callback', details: err });
                    }
                });
            },
            onError(callback) {
                // Fires callback each time anything goes wrong
                assertProxyAvailable();
                clientEventEmitter.off('error'); // Mimic legacy behaviour that overwrites handler
                clientEventEmitter.on('error', (err) => {
                    try {
                        callback(err);
                    }
                    catch (err) {
                        console.error(`Error in dataproxy onError callback: ${err.message}`);
                    }
                });
            },
            on(event, callback) {
                clientEventEmitter.on(event, callback);
            },
            off(event, callback) {
                clientEventEmitter.off(event, callback);
            },
        };
    }
}
exports.LiveDataProxy = LiveDataProxy;
function getTargetValue(obj, target) {
    let val = obj;
    for (const key of target) {
        val = typeof val === 'object' && val !== null && key in val ? val[key] : null;
    }
    return val;
}
function setTargetValue(obj, target, value) {
    if (target.length === 0) {
        throw new Error('Cannot update root target, caller must do that itself!');
    }
    const targetObject = target.slice(0, -1).reduce((obj, key) => obj[key], obj);
    const prop = target.slice(-1)[0];
    if (value === null || typeof value === 'undefined') {
        // Remove it
        targetObject instanceof Array ? targetObject.splice(prop, 1) : delete targetObject[prop];
    }
    else {
        // Set or update it
        targetObject[prop] = value;
    }
}
function getTargetRef(ref, target) {
    // Create new DataReference to prevent context reuse
    const path = path_info_1.PathInfo.get(ref.path).childPath(target);
    return new data_reference_1.DataReference(ref.db, path);
}
function createProxy(context) {
    const targetRef = getTargetRef(context.root.ref, context.target);
    const childProxies = [];
    const handler = {
        get(target, prop, receiver) {
            target = getTargetValue(context.root.cache, context.target);
            if (typeof prop === 'symbol') {
                if (prop.toString() === Symbol.iterator.toString()) {
                    // Use .values for @@iterator symbol
                    prop = 'values';
                }
                else if (prop.toString() === isProxy.toString()) {
                    return true;
                }
                else {
                    return Reflect.get(target, prop, receiver);
                }
            }
            if (prop === 'valueOf') {
                return function valueOf() { return target; };
            }
            if (target === null || typeof target !== 'object') {
                throw new Error(`Cannot read property "${prop}" of ${target}. Value of path "/${targetRef.path}" is not an object (anymore)`);
            }
            if (target instanceof Array && typeof prop === 'string' && /^[0-9]+$/.test(prop)) {
                // Proxy type definitions say prop can be a number, but this is never the case.
                prop = parseInt(prop);
            }
            const value = target[prop];
            if (value === null) {
                // Removed property. Should never happen, but if it does:
                delete target[prop];
                return; // undefined
            }
            // Check if we have a child proxy for this property already.
            // If so, and the properties' typeof value did not change, return that
            const childProxy = childProxies.find(proxy => proxy.prop === prop);
            if (childProxy) {
                if (childProxy.typeof === typeof value) {
                    return childProxy.value;
                }
                childProxies.splice(childProxies.indexOf(childProxy), 1);
            }
            const proxifyChildValue = (prop) => {
                const value = target[prop]; //
                const childProxy = childProxies.find(child => child.prop === prop);
                if (childProxy) {
                    if (childProxy.typeof === typeof value) {
                        return childProxy.value;
                    }
                    childProxies.splice(childProxies.indexOf(childProxy), 1);
                }
                if (typeof value !== 'object') {
                    // Can't proxify non-object values
                    return value;
                }
                const newChildProxy = createProxy({ root: context.root, target: context.target.concat(prop), id: context.id, flag: context.flag });
                childProxies.push({ typeof: typeof value, prop, value: newChildProxy });
                return newChildProxy;
            };
            const unproxyValue = (value) => {
                return value !== null && typeof value === 'object' && value[isProxy]
                    ? value.getTarget()
                    : value;
            };
            // If the property contains a simple value, return it.
            if (['string', 'number', 'boolean'].includes(typeof value)
                || value instanceof Date
                || value instanceof path_reference_1.PathReference
                || value instanceof ArrayBuffer
                || (typeof value === 'object' && 'buffer' in value) // Typed Arrays
            ) {
                return value;
            }
            const isArray = target instanceof Array;
            if (prop === 'toString') {
                return function toString() {
                    return `[LiveDataProxy for "${targetRef.path}"]`;
                };
            }
            if (typeof value === 'undefined') {
                if (prop === 'push') {
                    // Push item to an object collection
                    return function push(item) {
                        const childRef = targetRef.push();
                        context.flag('write', context.target.concat(childRef.key)); //, { previous: null }
                        target[childRef.key] = item;
                        return childRef.key;
                    };
                }
                if (prop === 'getTarget') {
                    // Get unproxied readonly (but still live) version of data.
                    return function (warn = true) {
                        warn && console.warn('Use getTarget with caution - any changes will not be synchronized!');
                        return target;
                    };
                }
                if (prop === 'getRef') {
                    // Gets the DataReference to this data target
                    return function getRef() {
                        const ref = getTargetRef(context.root.ref, context.target);
                        return ref;
                    };
                }
                if (prop === 'forEach') {
                    return function forEach(callback) {
                        const keys = Object.keys(target);
                        // Fix: callback with unproxied value
                        let stop = false;
                        for (let i = 0; !stop && i < keys.length; i++) {
                            const key = keys[i];
                            const value = proxifyChildValue(key); //, target[key]
                            stop = callback(value, key, i) === false;
                        }
                    };
                }
                if (['values', 'entries', 'keys'].includes(prop)) {
                    return function* generator() {
                        const keys = Object.keys(target);
                        for (const key of keys) {
                            if (prop === 'keys') {
                                yield key;
                            }
                            else {
                                const value = proxifyChildValue(key); //, target[key]
                                if (prop === 'entries') {
                                    yield [key, value];
                                }
                                else {
                                    yield value;
                                }
                            }
                        }
                    };
                }
                if (prop === 'toArray') {
                    return function toArray(sortFn) {
                        const arr = Object.keys(target).map(key => proxifyChildValue(key)); //, target[key]
                        if (sortFn) {
                            arr.sort(sortFn);
                        }
                        return arr;
                    };
                }
                if (prop === 'onChanged') {
                    // Starts monitoring the value
                    return function onChanged(callback) {
                        return context.flag('onChange', context.target, { callback });
                    };
                }
                if (prop === 'subscribe') {
                    // Gets subscriber function to use with Observables, or custom handling
                    return function subscribe() {
                        return context.flag('subscribe', context.target);
                    };
                }
                if (prop === 'getObservable') {
                    // Creates an observable for monitoring the value
                    return function getObservable() {
                        return context.flag('observe', context.target);
                    };
                }
                if (prop === 'getOrderedCollection') {
                    return function getOrderedCollection(orderProperty, orderIncrement) {
                        return new OrderedCollectionProxy(this, orderProperty, orderIncrement);
                    };
                }
                if (prop === 'startTransaction') {
                    return function startTransaction() {
                        return context.flag('transaction', context.target);
                    };
                }
                if (prop === 'remove' && !isArray) {
                    // Removes target from object collection
                    return function remove() {
                        if (context.target.length === 0) {
                            throw new Error('Can\'t remove proxy root value');
                        }
                        const parent = getTargetValue(context.root.cache, context.target.slice(0, -1));
                        const key = context.target.slice(-1)[0];
                        context.flag('write', context.target);
                        delete parent[key];
                    };
                }
                return; // undefined
            }
            else if (typeof value === 'function') {
                if (isArray) {
                    // Handle array methods
                    const writeArray = (action) => {
                        context.flag('write', context.target);
                        return action();
                    };
                    const cleanArrayValues = (values) => values.map((value) => {
                        value = unproxyValue(value);
                        removeVoidProperties(value);
                        return value;
                    });
                    // Methods that directly change the array:
                    if (prop === 'push') {
                        return function push(...items) {
                            items = cleanArrayValues(items);
                            return writeArray(() => target.push(...items)); // push the items to the cache array
                        };
                    }
                    if (prop === 'pop') {
                        return function pop() {
                            return writeArray(() => target.pop());
                        };
                    }
                    if (prop === 'splice') {
                        return function splice(start, deleteCount, ...items) {
                            items = cleanArrayValues(items);
                            return writeArray(() => target.splice(start, deleteCount, ...items));
                        };
                    }
                    if (prop === 'shift') {
                        return function shift() {
                            return writeArray(() => target.shift());
                        };
                    }
                    if (prop === 'unshift') {
                        return function unshift(...items) {
                            items = cleanArrayValues(items);
                            return writeArray(() => target.unshift(...items));
                        };
                    }
                    if (prop === 'sort') {
                        return function sort(compareFn) {
                            return writeArray(() => target.sort(compareFn));
                        };
                    }
                    if (prop === 'reverse') {
                        return function reverse() {
                            return writeArray(() => target.reverse());
                        };
                    }
                    // Methods that do not change the array themselves, but
                    // have callbacks that might, or return child values:
                    if (['indexOf', 'lastIndexOf'].includes(prop)) {
                        return function indexOf(item, start) {
                            if (item !== null && typeof item === 'object' && item[isProxy]) {
                                // Use unproxied value, or array.indexOf will return -1 (fixes issue #1)
                                item = item.getTarget(false);
                            }
                            return target[prop](item, start);
                        };
                    }
                    if (['forEach', 'every', 'some', 'filter', 'map'].includes(prop)) {
                        return function iterate(callback) {
                            return target[prop]((value, i) => {
                                return callback(proxifyChildValue(i), i, proxy); //, value
                            });
                        };
                    }
                    if (['reduce', 'reduceRight'].includes(prop)) {
                        return function reduce(callback, initialValue) {
                            return target[prop]((prev, value, i) => {
                                return callback(prev, proxifyChildValue(i), i, proxy); //, value
                            }, initialValue);
                        };
                    }
                    if (['find', 'findIndex'].includes(prop)) {
                        return function find(callback) {
                            let value = target[prop]((value, i) => {
                                return callback(proxifyChildValue(i), i, proxy); // , value
                            });
                            if (prop === 'find' && value) {
                                const index = target.indexOf(value);
                                value = proxifyChildValue(index); //, value
                            }
                            return value;
                        };
                    }
                    if (['values', 'entries', 'keys'].includes(prop)) {
                        return function* generator() {
                            for (let i = 0; i < target.length; i++) {
                                if (prop === 'keys') {
                                    yield i;
                                }
                                else {
                                    const value = proxifyChildValue(i); //, target[i]
                                    if (prop === 'entries') {
                                        yield [i, value];
                                    }
                                    else {
                                        yield value;
                                    }
                                }
                            }
                        };
                    }
                }
                // Other function (or not an array), should not alter its value
                // return function fn(...args) {
                //     return target[prop](...args);
                // }
                return value;
            }
            // Proxify any other value
            return proxifyChildValue(prop); //, value
        },
        set(target, prop, value, receiver) {
            // Eg: chats.chat1.title = 'New chat title';
            // target === chats.chat1, prop === 'title'
            target = getTargetValue(context.root.cache, context.target);
            if (typeof prop === 'symbol') {
                return Reflect.set(target, prop, value, receiver);
            }
            if (target === null || typeof target !== 'object') {
                throw new Error(`Cannot set property "${prop}" of ${target}. Value of path "/${targetRef.path}" is not an object`);
            }
            if (target instanceof Array && typeof prop === 'string') {
                if (!/^[0-9]+$/.test(prop)) {
                    throw new Error(`Cannot set property "${prop}" on array value of path "/${targetRef.path}"`);
                }
                prop = parseInt(prop);
            }
            if (value !== null) {
                if (typeof value === 'object') {
                    if (value[isProxy]) {
                        // Assigning one proxied value to another
                        value = value.valueOf();
                    }
                    // else if (Object.isFrozen(value)) {
                    //     // Create a copy to unfreeze it
                    //     value = cloneObject(value);
                    // }
                    value = (0, utils_1.cloneObject)(value); // Fix #10, always clone objects so changes made through the proxy won't change the original object (and vice versa)
                }
                if ((0, utils_1.valuesAreEqual)(value, target[prop])) { //if (compareValues(value, target[prop]) === 'identical') { // (typeof value !== 'object' && target[prop] === value) {
                    // not changing the actual value, ignore
                    return true;
                }
            }
            if (context.target.some(key => typeof key === 'number')) {
                // Updating an object property inside an array. Flag the first array in target to be written.
                // Eg: when chat.members === [{ name: 'Ewout', id: 'someid' }]
                // --> chat.members[0].name = 'Ewout' --> Rewrite members array instead of chat/members[0]/name
                context.flag('write', context.target.slice(0, context.target.findIndex(key => typeof key === 'number')));
            }
            else if (target instanceof Array) {
                // Flag the entire array to be overwritten
                context.flag('write', context.target);
            }
            else {
                // Flag child property
                context.flag('write', context.target.concat(prop));
            }
            // Set cached value:
            if (value === null) {
                delete target[prop];
            }
            else {
                removeVoidProperties(value);
                target[prop] = value;
            }
            return true;
        },
        deleteProperty(target, prop) {
            target = getTargetValue(context.root.cache, context.target);
            if (target === null) {
                throw new Error(`Cannot delete property ${prop.toString()} of null`);
            }
            if (typeof prop === 'symbol') {
                return Reflect.deleteProperty(target, prop);
            }
            if (!(prop in target)) {
                return true; // Nothing to delete
            }
            context.flag('write', context.target.concat(prop));
            delete target[prop];
            return true;
        },
        ownKeys(target) {
            target = getTargetValue(context.root.cache, context.target);
            return Reflect.ownKeys(target);
        },
        has(target, prop) {
            target = getTargetValue(context.root.cache, context.target);
            return Reflect.has(target, prop);
        },
        getOwnPropertyDescriptor(target, prop) {
            target = getTargetValue(context.root.cache, context.target);
            const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
            if (descriptor) {
                descriptor.configurable = true; // prevent "TypeError: 'getOwnPropertyDescriptor' on proxy: trap reported non-configurability for property '...' which is either non-existant or configurable in the proxy target"
            }
            return descriptor;
        },
        getPrototypeOf(target) {
            target = getTargetValue(context.root.cache, context.target);
            return Reflect.getPrototypeOf(target);
        },
    };
    const proxy = new Proxy({}, handler);
    return proxy;
}
function removeVoidProperties(obj) {
    if (typeof obj !== 'object') {
        return;
    }
    Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (val === null || typeof val === 'undefined') {
            delete obj[key];
        }
        else if (typeof val === 'object') {
            removeVoidProperties(val);
        }
    });
}
/**
 * Convenience function to access ILiveDataProxyValue methods on a proxied value
 * @param proxiedValue The proxied value to get access to
 * @returns Returns the same object typecasted to an ILiveDataProxyValue
 * @example
 * // IChatMessages is an ObjectCollection<IChatMessage>
 * let observable: Observable<IChatMessages>;
 *
 * // Allows you to do this:
 * observable = proxyAccess<IChatMessages>(chat.messages).getObservable();
 *
 * // Instead of:
 * observable = (chat.messages.msg1 as any as ILiveDataProxyValue<IChatMessages>).getObservable();
 *
 * // Both do the exact same, but the first is less obscure
 */
function proxyAccess(proxiedValue) {
    if (typeof proxiedValue !== 'object' || !proxiedValue[isProxy]) {
        throw new Error('Given value is not proxied. Make sure you are referencing the value through the live data proxy.');
    }
    return proxiedValue;
}
exports.proxyAccess = proxyAccess;
/**
 * Provides functionality to work with ordered collections through a live data proxy. Eliminates
 * the need for arrays to handle ordered data by adding a 'sort' properties to child objects in a
 * collection, and provides functionality to sort and reorder items with a minimal amount of database
 * updates.
 */
class OrderedCollectionProxy {
    constructor(collection, orderProperty = 'order', orderIncrement = 10) {
        this.collection = collection;
        this.orderProperty = orderProperty;
        this.orderIncrement = orderIncrement;
        if (typeof collection !== 'object' || !collection[isProxy]) {
            throw new Error('Collection is not proxied');
        }
        if (collection.valueOf() instanceof Array) {
            throw new Error('Collection is an array, not an object collection');
        }
        if (!Object.keys(collection).every(key => typeof collection[key] === 'object')) {
            throw new Error('Collection has non-object children');
        }
        // Check if the collection has order properties. If not, assign them now
        const ok = Object.keys(collection).every(key => typeof collection[key][orderProperty] === 'number');
        if (!ok) {
            // Assign order properties now. Database will be updated automatically
            const keys = Object.keys(collection);
            for (let i = 0; i < keys.length; i++) {
                const item = collection[keys[i]];
                item[orderProperty] = i * orderIncrement; // 0, 10, 20, 30 etc
            }
        }
    }
    /**
     * Gets an observable for the target object collection. Same as calling `collection.getObservable()`
     * @returns
     */
    getObservable() {
        return proxyAccess(this.collection).getObservable();
    }
    /**
     * Gets an observable that emits a new ordered array representation of the object collection each time
     * the unlaying data is changed. Same as calling `getArray()` in a `getObservable().subscribe` callback
     * @returns
     */
    getArrayObservable() {
        const Observable = (0, optional_observable_1.getObservable)();
        return new Observable((subscriber => {
            const subscription = this.getObservable().subscribe(( /*value*/) => {
                const newArray = this.getArray();
                subscriber.next(newArray);
            });
            return function unsubscribe() {
                subscription.unsubscribe();
            };
        }));
    }
    /**
     * Gets an ordered array representation of the items in your object collection. The items in the array
     * are proxied values, changes will be in sync with the database. Note that the array itself
     * is not mutable: adding or removing items to it will NOT update the collection in the
     * the database and vice versa. Use `add`, `delete`, `sort` and `move` methods to make changes
     * that impact the collection's sorting order
     * @returns order array
     */
    getArray() {
        const arr = proxyAccess(this.collection).toArray((a, b) => a[this.orderProperty] - b[this.orderProperty]);
        // arr.push = (...items: T[]) => {
        //     items.forEach(item => this.add(item));
        //     return arr.length;
        // };
        return arr;
    }
    /**
     * Adds or moves an item to/within the object collection and takes care of the proper sorting order.
     * @param item Item to add or move
     * @param index Optional target index in the sorted representation, appends if not specified.
     * @param from If the item is being moved
     * @returns
     */
    add(item, index, from) {
        const arr = this.getArray();
        let minOrder = Number.POSITIVE_INFINITY, maxOrder = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < arr.length; i++) {
            const order = arr[i][this.orderProperty];
            minOrder = Math.min(order, minOrder);
            maxOrder = Math.max(order, maxOrder);
        }
        let fromKey;
        if (typeof from === 'number') {
            // Moving existing item
            fromKey = Object.keys(this.collection).find(key => this.collection[key] === item);
            if (!fromKey) {
                throw new Error('item not found in collection');
            }
            if (from === index) {
                return { key: fromKey, index };
            }
            if (Math.abs(from - index) === 1) {
                // Position being swapped, swap their order property values
                const otherItem = arr[index];
                const otherOrder = otherItem[this.orderProperty];
                otherItem[this.orderProperty] = item[this.orderProperty];
                item[this.orderProperty] = otherOrder;
                return { key: fromKey, index };
            }
            else {
                // Remove from array, code below will add again
                arr.splice(from, 1);
            }
        }
        if (typeof index !== 'number' || index >= arr.length) {
            // append at the end
            index = arr.length;
            item[this.orderProperty] = (arr.length == 0 ? 0 : maxOrder + this.orderIncrement);
        }
        else if (index === 0) {
            // insert before all others
            item[this.orderProperty] = (arr.length == 0 ? 0 : minOrder - this.orderIncrement);
        }
        else {
            // insert between 2 others
            const orders = arr.map(item => item[this.orderProperty]);
            const gap = orders[index] - orders[index - 1];
            if (gap > 1) {
                item[this.orderProperty] = (orders[index] - Math.floor(gap / 2));
            }
            else {
                // TODO: Can this gap be enlarged by moving one of both orders?
                // For now, change all other orders
                arr.splice(index, 0, item);
                for (let i = 0; i < arr.length; i++) {
                    arr[i][this.orderProperty] = (i * this.orderIncrement);
                }
            }
        }
        const key = typeof fromKey === 'string'
            ? fromKey // Moved item, don't add it
            : proxyAccess(this.collection).push(item);
        return { key, index };
    }
    /**
     * Deletes an item from the object collection using the their index in the sorted array representation
     * @param index
     * @returns the key of the collection's child that was deleted
     */
    delete(index) {
        const arr = this.getArray();
        const item = arr[index];
        if (!item) {
            throw new Error(`Item at index ${index} not found`);
        }
        const key = Object.keys(this.collection).find(key => this.collection[key] === item);
        if (!key) {
            throw new Error('Cannot find target object to delete');
        }
        this.collection[key] = null; // Deletes it from db
        return { key, index };
    }
    /**
     * Moves an item in the object collection by reordering it
     * @param fromIndex Current index in the array (the ordered representation of the object collection)
     * @param toIndex Target index in the array
     * @returns
     */
    move(fromIndex, toIndex) {
        const arr = this.getArray();
        return this.add(arr[fromIndex], toIndex, fromIndex);
    }
    /**
     * Reorders the object collection using given sort function. Allows quick reordering of the collection which is persisted in the database
     * @param sortFn
     */
    sort(sortFn) {
        const arr = this.getArray();
        arr.sort(sortFn);
        for (let i = 0; i < arr.length; i++) {
            arr[i][this.orderProperty] = i * this.orderIncrement;
        }
    }
}
exports.OrderedCollectionProxy = OrderedCollectionProxy;

},{"./data-reference":21,"./data-snapshot":22,"./id":24,"./optional-observable":27,"./path-info":29,"./path-reference":30,"./process":31,"./simple-event-emitter":35,"./utils":39}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataReferencesArray = exports.DataSnapshotsArray = exports.DataReferenceQuery = exports.DataReference = exports.QueryDataRetrievalOptions = exports.DataRetrievalOptions = void 0;
const data_snapshot_1 = require("./data-snapshot");
const subscription_1 = require("./subscription");
const id_1 = require("./id");
const path_info_1 = require("./path-info");
const data_proxy_1 = require("./data-proxy");
const optional_observable_1 = require("./optional-observable");
class DataRetrievalOptions {
    /**
     * Options for data retrieval, allows selective loading of object properties
     */
    constructor(options) {
        if (!options) {
            options = {};
        }
        if (typeof options.include !== 'undefined' && !(options.include instanceof Array)) {
            throw new TypeError('options.include must be an array');
        }
        if (typeof options.exclude !== 'undefined' && !(options.exclude instanceof Array)) {
            throw new TypeError('options.exclude must be an array');
        }
        if (typeof options.child_objects !== 'undefined' && typeof options.child_objects !== 'boolean') {
            throw new TypeError('options.child_objects must be a boolean');
        }
        if (typeof options.cache_mode === 'string' && !['allow', 'bypass', 'force'].includes(options.cache_mode)) {
            throw new TypeError('invalid value for options.cache_mode');
        }
        this.include = options.include || undefined;
        this.exclude = options.exclude || undefined;
        this.child_objects = typeof options.child_objects === 'boolean' ? options.child_objects : undefined;
        this.cache_mode = typeof options.cache_mode === 'string'
            ? options.cache_mode
            : typeof options.allow_cache === 'boolean'
                ? options.allow_cache ? 'allow' : 'bypass'
                : 'allow';
        this.cache_cursor = typeof options.cache_cursor === 'string' ? options.cache_cursor : undefined;
    }
}
exports.DataRetrievalOptions = DataRetrievalOptions;
class QueryDataRetrievalOptions extends DataRetrievalOptions {
    /**
     * @param options Options for data retrieval, allows selective loading of object properties
     */
    constructor(options) {
        super(options);
        if (!['undefined', 'boolean'].includes(typeof options.snapshots)) {
            throw new TypeError('options.snapshots must be a boolean');
        }
        this.snapshots = typeof options.snapshots === 'boolean' ? options.snapshots : true;
    }
}
exports.QueryDataRetrievalOptions = QueryDataRetrievalOptions;
const _private = Symbol('private');
class DataReference {
    /**
     * Creates a reference to a node
     */
    constructor(db, path, vars) {
        this.db = db;
        if (!path) {
            path = '';
        }
        path = path.replace(/^\/|\/$/g, ''); // Trim slashes
        const pathInfo = path_info_1.PathInfo.get(path);
        const key = pathInfo.key;
        const callbacks = [];
        this[_private] = {
            get path() { return path; },
            get key() { return key; },
            get callbacks() { return callbacks; },
            vars: vars || {},
            context: {},
            pushed: false,
            cursor: null,
        };
    }
    context(context, merge = false) {
        const currentContext = this[_private].context;
        if (typeof context === 'object') {
            const newContext = context ? merge ? currentContext || {} : context : {};
            if (context) {
                // Merge new with current context
                Object.keys(context).forEach(key => {
                    newContext[key] = context[key];
                });
            }
            this[_private].context = newContext;
            return this;
        }
        else if (typeof context === 'undefined') {
            console.warn('Use snap.context() instead of snap.ref.context() to get updating context in event callbacks');
            return currentContext;
        }
        else {
            throw new Error('Invalid context argument');
        }
    }
    /**
     * Contains the last received cursor for this referenced path (if the connected database has transaction logging enabled).
     * If you want to be notified if this value changes, add a handler with `ref.onCursor(callback)`
     */
    get cursor() {
        return this[_private].cursor;
    }
    set cursor(value) {
        var _a;
        this[_private].cursor = value;
        (_a = this.onCursor) === null || _a === void 0 ? void 0 : _a.call(this, value);
    }
    /**
    * The path this instance was created with
    */
    get path() { return this[_private].path; }
    /**
     * The key or index of this node
     */
    get key() {
        const key = this[_private].key;
        return typeof key === 'number' ? `[${key}]` : key;
    }
    /**
     * If the "key" is a number, it is an index!
     */
    get index() {
        const key = this[_private].key;
        if (typeof key !== 'number') {
            throw new Error(`"${key}" is not a number`);
        }
        return key;
    }
    /**
     * Returns a new reference to this node's parent
     */
    get parent() {
        const currentPath = path_info_1.PathInfo.fillVariables2(this.path, this.vars);
        const info = path_info_1.PathInfo.get(currentPath);
        if (info.parentPath === null) {
            return null;
        }
        return new DataReference(this.db, info.parentPath).context(this[_private].context);
    }
    /**
     * Contains values of the variables/wildcards used in a subscription path if this reference was
     * created by an event ("value", "child_added" etc), or in a type mapping path when serializing / instantiating typed objects
     */
    get vars() {
        return this[_private].vars;
    }
    /**
     * Returns a new reference to a child node
     * @param childPath Child key, index or path
     * @returns reference to the child
     */
    child(childPath) {
        childPath = typeof childPath === 'number' ? childPath : childPath.replace(/^\/|\/$/g, '');
        const currentPath = path_info_1.PathInfo.fillVariables2(this.path, this.vars);
        const targetPath = path_info_1.PathInfo.getChildPath(currentPath, childPath);
        return new DataReference(this.db, targetPath).context(this[_private].context); //  `${this.path}/${childPath}`
    }
    /**
     * Sets or overwrites the stored value
     * @param value value to store in database
     * @param onComplete optional completion callback to use instead of returning promise
     * @returns promise that resolves with this reference when completed
     */
    async set(value, onComplete) {
        try {
            if (this.isWildcardPath) {
                throw new Error(`Cannot set the value of wildcard path "/${this.path}"`);
            }
            if (this.parent === null) {
                throw new Error('Cannot set the root object. Use update, or set individual child properties');
            }
            if (typeof value === 'undefined') {
                throw new TypeError(`Cannot store undefined value in "/${this.path}"`);
            }
            if (!this.db.isReady) {
                await this.db.ready();
            }
            value = this.db.types.serialize(this.path, value);
            const { cursor } = await this.db.api.set(this.path, value, { context: this[_private].context });
            this.cursor = cursor;
            if (typeof onComplete === 'function') {
                try {
                    onComplete(null, this);
                }
                catch (err) {
                    console.error('Error in onComplete callback:', err);
                }
            }
        }
        catch (err) {
            if (typeof onComplete === 'function') {
                try {
                    onComplete(err, this);
                }
                catch (err) {
                    console.error('Error in onComplete callback:', err);
                }
            }
            else {
                // throw again
                throw err;
            }
        }
        return this;
    }
    /**
     * Updates properties of the referenced node
     * @param updates object containing the properties to update
     * @param onComplete optional completion callback to use instead of returning promise
     * @return returns promise that resolves with this reference once completed
     */
    async update(updates, onComplete) {
        try {
            if (this.isWildcardPath) {
                throw new Error(`Cannot update the value of wildcard path "/${this.path}"`);
            }
            if (!this.db.isReady) {
                await this.db.ready();
            }
            if (typeof updates !== 'object' || updates instanceof Array || updates instanceof ArrayBuffer || updates instanceof Date) {
                await this.set(updates);
            }
            else if (Object.keys(updates).length === 0) {
                console.warn(`update called on path "/${this.path}", but there is nothing to update`);
            }
            else {
                updates = this.db.types.serialize(this.path, updates);
                const { cursor } = await this.db.api.update(this.path, updates, { context: this[_private].context });
                this.cursor = cursor;
            }
            if (typeof onComplete === 'function') {
                try {
                    onComplete(null, this);
                }
                catch (err) {
                    console.error('Error in onComplete callback:', err);
                }
            }
        }
        catch (err) {
            if (typeof onComplete === 'function') {
                try {
                    onComplete(err, this);
                }
                catch (err) {
                    console.error('Error in onComplete callback:', err);
                }
            }
            else {
                // throw again
                throw err;
            }
        }
        return this;
    }
    /**
     * Sets the value a node using a transaction: it runs your callback function with the current value, uses its return value as the new value to store.
     * The transaction is canceled if your callback returns undefined, or throws an error. If your callback returns null, the target node will be removed.
     * @param callback - callback function that performs the transaction on the node's current value. It must return the new value to store (or promise with new value), undefined to cancel the transaction, or null to remove the node.
     * @returns returns a promise that resolves with the DataReference once the transaction has been processed
     */
    async transaction(callback) {
        if (this.isWildcardPath) {
            throw new Error(`Cannot start a transaction on wildcard path "/${this.path}"`);
        }
        if (!this.db.isReady) {
            await this.db.ready();
        }
        let throwError;
        const cb = (currentValue) => {
            currentValue = this.db.types.deserialize(this.path, currentValue);
            const snap = new data_snapshot_1.DataSnapshot(this, currentValue);
            let newValue;
            try {
                newValue = callback(snap);
            }
            catch (err) {
                // callback code threw an error
                throwError = err; // Remember error
                return; // cancel transaction by returning undefined
            }
            if (newValue instanceof Promise) {
                return newValue
                    .then((val) => {
                    return this.db.types.serialize(this.path, val);
                })
                    .catch(err => {
                    throwError = err; // Remember error
                    return; // cancel transaction by returning undefined
                });
            }
            else {
                return this.db.types.serialize(this.path, newValue);
            }
        };
        const { cursor } = await this.db.api.transaction(this.path, cb, { context: this[_private].context });
        this.cursor = cursor;
        if (throwError) {
            // Rethrow error from callback code
            throw throwError;
        }
        return this;
    }
    on(event, callback, cancelCallback) {
        if (this.path === '' && ['value', 'child_changed'].includes(event)) {
            // Removed 'notify_value' and 'notify_child_changed' events from the list, they do not require additional data loading anymore.
            console.warn('WARNING: Listening for value and child_changed events on the root node is a bad practice. These events require loading of all data (value event), or potentially lots of data (child_changed event) each time they are fired');
        }
        let eventPublisher = null;
        const eventStream = new subscription_1.EventStream(publisher => { eventPublisher = publisher; });
        // Map OUR callback to original callback, so .off can remove the right callback(s)
        const cb = {
            event,
            stream: eventStream,
            userCallback: typeof callback === 'function' && callback,
            ourCallback: (err, path, newValue, oldValue, eventContext) => {
                if (err) {
                    // TODO: Investigate if this ever happens?
                    this.db.debug.error(`Error getting data for event ${event} on path "${path}"`, err);
                    return;
                }
                const ref = this.db.ref(path);
                ref[_private].vars = path_info_1.PathInfo.extractVariables(this.path, path);
                let callbackObject;
                if (event.startsWith('notify_')) {
                    // No data event, callback with reference
                    callbackObject = ref.context(eventContext || {});
                }
                else {
                    const values = {
                        previous: this.db.types.deserialize(path, oldValue),
                        current: this.db.types.deserialize(path, newValue),
                    };
                    if (event === 'child_removed') {
                        callbackObject = new data_snapshot_1.DataSnapshot(ref, values.previous, true, values.previous, eventContext);
                    }
                    else if (event === 'mutations') {
                        callbackObject = new data_snapshot_1.MutationsDataSnapshot(ref, values.current, eventContext);
                    }
                    else {
                        const isRemoved = event === 'mutated' && values.current === null;
                        callbackObject = new data_snapshot_1.DataSnapshot(ref, values.current, isRemoved, values.previous, eventContext);
                    }
                }
                eventPublisher.publish(callbackObject);
                if (eventContext === null || eventContext === void 0 ? void 0 : eventContext.acebase_cursor) {
                    this.cursor = eventContext.acebase_cursor;
                }
            },
        };
        this[_private].callbacks.push(cb);
        const subscribe = () => {
            // (NEW) Add callback to event stream
            // ref.on('value', callback) is now exactly the same as ref.on('value').subscribe(callback)
            if (typeof callback === 'function') {
                eventStream.subscribe(callback, (activated, cancelReason) => {
                    if (!activated) {
                        cancelCallback && cancelCallback(cancelReason);
                    }
                });
            }
            const advancedOptions = typeof callback === 'object'
                ? callback
                : { newOnly: !callback }; // newOnly: if callback is not 'truthy', could change this to (typeof callback !== 'function' && callback !== true) but that would break client code that uses a truthy argument.
            if (typeof advancedOptions.newOnly !== 'boolean') {
                advancedOptions.newOnly = false;
            }
            if (this.isWildcardPath) {
                advancedOptions.newOnly = true;
            }
            const cancelSubscription = (err) => {
                // Access denied?
                // Cancel subscription
                const callbacks = this[_private].callbacks;
                callbacks.splice(callbacks.indexOf(cb), 1);
                this.db.api.unsubscribe(this.path, event, cb.ourCallback);
                // Call cancelCallbacks
                this.db.debug.error(`Subscription "${event}" on path "/${this.path}" canceled because of an error: ${err.message}`);
                eventPublisher.cancel(err.message);
            };
            const authorized = this.db.api.subscribe(this.path, event, cb.ourCallback, { newOnly: advancedOptions.newOnly, cancelCallback: cancelSubscription, syncFallback: advancedOptions.syncFallback });
            const allSubscriptionsStoppedCallback = () => {
                const callbacks = this[_private].callbacks;
                callbacks.splice(callbacks.indexOf(cb), 1);
                return this.db.api.unsubscribe(this.path, event, cb.ourCallback);
            };
            if (authorized instanceof Promise) {
                // Web API now returns a promise that resolves if the request is allowed
                // and rejects when access is denied by the set security rules
                authorized.then(() => {
                    // Access granted
                    eventPublisher.start(allSubscriptionsStoppedCallback);
                }).catch(cancelSubscription);
            }
            else {
                // Local API, always authorized
                eventPublisher.start(allSubscriptionsStoppedCallback);
            }
            if (!advancedOptions.newOnly) {
                // If callback param is supplied (either a callback function or true or something else truthy),
                // it will fire events for current values right now.
                // Otherwise, it expects the .subscribe methode to be used, which will then
                // only be called for future events
                if (event === 'value') {
                    this.get(snap => {
                        eventPublisher.publish(snap);
                    });
                }
                else if (event === 'child_added') {
                    this.get(snap => {
                        const val = snap.val();
                        if (val === null || typeof val !== 'object') {
                            return;
                        }
                        Object.keys(val).forEach(key => {
                            const childSnap = new data_snapshot_1.DataSnapshot(this.child(key), val[key]);
                            eventPublisher.publish(childSnap);
                        });
                    });
                }
                else if (event === 'notify_child_added') {
                    // Use the reflect API to get current children.
                    // NOTE: This does not work with AceBaseServer <= v0.9.7, only when signed in as admin
                    const step = 100, limit = step;
                    let skip = 0;
                    const more = async () => {
                        const children = await this.db.api.reflect(this.path, 'children', { limit, skip });
                        children.list.forEach(child => {
                            const childRef = this.child(child.key);
                            eventPublisher.publish(childRef);
                            // typeof callback === 'function' && callback(childRef);
                        });
                        if (children.more) {
                            skip += step;
                            more();
                        }
                    };
                    more();
                }
            }
        };
        if (this.db.isReady) {
            subscribe();
        }
        else {
            this.db.ready(subscribe);
        }
        return eventStream;
    }
    off(event, callback) {
        const subscriptions = this[_private].callbacks;
        const stopSubs = subscriptions.filter(sub => (!event || sub.event === event) && (!callback || sub.userCallback === callback));
        if (stopSubs.length === 0) {
            this.db.debug.warn(`Can't find event subscriptions to stop (path: "${this.path}", event: ${event || '(any)'}, callback: ${callback})`);
        }
        stopSubs.forEach(sub => {
            sub.stream.stop();
        });
        return this;
    }
    get(optionsOrCallback, callback) {
        if (!this.db.isReady) {
            const promise = this.db.ready().then(() => this.get(optionsOrCallback, callback));
            return typeof optionsOrCallback !== 'function' && typeof callback !== 'function' ? promise : undefined; // only return promise if no callback is used
        }
        callback =
            typeof optionsOrCallback === 'function'
                ? optionsOrCallback
                : typeof callback === 'function'
                    ? callback
                    : undefined;
        if (this.isWildcardPath) {
            const error = new Error(`Cannot get value of wildcard path "/${this.path}". Use .query() instead`);
            if (typeof callback === 'function') {
                throw error;
            }
            return Promise.reject(error);
        }
        const options = new DataRetrievalOptions(typeof optionsOrCallback === 'object' ? optionsOrCallback : { cache_mode: 'allow' });
        const promise = this.db.api.get(this.path, options).then(result => {
            var _a;
            const isNewApiResult = ('context' in result && 'value' in result);
            if (!isNewApiResult) {
                // acebase-core version package was updated but acebase or acebase-client package was not? Warn, but don't throw an error.
                console.warn('AceBase api.get method returned an old response value. Update your acebase or acebase-client package');
                result = { value: result, context: {} };
            }
            const value = this.db.types.deserialize(this.path, result.value);
            const snapshot = new data_snapshot_1.DataSnapshot(this, value, undefined, undefined, result.context);
            if ((_a = result.context) === null || _a === void 0 ? void 0 : _a.acebase_cursor) {
                this.cursor = result.context.acebase_cursor;
            }
            return snapshot;
        });
        if (callback) {
            promise.then(callback).catch(err => {
                console.error('Uncaught error:', err);
            });
            return;
        }
        else {
            return promise;
        }
    }
    /**
     * Waits for an event to occur
     * @param event Name of the event, eg "value", "child_added", "child_changed", "child_removed"
     * @param options data retrieval options, to include or exclude specific child keys
     * @returns returns promise that resolves with a snapshot of the data
     */
    once(event, options) {
        if (event === 'value' && !this.isWildcardPath) {
            // Shortcut, do not start listening for future events
            return this.get(options);
        }
        return new Promise((resolve) => {
            const callback = (snap) => {
                this.off(event, callback); // unsubscribe directly
                resolve(snap);
            };
            this.on(event, callback);
        });
    }
    /**
     * @param value optional value to store into the database right away
     * @param onComplete optional callback function to run once value has been stored
     * @returns returns promise that resolves with the reference after the passed value has been stored
     */
    push(value, onComplete) {
        if (this.isWildcardPath) {
            const error = new Error(`Cannot push to wildcard path "/${this.path}"`);
            if (typeof value === 'undefined' || typeof onComplete === 'function') {
                throw error;
            }
            return Promise.reject(error);
        }
        const id = id_1.ID.generate();
        const ref = this.child(id);
        ref[_private].pushed = true;
        if (typeof value !== 'undefined') {
            return ref.set(value, onComplete).then(() => ref);
        }
        else {
            return ref;
        }
    }
    /**
     * Removes this node and all children
     */
    async remove() {
        if (this.isWildcardPath) {
            throw new Error(`Cannot remove wildcard path "/${this.path}". Use query().remove instead`);
        }
        if (this.parent === null) {
            throw new Error('Cannot remove the root node');
        }
        return this.set(null);
    }
    /**
     * Quickly checks if this reference has a value in the database, without returning its data
     * @returns returns a promise that resolves with a boolean value
     */
    async exists() {
        if (this.isWildcardPath) {
            throw new Error(`Cannot check wildcard path "/${this.path}" existence`);
        }
        if (!this.db.isReady) {
            await this.db.ready();
        }
        return this.db.api.exists(this.path);
    }
    get isWildcardPath() {
        return this.path.indexOf('*') >= 0 || this.path.indexOf('$') >= 0;
    }
    /**
     * Creates a query object for current node
     */
    query() {
        return new DataReferenceQuery(this);
    }
    /**
     * Gets the number of children this node has, uses reflection
     */
    async count() {
        const info = await this.reflect('info', { child_count: true });
        return info.children.count;
    }
    async reflect(type, args) {
        if (this.isWildcardPath) {
            throw new Error(`Cannot reflect on wildcard path "/${this.path}"`);
        }
        if (!this.db.isReady) {
            await this.db.ready();
        }
        return this.db.api.reflect(this.path, type, args);
    }
    async export(write, options = { format: 'json', type_safe: true }) {
        if (this.isWildcardPath) {
            throw new Error(`Cannot export wildcard path "/${this.path}"`);
        }
        if (!this.db.isReady) {
            await this.db.ready();
        }
        const writeFn = typeof write === 'function' ? write : write.write.bind(write);
        return this.db.api.export(this.path, writeFn, options);
    }
    /**
     * Imports the value of this node and all children
     * @param read Function that reads data from your stream
     * @param options Only supported format currently is json
     * @returns returns a promise that resolves once all data is imported
     */
    async import(read, options = { format: 'json', suppress_events: false }) {
        if (this.isWildcardPath) {
            throw new Error(`Cannot import to wildcard path "/${this.path}"`);
        }
        if (!this.db.isReady) {
            await this.db.ready();
        }
        return this.db.api.import(this.path, read, options);
    }
    proxy(options) {
        const isOptionsArg = typeof options === 'object' && (typeof options.cursor !== 'undefined' || typeof options.defaultValue !== 'undefined');
        if (typeof options !== 'undefined' && !isOptionsArg) {
            this.db.debug.warn('Warning: live data proxy is being initialized with a deprecated method signature. Use ref.proxy(options) instead of ref.proxy(defaultValue)');
            options = { defaultValue: options };
        }
        return data_proxy_1.LiveDataProxy.create(this, options);
    }
    /**
      * @param options optional initial data retrieval options.
      * Not recommended to use yet - given includes/excludes are not applied to received mutations,
      * or sync actions when using an AceBaseClient with cache db.
      */
    observe(options) {
        // options should not be used yet - we can't prevent/filter mutation events on excluded paths atm
        if (options) {
            throw new Error('observe does not support data retrieval options yet');
        }
        if (this.isWildcardPath) {
            throw new Error(`Cannot observe wildcard path "/${this.path}"`);
        }
        const Observable = (0, optional_observable_1.getObservable)();
        return new Observable((observer => {
            let cache, resolved = false;
            let promise = this.get(options).then(snap => {
                resolved = true;
                cache = snap.val();
                observer.next(cache);
            });
            const updateCache = (snap) => {
                if (!resolved) {
                    promise = promise.then(() => updateCache(snap));
                    return;
                }
                const mutatedPath = snap.ref.path;
                if (mutatedPath === this.path) {
                    cache = snap.val();
                    return observer.next(cache);
                }
                const trailKeys = path_info_1.PathInfo.getPathKeys(mutatedPath).slice(path_info_1.PathInfo.getPathKeys(this.path).length);
                let target = cache;
                while (trailKeys.length > 1) {
                    const key = trailKeys.shift();
                    if (!(key in target)) {
                        // Happens if initial loaded data did not include / excluded this data,
                        // or we missed out on an event
                        target[key] = typeof trailKeys[0] === 'number' ? [] : {};
                    }
                    target = target[key];
                }
                const prop = trailKeys.shift();
                const newValue = snap.val();
                if (newValue === null) {
                    // Remove it
                    target instanceof Array && typeof prop === 'number' ? target.splice(prop, 1) : delete target[prop];
                }
                else {
                    // Set or update it
                    target[prop] = newValue;
                }
                observer.next(cache);
            };
            this.on('mutated', updateCache); // TODO: Refactor to 'mutations' event instead
            // Return unsubscribe function
            return () => {
                this.off('mutated', updateCache);
            };
        }));
    }
    async forEach(callbackOrOptions, callback) {
        let options;
        if (typeof callbackOrOptions === 'function') {
            callback = callbackOrOptions;
        }
        else {
            options = callbackOrOptions;
        }
        if (typeof callback !== 'function') {
            throw new TypeError('No callback function given');
        }
        // Get all children through reflection. This could be tweaked further using paging
        const info = await this.reflect('children', { limit: 0, skip: 0 }); // Gets ALL child keys
        const summary = {
            canceled: false,
            total: info.list.length,
            processed: 0,
        };
        // Iterate through all children until callback returns false
        for (let i = 0; i < info.list.length; i++) {
            const key = info.list[i].key;
            // Get child data
            const snapshot = await this.child(key).get(options);
            summary.processed++;
            if (!snapshot.exists()) {
                // Was removed in the meantime, skip
                continue;
            }
            // Run callback
            const result = await callback(snapshot);
            if (result === false) {
                summary.canceled = true;
                break; // Stop looping
            }
        }
        return summary;
    }
    async getMutations(cursorOrDate) {
        const cursor = typeof cursorOrDate === 'string' ? cursorOrDate : undefined;
        const timestamp = cursorOrDate === null || typeof cursorOrDate === 'undefined' ? 0 : cursorOrDate instanceof Date ? cursorOrDate.getTime() : undefined;
        return this.db.api.getMutations({ path: this.path, cursor, timestamp });
    }
    async getChanges(cursorOrDate) {
        const cursor = typeof cursorOrDate === 'string' ? cursorOrDate : undefined;
        const timestamp = cursorOrDate === null || typeof cursorOrDate === 'undefined' ? 0 : cursorOrDate instanceof Date ? cursorOrDate.getTime() : undefined;
        return this.db.api.getChanges({ path: this.path, cursor, timestamp });
    }
}
exports.DataReference = DataReference;
class DataReferenceQuery {
    /**
     * Creates a query on a reference
     */
    constructor(ref) {
        this.ref = ref;
        this[_private] = {
            filters: [],
            skip: 0,
            take: 0,
            order: [],
            events: {},
        };
    }
    /**
     * Applies a filter to the children of the refence being queried.
     * If there is an index on the property key being queried, it will be used
     * to speed up the query
     * @param key property to test value of
     * @param op operator to use
     * @param compare value to compare with
     */
    filter(key, op, compare) {
        if ((op === 'in' || op === '!in') && (!(compare instanceof Array) || compare.length === 0)) {
            throw new Error(`${op} filter for ${key} must supply an Array compare argument containing at least 1 value`);
        }
        if ((op === 'between' || op === '!between') && (!(compare instanceof Array) || compare.length !== 2)) {
            throw new Error(`${op} filter for ${key} must supply an Array compare argument containing 2 values`);
        }
        if ((op === 'matches' || op === '!matches') && !(compare instanceof RegExp)) {
            throw new Error(`${op} filter for ${key} must supply a RegExp compare argument`);
        }
        // DISABLED 2019/10/23 because it is not fully implemented only works locally
        // if (op === "custom" && typeof compare !== "function") {
        //     throw `${op} filter for ${key} must supply a Function compare argument`;
        // }
        // DISABLED 2022/08/15, implemented by query.ts in acebase
        // if ((op === 'contains' || op === '!contains') && ((typeof compare === 'object' && !(compare instanceof Array) && !(compare instanceof Date)) || (compare instanceof Array && compare.length === 0))) {
        //     throw new Error(`${op} filter for ${key} must supply a simple value or (non-zero length) array compare argument`);
        // }
        this[_private].filters.push({ key, op, compare });
        return this;
    }
    /**
     * @deprecated use `.filter` instead
     */
    where(key, op, compare) {
        return this.filter(key, op, compare);
    }
    /**
     * Limits the number of query results
     */
    take(n) {
        this[_private].take = n;
        return this;
    }
    /**
     * Skips the first n query results
     */
    skip(n) {
        this[_private].skip = n;
        return this;
    }
    sort(key, ascending = true) {
        if (!['string', 'number'].includes(typeof key)) {
            throw 'key must be a string or number';
        }
        this[_private].order.push({ key, ascending });
        return this;
    }
    /**
     * @deprecated use `.sort` instead
     */
    order(key, ascending = true) {
        return this.sort(key, ascending);
    }
    get(optionsOrCallback, callback) {
        if (!this.ref.db.isReady) {
            const promise = this.ref.db.ready().then(() => this.get(optionsOrCallback, callback));
            return typeof optionsOrCallback !== 'function' && typeof callback !== 'function' ? promise : undefined; // only return promise if no callback is used
        }
        callback =
            typeof optionsOrCallback === 'function'
                ? optionsOrCallback
                : typeof callback === 'function'
                    ? callback
                    : undefined;
        const options = new QueryDataRetrievalOptions(typeof optionsOrCallback === 'object' ? optionsOrCallback : { snapshots: true, cache_mode: 'allow' });
        options.allow_cache = options.cache_mode !== 'bypass'; // Backward compatibility when using older acebase-client
        options.eventHandler = ev => {
            // TODO: implement context for query events
            if (!this[_private].events[ev.name]) {
                return false;
            }
            const listeners = this[_private].events[ev.name];
            if (typeof listeners !== 'object' || listeners.length === 0) {
                return false;
            }
            if (['add', 'change', 'remove'].includes(ev.name)) {
                const eventData = {
                    name: ev.name,
                    ref: new DataReference(this.ref.db, ev.path),
                };
                if (options.snapshots && ev.name !== 'remove') {
                    const val = db.types.deserialize(ev.path, ev.value);
                    eventData.snapshot = new data_snapshot_1.DataSnapshot(eventData.ref, val, false);
                }
                ev = eventData;
            }
            listeners.forEach(callback => { try {
                callback(ev);
            }
            catch (e) { } });
        };
        // Check if there are event listeners set for realtime changes
        options.monitor = { add: false, change: false, remove: false };
        if (this[_private].events) {
            if (this[_private].events['add'] && this[_private].events['add'].length > 0) {
                options.monitor.add = true;
            }
            if (this[_private].events['change'] && this[_private].events['change'].length > 0) {
                options.monitor.change = true;
            }
            if (this[_private].events['remove'] && this[_private].events['remove'].length > 0) {
                options.monitor.remove = true;
            }
        }
        // Stop realtime results if they are still enabled on a previous .get on this instance
        this.stop();
        // NOTE: returning promise here, regardless of callback argument. Good argument to refactor method to async/await soon
        const db = this.ref.db;
        return db.api.query(this.ref.path, this[_private], options)
            .catch(err => {
            throw new Error(err);
        })
            .then(res => {
            const { stop } = res;
            let { results, context } = res;
            this.stop = async () => {
                await stop();
            };
            if (!('results' in res && 'context' in res)) {
                console.warn('Query results missing context. Update your acebase and/or acebase-client packages');
                results = res, context = {};
            }
            if (options.snapshots) {
                const snaps = results.map(result => {
                    const val = db.types.deserialize(result.path, result.val);
                    return new data_snapshot_1.DataSnapshot(db.ref(result.path), val, false, undefined, context);
                });
                return DataSnapshotsArray.from(snaps);
            }
            else {
                const refs = results.map(path => db.ref(path));
                return DataReferencesArray.from(refs);
            }
        })
            .then(results => {
            callback && callback(results);
            return results;
        });
    }
    /**
     * Stops a realtime query, no more notifications will be received.
     */
    async stop() {
        // Overridden by .get
    }
    /**
     * Executes the query and returns references. Short for `.get({ snapshots: false })`
     * @param callback callback to use instead of returning a promise
     * @returns returns an Promise that resolves with an array of DataReferences, or void when using a callback
     * @deprecated Use `find` instead
     */
    getRefs(callback) {
        return this.get({ snapshots: false }, callback);
    }
    /**
     * Executes the query and returns an array of references. Short for `.get({ snapshots: false })`
     */
    find() {
        return this.get({ snapshots: false });
    }
    /**
     * Executes the query and returns the number of results
     */
    async count() {
        const refs = await this.find();
        return refs.length;
    }
    /**
     * Executes the query and returns if there are any results
     */
    async exists() {
        const originalTake = this[_private].take;
        const p = this.take(1).find();
        this.take(originalTake);
        const refs = await p;
        return refs.length !== 0;
    }
    /**
     * Executes the query, removes all matches from the database
     * @returns returns a Promise that resolves once all matches have been removed
     */
    async remove(callback) {
        const refs = await this.find();
        // Perform updates on each distinct parent collection (only 1 parent if this is not a wildcard path)
        const parentUpdates = refs.reduce((parents, ref) => {
            const parent = parents[ref.parent.path];
            if (!parent) {
                parents[ref.parent.path] = [ref];
            }
            else {
                parent.push(ref);
            }
            return parents;
        }, {});
        const db = this.ref.db;
        const promises = Object.keys(parentUpdates).map(async (parentPath) => {
            const updates = refs.reduce((updates, ref) => {
                updates[ref.key] = null;
                return updates;
            }, {});
            const ref = db.ref(parentPath);
            try {
                await ref.update(updates);
                return { ref, success: true };
            }
            catch (error) {
                return { ref, success: false, error };
            }
        });
        const results = await Promise.all(promises);
        callback && callback(results);
        return results;
    }
    on(event, callback) {
        if (!this[_private].events[event]) {
            this[_private].events[event] = [];
        }
        this[_private].events[event].push(callback);
        return this;
    }
    /**
     * Unsubscribes from (a) previously added event(s)
     * @param event Name of the event
     * @param callback callback function to remove
     * @returns returns reference to this query
     */
    off(event, callback) {
        if (typeof event === 'undefined') {
            this[_private].events = {};
            return this;
        }
        if (!this[_private].events[event]) {
            return this;
        }
        if (typeof callback === 'undefined') {
            delete this[_private].events[event];
            return this;
        }
        const index = this[_private].events[event].indexOf(callback);
        if (!~index) {
            return this;
        }
        this[_private].events[event].splice(index, 1);
        return this;
    }
    async forEach(callbackOrOptions, callback) {
        let options;
        if (typeof callbackOrOptions === 'function') {
            callback = callbackOrOptions;
        }
        else {
            options = callbackOrOptions;
        }
        if (typeof callback !== 'function') {
            throw new TypeError('No callback function given');
        }
        // Get all query results. This could be tweaked further using paging
        const refs = await this.find();
        const summary = {
            canceled: false,
            total: refs.length,
            processed: 0,
        };
        // Iterate through all children until callback returns false
        for (let i = 0; i < refs.length; i++) {
            const ref = refs[i];
            // Get child data
            const snapshot = await ref.get(options);
            summary.processed++;
            if (!snapshot.exists()) {
                // Was removed in the meantime, skip
                continue;
            }
            // Run callback
            const result = await callback(snapshot);
            if (result === false) {
                summary.canceled = true;
                break; // Stop looping
            }
        }
        return summary;
    }
}
exports.DataReferenceQuery = DataReferenceQuery;
class DataSnapshotsArray extends Array {
    static from(snaps) {
        const arr = new DataSnapshotsArray(snaps.length);
        snaps.forEach((snap, i) => arr[i] = snap);
        return arr;
    }
    getValues() {
        return this.map(snap => snap.val());
    }
}
exports.DataSnapshotsArray = DataSnapshotsArray;
class DataReferencesArray extends Array {
    static from(refs) {
        const arr = new DataReferencesArray(refs.length);
        refs.forEach((ref, i) => arr[i] = ref);
        return arr;
    }
    getPaths() {
        return this.map(ref => ref.path);
    }
}
exports.DataReferencesArray = DataReferencesArray;

},{"./data-proxy":20,"./data-snapshot":22,"./id":24,"./optional-observable":27,"./path-info":29,"./subscription":36}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutationsDataSnapshot = exports.DataSnapshot = void 0;
const path_info_1 = require("./path-info");
function getChild(snapshot, path, previous = false) {
    if (!snapshot.exists()) {
        return null;
    }
    let child = previous ? snapshot.previous() : snapshot.val();
    if (typeof path === 'number') {
        return child[path];
    }
    path_info_1.PathInfo.getPathKeys(path).every(key => {
        child = child[key];
        return typeof child !== 'undefined';
    });
    return child || null;
}
function getChildren(snapshot) {
    if (!snapshot.exists()) {
        return [];
    }
    const value = snapshot.val();
    if (value instanceof Array) {
        return new Array(value.length).map((v, i) => i);
    }
    if (typeof value === 'object') {
        return Object.keys(value);
    }
    return [];
}
class DataSnapshot {
    /**
     * Creates a new DataSnapshot instance
     */
    constructor(ref, value, isRemoved = false, prevValue, context) {
        this.ref = ref;
        this.val = () => { return value; };
        this.previous = () => { return prevValue; };
        this.exists = () => {
            if (isRemoved) {
                return false;
            }
            return value !== null && typeof value !== 'undefined';
        };
        this.context = () => { return context || {}; };
    }
    /**
     * Indicates whether the node exists in the database
     */
    exists() { return false; }
    /**
     * Creates a `DataSnapshot` instance
     * @internal (for internal use)
     */
    static for(ref, value) {
        return new DataSnapshot(ref, value);
    }
    /**
     * Gets a new snapshot for a child node
     * @param path child key or path
     * @returns Returns a `DataSnapshot` of the child
     */
    child(path) {
        // Create new snapshot for child data
        const val = getChild(this, path, false);
        const prev = getChild(this, path, true);
        return new DataSnapshot(this.ref.child(path), val, false, prev);
    }
    /**
     * Checks if the snapshot's value has a child with the given key or path
     * @param path child key or path
     */
    hasChild(path) {
        return getChild(this, path) !== null;
    }
    /**
     * Indicates whether the the snapshot's value has any child nodes
     */
    hasChildren() {
        return getChildren(this).length > 0;
    }
    /**
     * The number of child nodes in this snapshot
     */
    numChildren() {
        return getChildren(this).length;
    }
    /**
     * Runs a callback function for each child node in this snapshot until the callback returns false
     * @param callback function that is called with a snapshot of each child node in this snapshot.
     * Must return a boolean value that indicates whether to continue iterating or not.
     */
    forEach(callback) {
        const value = this.val();
        const prev = this.previous();
        return getChildren(this).every((key) => {
            const snap = new DataSnapshot(this.ref.child(key), value[key], false, prev[key]);
            return callback(snap);
        });
    }
    /**
     * The key of the node's path
     */
    get key() { return this.ref.key; }
}
exports.DataSnapshot = DataSnapshot;
class MutationsDataSnapshot extends DataSnapshot {
    constructor(ref, mutations, context) {
        super(ref, mutations, false, undefined, context);
        /**
         * Don't use this to get previous values of mutated nodes.
         * Use `.previous` properties on the individual child snapshots instead.
         * @throws Throws an error if you do use it.
         */
        this.previous = () => { throw new Error('Iterate values to get previous values for each mutation'); };
        this.val = (warn = true) => {
            if (warn) {
                console.warn('Unless you know what you are doing, it is best not to use the value of a mutations snapshot directly. Use child methods and forEach to iterate the mutations instead');
            }
            return mutations;
        };
    }
    /**
     * Runs a callback function for each mutation in this snapshot until the callback returns false
     * @param callback function that is called with a snapshot of each mutation in this snapshot. Must return a boolean value that indicates whether to continue iterating or not.
     * @returns Returns whether every child was interated
     */
    forEach(callback) {
        const mutations = this.val();
        return mutations.every(mutation => {
            const ref = mutation.target.reduce((ref, key) => ref.child(key), this.ref);
            const snap = new DataSnapshot(ref, mutation.val, false, mutation.prev);
            return callback(snap);
        });
    }
    /**
     * Gets a snapshot of a mutated node
     * @param index index of the mutation
     * @returns Returns a DataSnapshot of the mutated node
     */
    child(index) {
        if (typeof index !== 'number') {
            throw new Error('child index must be a number');
        }
        const mutation = this.val()[index];
        const ref = mutation.target.reduce((ref, key) => ref.child(key), this.ref);
        return new DataSnapshot(ref, mutation.val, false, mutation.prev);
    }
}
exports.MutationsDataSnapshot = MutationsDataSnapshot;

},{"./path-info":29}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugLogger = void 0;
const process_1 = require("./process");
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };
class DebugLogger {
    constructor(level = 'log', prefix = '') {
        this.level = level;
        this.prefix = prefix;
        this.setLevel(level);
    }
    setLevel(level) {
        const prefix = this.prefix ? this.prefix + ' %s' : '';
        this.verbose = ['verbose'].includes(level) ? prefix ? console.log.bind(console, prefix) : console.log.bind(console) : noop;
        this.log = ['verbose', 'log'].includes(level) ? prefix ? console.log.bind(console, prefix) : console.log.bind(console) : noop;
        this.warn = ['verbose', 'log', 'warn'].includes(level) ? prefix ? console.warn.bind(console, prefix) : console.warn.bind(console) : noop;
        this.error = ['verbose', 'log', 'warn', 'error'].includes(level) ? prefix ? console.error.bind(console, prefix) : console.error.bind(console) : noop;
        this.write = (text) => {
            const isRunKit = typeof process_1.default !== 'undefined' && process_1.default.env && typeof process_1.default.env.RUNKIT_ENDPOINT_PATH === 'string';
            if (text && isRunKit) {
                text.split('\n').forEach(line => console.log(line)); // Logs each line separately
            }
            else {
                console.log(text);
            }
        };
    }
}
exports.DebugLogger = DebugLogger;

},{"./process":31}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID = void 0;
const cuid_1 = require("./cuid");
// const uuid62 = require('uuid62');
let timeBias = 0;
class ID {
    /**
     * (for internal use)
     * bias in milliseconds to adjust generated cuid timestamps with
     */
    static set timeBias(bias) {
        if (typeof bias !== 'number') {
            return;
        }
        timeBias = bias;
    }
    static generate() {
        // Could also use https://www.npmjs.com/package/pushid for Firebase style 20 char id's
        return (0, cuid_1.default)(timeBias).slice(1); // Cuts off the always leading 'c'
        // return uuid62.v1();
    }
}
exports.ID = ID;

},{"./cuid":18}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectCollection = exports.PartialArray = exports.SimpleObservable = exports.SchemaDefinition = exports.Colorize = exports.ColorStyle = exports.SimpleEventEmitter = exports.SimpleCache = exports.ascii85 = exports.PathInfo = exports.Utils = exports.TypeMappings = exports.Transport = exports.EventSubscription = exports.EventPublisher = exports.EventStream = exports.PathReference = exports.ID = exports.DebugLogger = exports.OrderedCollectionProxy = exports.proxyAccess = exports.MutationsDataSnapshot = exports.DataSnapshot = exports.DataReferencesArray = exports.DataSnapshotsArray = exports.QueryDataRetrievalOptions = exports.DataRetrievalOptions = exports.DataReferenceQuery = exports.DataReference = exports.Api = exports.AceBaseBaseSettings = exports.AceBaseBase = void 0;
var acebase_base_1 = require("./acebase-base");
Object.defineProperty(exports, "AceBaseBase", { enumerable: true, get: function () { return acebase_base_1.AceBaseBase; } });
Object.defineProperty(exports, "AceBaseBaseSettings", { enumerable: true, get: function () { return acebase_base_1.AceBaseBaseSettings; } });
var api_1 = require("./api");
Object.defineProperty(exports, "Api", { enumerable: true, get: function () { return api_1.Api; } });
var data_reference_1 = require("./data-reference");
Object.defineProperty(exports, "DataReference", { enumerable: true, get: function () { return data_reference_1.DataReference; } });
Object.defineProperty(exports, "DataReferenceQuery", { enumerable: true, get: function () { return data_reference_1.DataReferenceQuery; } });
Object.defineProperty(exports, "DataRetrievalOptions", { enumerable: true, get: function () { return data_reference_1.DataRetrievalOptions; } });
Object.defineProperty(exports, "QueryDataRetrievalOptions", { enumerable: true, get: function () { return data_reference_1.QueryDataRetrievalOptions; } });
Object.defineProperty(exports, "DataSnapshotsArray", { enumerable: true, get: function () { return data_reference_1.DataSnapshotsArray; } });
Object.defineProperty(exports, "DataReferencesArray", { enumerable: true, get: function () { return data_reference_1.DataReferencesArray; } });
var data_snapshot_1 = require("./data-snapshot");
Object.defineProperty(exports, "DataSnapshot", { enumerable: true, get: function () { return data_snapshot_1.DataSnapshot; } });
Object.defineProperty(exports, "MutationsDataSnapshot", { enumerable: true, get: function () { return data_snapshot_1.MutationsDataSnapshot; } });
var data_proxy_1 = require("./data-proxy");
Object.defineProperty(exports, "proxyAccess", { enumerable: true, get: function () { return data_proxy_1.proxyAccess; } });
Object.defineProperty(exports, "OrderedCollectionProxy", { enumerable: true, get: function () { return data_proxy_1.OrderedCollectionProxy; } });
var debug_1 = require("./debug");
Object.defineProperty(exports, "DebugLogger", { enumerable: true, get: function () { return debug_1.DebugLogger; } });
var id_1 = require("./id");
Object.defineProperty(exports, "ID", { enumerable: true, get: function () { return id_1.ID; } });
var path_reference_1 = require("./path-reference");
Object.defineProperty(exports, "PathReference", { enumerable: true, get: function () { return path_reference_1.PathReference; } });
var subscription_1 = require("./subscription");
Object.defineProperty(exports, "EventStream", { enumerable: true, get: function () { return subscription_1.EventStream; } });
Object.defineProperty(exports, "EventPublisher", { enumerable: true, get: function () { return subscription_1.EventPublisher; } });
Object.defineProperty(exports, "EventSubscription", { enumerable: true, get: function () { return subscription_1.EventSubscription; } });
exports.Transport = require("./transport");
var type_mappings_1 = require("./type-mappings");
Object.defineProperty(exports, "TypeMappings", { enumerable: true, get: function () { return type_mappings_1.TypeMappings; } });
exports.Utils = require("./utils");
var path_info_1 = require("./path-info");
Object.defineProperty(exports, "PathInfo", { enumerable: true, get: function () { return path_info_1.PathInfo; } });
var ascii85_1 = require("./ascii85");
Object.defineProperty(exports, "ascii85", { enumerable: true, get: function () { return ascii85_1.ascii85; } });
var simple_cache_1 = require("./simple-cache");
Object.defineProperty(exports, "SimpleCache", { enumerable: true, get: function () { return simple_cache_1.SimpleCache; } });
var simple_event_emitter_1 = require("./simple-event-emitter");
Object.defineProperty(exports, "SimpleEventEmitter", { enumerable: true, get: function () { return simple_event_emitter_1.SimpleEventEmitter; } });
var simple_colors_1 = require("./simple-colors");
Object.defineProperty(exports, "ColorStyle", { enumerable: true, get: function () { return simple_colors_1.ColorStyle; } });
Object.defineProperty(exports, "Colorize", { enumerable: true, get: function () { return simple_colors_1.Colorize; } });
var schema_1 = require("./schema");
Object.defineProperty(exports, "SchemaDefinition", { enumerable: true, get: function () { return schema_1.SchemaDefinition; } });
var optional_observable_1 = require("./optional-observable");
Object.defineProperty(exports, "SimpleObservable", { enumerable: true, get: function () { return optional_observable_1.SimpleObservable; } });
var partial_array_1 = require("./partial-array");
Object.defineProperty(exports, "PartialArray", { enumerable: true, get: function () { return partial_array_1.PartialArray; } });
const object_collection_1 = require("./object-collection");
Object.defineProperty(exports, "ObjectCollection", { enumerable: true, get: function () { return object_collection_1.ObjectCollection; } });

},{"./acebase-base":14,"./api":15,"./ascii85":16,"./data-proxy":20,"./data-reference":21,"./data-snapshot":22,"./debug":23,"./id":24,"./object-collection":26,"./optional-observable":27,"./partial-array":28,"./path-info":29,"./path-reference":30,"./schema":32,"./simple-cache":33,"./simple-colors":34,"./simple-event-emitter":35,"./subscription":36,"./transport":37,"./type-mappings":38,"./utils":39}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectCollection = void 0;
const id_1 = require("./id");
/**
 * Convenience interface for defining an object collection
 * @example
 * type ChatMessage = {
 *    text: string, uid: string, sent: Date
 * }
 * type Chat = {
 *    title: text
 *    messages: ObjectCollection<ChatMessage>
 * }
 */
class ObjectCollection {
    /**
     * Converts and array of values into an object collection, generating a unique key for each item in the array
     * @param array
     * @example
     * const array = [
     *  { title: "Don't make me think!", author: "Steve Krug" },
     *  { title: "The tipping point", author: "Malcolm Gladwell" }
     * ];
     *
     * // Convert:
     * const collection = ObjectCollection.from(array);
     * // --> {
     * //   kh1x3ygb000120r7ipw6biln: {
     * //       title: "Don't make me think!",
     * //       author: "Steve Krug"
     * //   },
     * //   kh1x3ygb000220r757ybpyec: {
     * //       title: "The tipping point",
     * //       author: "Malcolm Gladwell"
     * //   }
     * // }
     *
     * // Now it's easy to add them to the db:
     * db.ref('books').update(collection);
     */
    static from(array) {
        const collection = {};
        array.forEach(child => {
            collection[id_1.ID.generate()] = child;
        });
        return collection;
    }
}
exports.ObjectCollection = ObjectCollection;

},{"./id":24}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleObservable = exports.setObservable = exports.getObservable = void 0;
const utils_1 = require("./utils");
let _shimRequested = false;
let _observable;
(async () => {
    // Try pre-loading rxjs Observable
    // Test availability in global scope first
    const global = (0, utils_1.getGlobalObject)();
    if (typeof global.Observable !== 'undefined') {
        _observable = global.Observable;
        return;
    }
    // Try importing it from dependencies
    try {
        const { Observable } = await Promise.resolve().then(() => require('rxjs'));
        _observable = Observable;
    }
    catch (_a) {
        // rxjs Observable not available, setObservable must be used if usage of SimpleObservable is not desired
        _observable = SimpleObservable;
    }
})();
function getObservable() {
    if (_observable === SimpleObservable && !_shimRequested) {
        console.warn('Using AceBase\'s simple Observable implementation because rxjs is not available. ' +
            'Add it to your project with "npm install rxjs", add it to AceBase using db.setObservable(Observable), ' +
            'or call db.setObservable("shim") to suppress this warning');
    }
    if (_observable) {
        return _observable;
    }
    throw new Error('RxJS Observable could not be loaded. ');
}
exports.getObservable = getObservable;
function setObservable(Observable) {
    if (Observable === 'shim') {
        _observable = SimpleObservable;
        _shimRequested = true;
    }
    else {
        _observable = Observable;
    }
}
exports.setObservable = setObservable;
/**
 * rxjs is an optional dependency that only needs installing when any of AceBase's observe methods are used.
 * If for some reason rxjs is not available (eg in test suite), we can provide a shim. This class is used when
 * `db.setObservable("shim")` is called
 */
class SimpleObservable {
    constructor(create) {
        this._active = false;
        this._subscribers = [];
        this._create = create;
    }
    subscribe(subscriber) {
        if (!this._active) {
            const next = (value) => {
                // emit value to all subscribers
                this._subscribers.forEach(s => {
                    try {
                        s(value);
                    }
                    catch (err) {
                        console.error('Error in subscriber callback:', err);
                    }
                });
            };
            const observer = { next };
            this._cleanup = this._create(observer);
            this._active = true;
        }
        this._subscribers.push(subscriber);
        const unsubscribe = () => {
            this._subscribers.splice(this._subscribers.indexOf(subscriber), 1);
            if (this._subscribers.length === 0) {
                this._active = false;
                this._cleanup();
            }
        };
        const subscription = {
            unsubscribe,
        };
        return subscription;
    }
}
exports.SimpleObservable = SimpleObservable;

},{"./utils":39,"rxjs":40}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialArray = void 0;
/**
 * Sparse/partial array converted to a serializable object. Use `Object.keys(sparseArray)` and `Object.values(sparseArray)` to iterate its indice and/or values
 */
class PartialArray {
    constructor(sparseArray) {
        if (sparseArray instanceof Array) {
            for (let i = 0; i < sparseArray.length; i++) {
                if (typeof sparseArray[i] !== 'undefined') {
                    this[i] = sparseArray[i];
                }
            }
        }
        else if (sparseArray) {
            Object.assign(this, sparseArray);
        }
    }
}
exports.PartialArray = PartialArray;

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathInfo = void 0;
function getPathKeys(path) {
    path = path.replace(/\[/g, '/[').replace(/^\/+/, '').replace(/\/+$/, ''); // Replace [ with /[, remove leading slashes, remove trailing slashes
    if (path.length === 0) {
        return [];
    }
    const keys = path.split('/');
    return keys.map(key => {
        return key.startsWith('[') ? parseInt(key.slice(1, -1)) : key;
    });
}
class PathInfo {
    constructor(path) {
        if (typeof path === 'string') {
            this.keys = getPathKeys(path);
        }
        else if (path instanceof Array) {
            this.keys = path;
        }
        this.path = this.keys.reduce((path, key, i) => i === 0 ? `${key}` : typeof key === 'string' ? `${path}/${key}` : `${path}[${key}]`, '');
    }
    static get(path) {
        return new PathInfo(path);
    }
    static getChildPath(path, childKey) {
        // return getChildPath(path, childKey);
        return PathInfo.get(path).child(childKey).path;
    }
    static getPathKeys(path) {
        return getPathKeys(path);
    }
    get key() {
        return this.keys.length === 0 ? null : this.keys.slice(-1)[0];
    }
    get parent() {
        if (this.keys.length == 0) {
            return null;
        }
        const parentKeys = this.keys.slice(0, -1);
        return new PathInfo(parentKeys);
    }
    get parentPath() {
        return this.keys.length === 0 ? null : this.parent.path;
    }
    child(childKey) {
        if (typeof childKey === 'string') {
            if (childKey.length === 0) {
                throw new Error(`child key for path "${this.path}" cannot be empty`);
            }
            // Allow expansion of a child path (eg "user/name") into equivalent `child('user').child('name')`
            const keys = getPathKeys(childKey);
            keys.forEach(key => {
                // Check AceBase key rules here so they will be enforced regardless of storage target.
                // This prevents specific keys to be allowed in one environment (eg browser), but then
                // refused upon syncing to a binary AceBase db. Fixes https://github.com/appy-one/acebase/issues/172
                if (typeof key !== 'string') {
                    return;
                }
                if (/[\x00-\x08\x0b\x0c\x0e-\x1f/[\]\\]/.test(key)) {
                    throw new Error(`Invalid child key "${key}" for path "${this.path}". Keys cannot contain control characters or any of the following characters: \\ / [ ]`);
                }
                if (key.length > 128) {
                    throw new Error(`child key "${key}" for path "${this.path}" is too long. Max key length is 128`);
                }
                if (key.length === 0) {
                    throw new Error(`child key for path "${this.path}" cannot be empty`);
                }
            });
            childKey = keys;
        }
        return new PathInfo(this.keys.concat(childKey));
    }
    childPath(childKey) {
        return this.child(childKey).path;
    }
    get pathKeys() {
        return this.keys;
    }
    /**
     * If varPath contains variables or wildcards, it will return them with the values found in fullPath
     * @param {string} varPath path containing variables such as * and $name
     * @param {string} fullPath real path to a node
     * @returns {{ [index: number]: string|number, [variable: string]: string|number }} returns an array-like object with all variable values. All named variables are also set on the array by their name (eg vars.uid and vars.$uid)
     * @example
     * PathInfo.extractVariables('users/$uid/posts/$postid', 'users/ewout/posts/post1/title') === {
     *  0: 'ewout',
     *  1: 'post1',
     *  uid: 'ewout', // or $uid
     *  postid: 'post1' // or $postid
     * };
     *
     * PathInfo.extractVariables('users/*\/posts/*\/$property', 'users/ewout/posts/post1/title') === {
     *  0: 'ewout',
     *  1: 'post1',
     *  2: 'title',
     *  property: 'title' // or $property
     * };
     *
     * PathInfo.extractVariables('users/$user/friends[*]/$friend', 'users/dora/friends[4]/diego') === {
     *  0: 'dora',
     *  1: 4,
     *  2: 'diego',
     *  user: 'dora', // or $user
     *  friend: 'diego' // or $friend
     * };
    */
    static extractVariables(varPath, fullPath) {
        if (!varPath.includes('*') && !varPath.includes('$')) {
            return [];
        }
        // if (!this.equals(fullPath)) {
        //     throw new Error(`path does not match with the path of this PathInfo instance: info.equals(path) === false!`)
        // }
        const keys = getPathKeys(varPath);
        const pathKeys = getPathKeys(fullPath);
        let count = 0;
        const variables = {
            get length() { return count; },
        };
        keys.forEach((key, index) => {
            const pathKey = pathKeys[index];
            if (key === '*') {
                variables[count++] = pathKey;
            }
            else if (typeof key === 'string' && key[0] === '$') {
                variables[count++] = pathKey;
                // Set the $variable property
                variables[key] = pathKey;
                // Set friendly property name (without $)
                const varName = key.slice(1);
                if (typeof variables[varName] === 'undefined') {
                    variables[varName] = pathKey;
                }
            }
        });
        return variables;
    }
    /**
     * If varPath contains variables or wildcards, it will return a path with the variables replaced by the keys found in fullPath.
     * @example
     * PathInfo.fillVariables('users/$uid/posts/$postid', 'users/ewout/posts/post1/title') === 'users/ewout/posts/post1'
     */
    static fillVariables(varPath, fullPath) {
        if (varPath.indexOf('*') < 0 && varPath.indexOf('$') < 0) {
            return varPath;
        }
        const keys = getPathKeys(varPath);
        const pathKeys = getPathKeys(fullPath);
        const merged = keys.map((key, index) => {
            if (key === pathKeys[index] || index >= pathKeys.length) {
                return key;
            }
            else if (typeof key === 'string' && (key === '*' || key[0] === '$')) {
                return pathKeys[index];
            }
            else {
                throw new Error(`Path "${fullPath}" cannot be used to fill variables of path "${varPath}" because they do not match`);
            }
        });
        let mergedPath = '';
        merged.forEach(key => {
            if (typeof key === 'number') {
                mergedPath += `[${key}]`;
            }
            else {
                if (mergedPath.length > 0) {
                    mergedPath += '/';
                }
                mergedPath += key;
            }
        });
        return mergedPath;
    }
    /**
     * Replaces all variables in a path with the values in the vars argument
     * @param varPath path containing variables
     * @param vars variables object such as one gotten from PathInfo.extractVariables
     */
    static fillVariables2(varPath, vars) {
        if (typeof vars !== 'object' || Object.keys(vars).length === 0) {
            return varPath; // Nothing to fill
        }
        const pathKeys = getPathKeys(varPath);
        let n = 0;
        const targetPath = pathKeys.reduce((path, key) => {
            if (typeof key === 'string' && (key === '*' || key.startsWith('$'))) {
                return PathInfo.getChildPath(path, vars[n++]);
            }
            else {
                return PathInfo.getChildPath(path, key);
            }
        }, '');
        return targetPath;
    }
    /**
     * Checks if a given path matches this path, eg "posts/*\/title" matches "posts/12344/title" and "users/123/name" matches "users/$uid/name"
     */
    equals(otherPath) {
        const other = otherPath instanceof PathInfo ? otherPath : new PathInfo(otherPath);
        if (this.path === other.path) {
            return true;
        } // they are identical
        if (this.keys.length !== other.keys.length) {
            return false;
        }
        return this.keys.every((key, index) => {
            const otherKey = other.keys[index];
            return otherKey === key
                || (typeof otherKey === 'string' && (otherKey === '*' || otherKey[0] === '$'))
                || (typeof key === 'string' && (key === '*' || key[0] === '$'));
        });
    }
    /**
     * Checks if a given path is an ancestor, eg "posts" is an ancestor of "posts/12344/title"
     */
    isAncestorOf(descendantPath) {
        const descendant = descendantPath instanceof PathInfo ? descendantPath : new PathInfo(descendantPath);
        if (descendant.path === '' || this.path === descendant.path) {
            return false;
        }
        if (this.path === '') {
            return true;
        }
        if (this.keys.length >= descendant.keys.length) {
            return false;
        }
        return this.keys.every((key, index) => {
            const otherKey = descendant.keys[index];
            return otherKey === key
                || (typeof otherKey === 'string' && (otherKey === '*' || otherKey[0] === '$'))
                || (typeof key === 'string' && (key === '*' || key[0] === '$'));
        });
    }
    /**
     * Checks if a given path is a descendant, eg "posts/1234/title" is a descendant of "posts"
     */
    isDescendantOf(ancestorPath) {
        const ancestor = ancestorPath instanceof PathInfo ? ancestorPath : new PathInfo(ancestorPath);
        if (this.path === '' || this.path === ancestor.path) {
            return false;
        }
        if (ancestorPath === '') {
            return true;
        }
        if (ancestor.keys.length >= this.keys.length) {
            return false;
        }
        return ancestor.keys.every((key, index) => {
            const otherKey = this.keys[index];
            return otherKey === key
                || (typeof otherKey === 'string' && (otherKey === '*' || otherKey[0] === '$'))
                || (typeof key === 'string' && (key === '*' || key[0] === '$'));
        });
    }
    /**
     * Checks if the other path is on the same trail as this path. Paths on the same trail if they share a
     * common ancestor. Eg: "posts" is on the trail of "posts/1234/title" and vice versa.
     */
    isOnTrailOf(otherPath) {
        const other = otherPath instanceof PathInfo ? otherPath : new PathInfo(otherPath);
        if (this.path.length === 0 || other.path.length === 0) {
            return true;
        }
        if (this.path === other.path) {
            return true;
        }
        return this.pathKeys.every((key, index) => {
            if (index >= other.keys.length) {
                return true;
            }
            const otherKey = other.keys[index];
            return otherKey === key
                || (typeof otherKey === 'string' && (otherKey === '*' || otherKey[0] === '$'))
                || (typeof key === 'string' && (key === '*' || key[0] === '$'));
        });
    }
    /**
     * Checks if a given path is a direct child, eg "posts/1234/title" is a child of "posts/1234"
     */
    isChildOf(otherPath) {
        const other = otherPath instanceof PathInfo ? otherPath : new PathInfo(otherPath);
        if (this.path === '') {
            return false;
        } // If our path is the root, it's nobody's child...
        return this.parent.equals(other);
    }
    /**
     * Checks if a given path is its parent, eg "posts/1234" is the parent of "posts/1234/title"
     */
    isParentOf(otherPath) {
        const other = otherPath instanceof PathInfo ? otherPath : new PathInfo(otherPath);
        if (other.path === '') {
            return false;
        } // If the other path is the root, this path cannot be its parent
        return this.equals(other.parent);
    }
}
exports.PathInfo = PathInfo;

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathReference = void 0;
class PathReference {
    /**
     * Creates a reference to a path that can be stored in the database. Use this to create cross-references to other data in your database
     * @param path
     */
    constructor(path) {
        this.path = path;
    }
}
exports.PathReference = PathReference;

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    nextTick(fn) {
        setTimeout(fn, 0);
    },
};

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaDefinition = void 0;
// parses a typestring, creates checker functions
function parse(definition) {
    // tokenize
    let pos = 0;
    function consumeSpaces() {
        let c;
        while (c = definition[pos], [' ', '\r', '\n', '\t'].includes(c)) {
            pos++;
        }
    }
    function consumeCharacter(c) {
        if (definition[pos] !== c) {
            throw new Error(`Unexpected character at position ${pos}. Expected: '${c}', found '${definition[pos]}'`);
        }
        pos++;
    }
    function readProperty() {
        consumeSpaces();
        const prop = { name: '', optional: false, wildcard: false };
        let c;
        while (c = definition[pos], c === '_' || c === '$' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (prop.name.length > 0 && c >= '0' && c <= '9') || (prop.name.length === 0 && c === '*')) {
            prop.name += c;
            pos++;
        }
        if (prop.name.length === 0) {
            throw new Error(`Property name expected at position ${pos}, found: ${definition.slice(pos, pos + 10)}..`);
        }
        if (definition[pos] === '?') {
            prop.optional = true;
            pos++;
        }
        if (prop.name === '*' || prop.name[0] === '$') {
            prop.optional = true;
            prop.wildcard = true;
        }
        consumeSpaces();
        consumeCharacter(':');
        return prop;
    }
    function readType() {
        consumeSpaces();
        let type = { typeOf: 'any' }, c;
        // try reading simple type first: (string,number,boolean,Date etc)
        let name = '';
        while (c = definition[pos], (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
            name += c;
            pos++;
        }
        if (name.length === 0) {
            if (definition[pos] === '*') {
                // any value
                consumeCharacter('*');
                type.typeOf = 'any';
            }
            else if (['\'', '"', '`'].includes(definition[pos])) {
                // Read string value
                type.typeOf = 'string';
                type.value = '';
                const quote = definition[pos];
                consumeCharacter(quote);
                while (c = definition[pos], c && c !== quote) {
                    type.value += c;
                    pos++;
                }
                consumeCharacter(quote);
            }
            else if (definition[pos] >= '0' && definition[pos] <= '9') {
                // read numeric value
                type.typeOf = 'number';
                let nr = '';
                while (c = definition[pos], c === '.' || c === 'n' || (c >= '0' && c <= '9')) {
                    nr += c;
                    pos++;
                }
                if (nr.endsWith('n')) {
                    type.value = BigInt(nr);
                }
                else if (nr.includes('.')) {
                    type.value = parseFloat(nr);
                }
                else {
                    type.value = parseInt(nr);
                }
            }
            else if (definition[pos] === '{') {
                // Read object (interface) definition
                consumeCharacter('{');
                type.typeOf = 'object';
                type.instanceOf = Object;
                // Read children:
                type.children = [];
                while (true) {
                    const prop = readProperty();
                    const types = readTypes();
                    type.children.push({ name: prop.name, optional: prop.optional, wildcard: prop.wildcard, types });
                    consumeSpaces();
                    if (definition[pos] === '}') {
                        break;
                    }
                    consumeCharacter(',');
                }
                consumeCharacter('}');
            }
            else if (definition[pos] === '/') {
                // Read regular expression definition
                consumeCharacter('/');
                let pattern = '', flags = '';
                while (c = definition[pos], c !== '/' || pattern.endsWith('\\')) {
                    pattern += c;
                    pos++;
                }
                consumeCharacter('/');
                while (c = definition[pos], ['g', 'i', 'm', 's', 'u', 'y', 'd'].includes(c)) {
                    flags += c;
                    pos++;
                }
                type.typeOf = 'string';
                type.matches = new RegExp(pattern, flags);
            }
            else {
                throw new Error(`Expected a type definition at position ${pos}, found character '${definition[pos]}'`);
            }
        }
        else if (['string', 'number', 'boolean', 'bigint', 'undefined', 'String', 'Number', 'Boolean', 'BigInt'].includes(name)) {
            type.typeOf = name.toLowerCase();
        }
        else if (name === 'Object' || name === 'object') {
            type.typeOf = 'object';
            type.instanceOf = Object;
        }
        else if (name === 'Date') {
            type.typeOf = 'object';
            type.instanceOf = Date;
        }
        else if (name === 'Binary' || name === 'binary') {
            type.typeOf = 'object';
            type.instanceOf = ArrayBuffer;
        }
        else if (name === 'any') {
            type.typeOf = 'any';
        }
        else if (name === 'null') {
            // This is ignored, null values are not stored in the db (null indicates deletion)
            type.typeOf = 'object';
            type.value = null;
        }
        else if (name === 'Array') {
            // Read generic Array defintion
            consumeCharacter('<');
            type.typeOf = 'object';
            type.instanceOf = Array; //name;
            type.genericTypes = readTypes();
            consumeCharacter('>');
        }
        else if (['true', 'false'].includes(name)) {
            type.typeOf = 'boolean';
            type.value = name === 'true';
        }
        else {
            throw new Error(`Unknown type at position ${pos}: "${type}"`);
        }
        // Check if it's an Array of given type (eg: string[] or string[][])
        // Also converts to generics, string[] becomes Array<string>, string[][] becomes Array<Array<string>>
        consumeSpaces();
        while (definition[pos] === '[') {
            consumeCharacter('[');
            consumeCharacter(']');
            type = { typeOf: 'object', instanceOf: Array, genericTypes: [type] };
        }
        return type;
    }
    function readTypes() {
        consumeSpaces();
        const types = [readType()];
        while (definition[pos] === '|') {
            consumeCharacter('|');
            types.push(readType());
            consumeSpaces();
        }
        return types;
    }
    return readType();
}
function checkObject(path, properties, obj, partial) {
    // Are there any properties that should not be in there?
    const invalidProperties = properties.find(prop => prop.name === '*' || prop.name[0] === '$') // Only if no wildcard properties are allowed
        ? []
        : Object.keys(obj).filter(key => ![null, undefined].includes(obj[key]) // Ignore null or undefined values
            && !properties.find(prop => prop.name === key));
    if (invalidProperties.length > 0) {
        return { ok: false, reason: `Object at path "${path}" cannot have propert${invalidProperties.length === 1 ? 'y' : 'ies'} ${invalidProperties.map(p => `"${p}"`).join(', ')}` };
    }
    // Loop through properties that should be present
    function checkProperty(property) {
        const hasValue = ![null, undefined].includes(obj[property.name]);
        if (!property.optional && (partial ? obj[property.name] === null : !hasValue)) {
            return { ok: false, reason: `Property at path "${path}/${property.name}" is not optional` };
        }
        if (hasValue && property.types.length === 1) {
            return checkType(`${path}/${property.name}`, property.types[0], obj[property.name], false);
        }
        if (hasValue && !property.types.some(type => checkType(`${path}/${property.name}`, type, obj[property.name], false).ok)) {
            return { ok: false, reason: `Property at path "${path}/${property.name}" does not match any of ${property.types.length} allowed types` };
        }
        return { ok: true };
    }
    const namedProperties = properties.filter(prop => !prop.wildcard);
    const failedProperty = namedProperties.find(prop => !checkProperty(prop).ok);
    if (failedProperty) {
        const reason = checkProperty(failedProperty).reason;
        return { ok: false, reason };
    }
    const wildcardProperty = properties.find(prop => prop.wildcard);
    if (!wildcardProperty) {
        return { ok: true };
    }
    const wildcardChildKeys = Object.keys(obj).filter(key => !namedProperties.find(prop => prop.name === key));
    let result = { ok: true };
    for (let i = 0; i < wildcardChildKeys.length && result.ok; i++) {
        const childKey = wildcardChildKeys[i];
        result = checkProperty({ name: childKey, types: wildcardProperty.types, optional: true, wildcard: true });
    }
    return result;
}
function checkType(path, type, value, partial, trailKeys) {
    const ok = { ok: true };
    if (type.typeOf === 'any') {
        return ok;
    }
    if (trailKeys instanceof Array && trailKeys.length > 0) {
        // The value to check resides in a descendant path of given type definition.
        // Recursivly check child type definitions to find a match
        if (type.typeOf !== 'object') {
            return { ok: false, reason: `path "${path}" must be typeof ${type.typeOf}` }; // given value resides in a child path, but parent is not allowed be an object.
        }
        if (!type.children) {
            return ok;
        }
        const childKey = trailKeys[0];
        let property = type.children.find(prop => prop.name === childKey);
        if (!property) {
            property = type.children.find(prop => prop.name === '*' || prop.name[0] === '$');
        }
        if (!property) {
            return { ok: false, reason: `Object at path "${path}" cannot have property "${childKey}"` };
        }
        if (property.optional && value === null && trailKeys.length === 1) {
            return ok;
        }
        let result;
        property.types.some(type => {
            const childPath = typeof childKey === 'number' ? `${path}[${childKey}]` : `${path}/${childKey}`;
            result = checkType(childPath, type, value, partial, trailKeys.slice(1));
            return result.ok;
        });
        return result;
    }
    if (value === null) {
        return ok;
    }
    if (type.instanceOf === Object && (typeof value !== 'object' || value instanceof Array || value instanceof Date)) {
        return { ok: false, reason: `path "${path}" must be an object collection` };
    }
    if (type.instanceOf && (typeof value !== 'object' || value.constructor !== type.instanceOf)) { // !(value instanceof type.instanceOf) // value.constructor.name !== type.instanceOf
        return { ok: false, reason: `path "${path}" must be an instance of ${type.instanceOf.name}` };
    }
    if ('value' in type && value !== type.value) {
        return { ok: false, reason: `path "${path}" must be value: ${type.value}` };
    }
    if (typeof value !== type.typeOf) {
        return { ok: false, reason: `path "${path}" must be typeof ${type.typeOf}` };
    }
    if (type.instanceOf === Array && type.genericTypes && !value.every(v => type.genericTypes.some(t => checkType(path, t, v, false).ok))) {
        return { ok: false, reason: `every array value of path "${path}" must match one of the specified types` };
    }
    if (type.typeOf === 'object' && type.children) {
        return checkObject(path, type.children, value, partial);
    }
    if (type.matches && !type.matches.test(value)) {
        return { ok: false, reason: `path "${path}" must match regular expression /${type.matches.source}/${type.matches.flags}` };
    }
    return ok;
}
// eslint-disable-next-line @typescript-eslint/ban-types
function getConstructorType(val) {
    switch (val) {
        case String: return 'string';
        case Number: return 'number';
        case Boolean: return 'boolean';
        case Date: return 'Date';
        case BigInt: return 'bigint';
        case Array: throw new Error('Schema error: Array cannot be used without a type. Use string[] or Array<string> instead');
        default: throw new Error(`Schema error: unknown type used: ${val.name}`);
    }
}
class SchemaDefinition {
    constructor(definition) {
        this.source = definition;
        if (typeof definition === 'object') {
            // Turn object into typescript definitions
            // eg:
            // const example = {
            //     name: String,
            //     born: Date,
            //     instrument: "'guitar'|'piano'",
            //     "address?": {
            //         street: String
            //     }
            // };
            // Resulting ts: "{name:string,born:Date,instrument:'guitar'|'piano',address?:{street:string}}"
            const toTS = (obj) => {
                return '{' + Object.keys(obj)
                    .map(key => {
                    let val = obj[key];
                    if (val === undefined) {
                        val = 'undefined';
                    }
                    else if (val instanceof RegExp) {
                        val = `/${val.source}/${val.flags}`;
                    }
                    else if (typeof val === 'object') {
                        val = toTS(val);
                    }
                    else if (typeof val === 'function') {
                        val = getConstructorType(val);
                    }
                    else if (!['string', 'number', 'boolean', 'bigint'].includes(typeof val)) {
                        throw new Error(`Type definition for key "${key}" must be a string, number, boolean, bigint, object, regular expression, or one of these classes: String, Number, Boolean, Date, BigInt`);
                    }
                    return `${key}:${val}`;
                })
                    .join(',') + '}';
            };
            this.text = toTS(definition);
        }
        else if (typeof definition === 'string') {
            this.text = definition;
        }
        else {
            throw new Error('Type definiton must be a string or an object');
        }
        this.type = parse(this.text);
    }
    check(path, value, partial, trailKeys) {
        return checkType(path, this.type, value, partial, trailKeys);
    }
}
exports.SchemaDefinition = SchemaDefinition;

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCache = void 0;
const utils_1 = require("./utils");
const calculateExpiryTime = (expirySeconds) => expirySeconds > 0 ? Date.now() + (expirySeconds * 1000) : Infinity;
/**
 * Simple cache implementation that retains immutable values in memory for a limited time.
 * Immutability is enforced by cloning the stored and retrieved values. To change a cached value, it will have to be `set` again with the new value.
 */
class SimpleCache {
    constructor(options) {
        var _a;
        this.enabled = true;
        if (typeof options === 'number') {
            // Old signature: only expirySeconds given
            options = { expirySeconds: options };
        }
        options.cloneValues = options.cloneValues !== false;
        if (typeof options.expirySeconds !== 'number' && typeof options.maxEntries !== 'number') {
            throw new Error('Either expirySeconds or maxEntries must be specified');
        }
        this.options = options;
        this.cache = new Map();
        // Cleanup every minute
        const interval = setInterval(() => { this.cleanUp(); }, 60 * 1000);
        (_a = interval.unref) === null || _a === void 0 ? void 0 : _a.call(interval);
    }
    get size() { return this.cache.size; }
    has(key) {
        if (!this.enabled) {
            return false;
        }
        return this.cache.has(key);
    }
    get(key) {
        if (!this.enabled) {
            return null;
        }
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        } // if (!entry || entry.expires <= Date.now()) { return null; }
        entry.expires = calculateExpiryTime(this.options.expirySeconds);
        entry.accessed = Date.now();
        return this.options.cloneValues ? (0, utils_1.cloneObject)(entry.value) : entry.value;
    }
    set(key, value) {
        if (this.options.maxEntries > 0 && this.cache.size >= this.options.maxEntries && !this.cache.has(key)) {
            // console.warn(`* cache limit ${this.options.maxEntries} reached: ${this.cache.size}`);
            // Remove an expired item or the one that was accessed longest ago
            let oldest = null;
            const now = Date.now();
            for (const [key, entry] of this.cache.entries()) {
                if (entry.expires <= now) {
                    // Found an expired item. Remove it now and stop
                    this.cache.delete(key);
                    oldest = null;
                    break;
                }
                if (!oldest || entry.accessed < oldest.accessed) {
                    oldest = { key, accessed: entry.accessed };
                }
            }
            if (oldest !== null) {
                this.cache.delete(oldest.key);
            }
        }
        this.cache.set(key, { value: this.options.cloneValues ? (0, utils_1.cloneObject)(value) : value, added: Date.now(), accessed: Date.now(), expires: calculateExpiryTime(this.options.expirySeconds) });
    }
    remove(key) {
        this.cache.delete(key);
    }
    cleanUp() {
        const now = Date.now();
        this.cache.forEach((entry, key) => {
            if (entry.expires <= now) {
                this.cache.delete(key);
            }
        });
    }
}
exports.SimpleCache = SimpleCache;

},{"./utils":39}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colorize = exports.SetColorsEnabled = exports.ColorsSupported = exports.ColorStyle = void 0;
const process_1 = require("./process");
// See from https://en.wikipedia.org/wiki/ANSI_escape_code
const FontCode = {
    bold: 1,
    dim: 2,
    italic: 3,
    underline: 4,
    inverse: 7,
    hidden: 8,
    strikethrough: 94,
};
const ColorCode = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    grey: 90,
    // Bright colors:
    brightRed: 91,
    // TODO, other bright colors
};
const BgColorCode = {
    bgBlack: 40,
    bgRed: 41,
    bgGreen: 42,
    bgYellow: 43,
    bgBlue: 44,
    bgMagenta: 45,
    bgCyan: 46,
    bgWhite: 47,
    bgGrey: 100,
    bgBrightRed: 101,
    // TODO, other bright colors
};
const ResetCode = {
    all: 0,
    color: 39,
    background: 49,
    bold: 22,
    dim: 22,
    italic: 23,
    underline: 24,
    inverse: 27,
    hidden: 28,
    strikethrough: 29,
};
var ColorStyle;
(function (ColorStyle) {
    ColorStyle["reset"] = "reset";
    ColorStyle["bold"] = "bold";
    ColorStyle["dim"] = "dim";
    ColorStyle["italic"] = "italic";
    ColorStyle["underline"] = "underline";
    ColorStyle["inverse"] = "inverse";
    ColorStyle["hidden"] = "hidden";
    ColorStyle["strikethrough"] = "strikethrough";
    ColorStyle["black"] = "black";
    ColorStyle["red"] = "red";
    ColorStyle["green"] = "green";
    ColorStyle["yellow"] = "yellow";
    ColorStyle["blue"] = "blue";
    ColorStyle["magenta"] = "magenta";
    ColorStyle["cyan"] = "cyan";
    ColorStyle["grey"] = "grey";
    ColorStyle["bgBlack"] = "bgBlack";
    ColorStyle["bgRed"] = "bgRed";
    ColorStyle["bgGreen"] = "bgGreen";
    ColorStyle["bgYellow"] = "bgYellow";
    ColorStyle["bgBlue"] = "bgBlue";
    ColorStyle["bgMagenta"] = "bgMagenta";
    ColorStyle["bgCyan"] = "bgCyan";
    ColorStyle["bgWhite"] = "bgWhite";
    ColorStyle["bgGrey"] = "bgGrey";
})(ColorStyle = exports.ColorStyle || (exports.ColorStyle = {}));
function ColorsSupported() {
    // Checks for basic color support
    if (typeof process_1.default === 'undefined' || !process_1.default.stdout || !process_1.default.env || !process_1.default.platform || process_1.default.platform === 'browser') {
        return false;
    }
    if (process_1.default.platform === 'win32') {
        return true;
    }
    const env = process_1.default.env;
    if (env.COLORTERM) {
        return true;
    }
    if (env.TERM === 'dumb') {
        return false;
    }
    if (env.CI || env.TEAMCITY_VERSION) {
        return !!env.TRAVIS;
    }
    if (['iTerm.app', 'HyperTerm', 'Hyper', 'MacTerm', 'Apple_Terminal', 'vscode'].includes(env.TERM_PROGRAM)) {
        return true;
    }
    if (/^xterm-256|^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return true;
    }
    return false;
}
exports.ColorsSupported = ColorsSupported;
let _enabled = ColorsSupported();
function SetColorsEnabled(enabled) {
    _enabled = ColorsSupported() && enabled;
}
exports.SetColorsEnabled = SetColorsEnabled;
function Colorize(str, style) {
    if (!_enabled) {
        return str;
    }
    const openCodes = [], closeCodes = [];
    const addStyle = (style) => {
        if (style === ColorStyle.reset) {
            openCodes.push(ResetCode.all);
        }
        else if (style in FontCode) {
            openCodes.push(FontCode[style]);
            closeCodes.push(ResetCode[style]);
        }
        else if (style in ColorCode) {
            openCodes.push(ColorCode[style]);
            closeCodes.push(ResetCode.color);
        }
        else if (style in BgColorCode) {
            openCodes.push(BgColorCode[style]);
            closeCodes.push(ResetCode.background);
        }
    };
    if (style instanceof Array) {
        style.forEach(addStyle);
    }
    else {
        addStyle(style);
    }
    // const open = '\u001b[' + openCodes.join(';') + 'm';
    // const close = '\u001b[' + closeCodes.join(';') + 'm';
    const open = openCodes.map(code => '\u001b[' + code + 'm').join('');
    const close = closeCodes.map(code => '\u001b[' + code + 'm').join('');
    // return open + str + close;
    return str.split('\n').map(line => open + line + close).join('\n');
}
exports.Colorize = Colorize;
String.prototype.colorize = function (style) {
    return Colorize(this, style);
};

},{"./process":31}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleEventEmitter = void 0;
function runCallback(callback, data) {
    try {
        callback(data);
    }
    catch (err) {
        console.error('Error in subscription callback', err);
    }
}
class SimpleEventEmitter {
    constructor() {
        this._subscriptions = [];
        this._oneTimeEvents = new Map();
    }
    on(event, callback) {
        if (this._oneTimeEvents.has(event)) {
            return runCallback(callback, this._oneTimeEvents.get(event));
        }
        this._subscriptions.push({ event, callback, once: false });
        return this;
    }
    off(event, callback) {
        this._subscriptions = this._subscriptions.filter(s => s.event !== event || (callback && s.callback !== callback));
        return this;
    }
    once(event, callback) {
        return new Promise(resolve => {
            const ourCallback = (data) => {
                resolve(data);
                callback === null || callback === void 0 ? void 0 : callback(data);
            };
            if (this._oneTimeEvents.has(event)) {
                runCallback(ourCallback, this._oneTimeEvents.get(event));
            }
            else {
                this._subscriptions.push({ event, callback: ourCallback, once: true });
            }
        });
    }
    emit(event, data) {
        if (this._oneTimeEvents.has(event)) {
            throw new Error(`Event "${event}" was supposed to be emitted only once`);
        }
        for (let i = 0; i < this._subscriptions.length; i++) {
            const s = this._subscriptions[i];
            if (s.event !== event) {
                continue;
            }
            runCallback(s.callback, data);
            if (s.once) {
                this._subscriptions.splice(i, 1);
                i--;
            }
        }
        return this;
    }
    emitOnce(event, data) {
        if (this._oneTimeEvents.has(event)) {
            throw new Error(`Event "${event}" was supposed to be emitted only once`);
        }
        this.emit(event, data);
        this._oneTimeEvents.set(event, data); // Mark event as being emitted once for future subscribers
        this.off(event); // Remove all listeners for this event, they won't fire again
        return this;
    }
}
exports.SimpleEventEmitter = SimpleEventEmitter;

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStream = exports.EventPublisher = exports.EventSubscription = void 0;
class EventSubscription {
    /**
     * @param stop function that stops the subscription from receiving future events
     */
    constructor(stop) {
        this.stop = stop;
        this._internal = {
            state: 'init',
            activatePromises: [],
        };
    }
    /**
     * Notifies when subscription is activated or canceled
     * @param callback optional callback to run each time activation state changes
     * @returns returns a promise that resolves once activated, or rejects when it is denied (and no callback was supplied)
     */
    activated(callback) {
        if (callback) {
            this._internal.activatePromises.push({ callback });
            if (this._internal.state === 'active') {
                callback(true);
            }
            else if (this._internal.state === 'canceled') {
                callback(false, this._internal.cancelReason);
            }
        }
        // Changed behaviour: now also returns a Promise when the callback is used.
        // This allows for 1 activated call to both handle: first activation result,
        // and any future events using the callback
        return new Promise((resolve, reject) => {
            if (this._internal.state === 'active') {
                return resolve();
            }
            else if (this._internal.state === 'canceled' && !callback) {
                return reject(new Error(this._internal.cancelReason));
            }
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const noop = () => { };
            this._internal.activatePromises.push({
                resolve,
                reject: callback ? noop : reject, // Don't reject when callback is used: let callback handle this (prevents UnhandledPromiseRejection if only callback is used)
            });
        });
    }
    /** (for internal use) */
    _setActivationState(activated, cancelReason) {
        this._internal.cancelReason = cancelReason;
        this._internal.state = activated ? 'active' : 'canceled';
        while (this._internal.activatePromises.length > 0) {
            const p = this._internal.activatePromises.shift();
            if (activated) {
                p.callback && p.callback(true);
                p.resolve && p.resolve();
            }
            else {
                p.callback && p.callback(false, cancelReason);
                p.reject && p.reject(cancelReason);
            }
        }
    }
}
exports.EventSubscription = EventSubscription;
class EventPublisher {
    /**
     *
     * @param publish function that publishes a new value to subscribers, return if there are any active subscribers
     * @param start function that notifies subscribers their subscription is activated
     * @param cancel function that notifies subscribers their subscription has been canceled, removes all subscriptions
     */
    constructor(publish, start, cancel) {
        this.publish = publish;
        this.start = start;
        this.cancel = cancel;
    }
}
exports.EventPublisher = EventPublisher;
class EventStream {
    constructor(eventPublisherCallback) {
        const subscribers = [];
        let noMoreSubscribersCallback;
        let activationState; // TODO: refactor to string only: STATE_INIT, STATE_STOPPED, STATE_ACTIVATED, STATE_CANCELED
        const STATE_STOPPED = 'stopped (no more subscribers)';
        this.subscribe = (callback, activationCallback) => {
            if (typeof callback !== 'function') {
                throw new TypeError('callback must be a function');
            }
            else if (activationState === STATE_STOPPED) {
                throw new Error('stream can\'t be used anymore because all subscribers were stopped');
            }
            const sub = {
                callback,
                activationCallback: function (activated, cancelReason) {
                    activationCallback === null || activationCallback === void 0 ? void 0 : activationCallback(activated, cancelReason);
                    this.subscription._setActivationState(activated, cancelReason);
                },
                subscription: new EventSubscription(function stop() {
                    subscribers.splice(subscribers.indexOf(this), 1);
                    return checkActiveSubscribers();
                }),
            };
            subscribers.push(sub);
            if (typeof activationState !== 'undefined') {
                if (activationState === true) {
                    activationCallback === null || activationCallback === void 0 ? void 0 : activationCallback(true);
                    sub.subscription._setActivationState(true);
                }
                else if (typeof activationState === 'string') {
                    activationCallback === null || activationCallback === void 0 ? void 0 : activationCallback(false, activationState);
                    sub.subscription._setActivationState(false, activationState);
                }
            }
            return sub.subscription;
        };
        const checkActiveSubscribers = () => {
            let ret;
            if (subscribers.length === 0) {
                ret = noMoreSubscribersCallback === null || noMoreSubscribersCallback === void 0 ? void 0 : noMoreSubscribersCallback();
                activationState = STATE_STOPPED;
            }
            return Promise.resolve(ret);
        };
        this.unsubscribe = (callback) => {
            const remove = callback
                ? subscribers.filter(sub => sub.callback === callback)
                : subscribers;
            remove.forEach(sub => {
                const i = subscribers.indexOf(sub);
                subscribers.splice(i, 1);
            });
            checkActiveSubscribers();
        };
        this.stop = () => {
            // Stop (remove) all subscriptions
            subscribers.splice(0);
            checkActiveSubscribers();
        };
        /**
         * For publishing side: adds a value that will trigger callbacks to all subscribers
         * @param val
         * @returns returns whether there are subscribers left
         */
        const publish = (val) => {
            subscribers.forEach(sub => {
                try {
                    sub.callback(val);
                }
                catch (err) {
                    console.error(`Error running subscriber callback: ${err.message}`);
                }
            });
            if (subscribers.length === 0) {
                checkActiveSubscribers();
            }
            return subscribers.length > 0;
        };
        /**
         * For publishing side: let subscribers know their subscription is activated. Should be called only once
         */
        const start = (allSubscriptionsStoppedCallback) => {
            activationState = true;
            noMoreSubscribersCallback = allSubscriptionsStoppedCallback;
            subscribers.forEach(sub => {
                var _a;
                (_a = sub.activationCallback) === null || _a === void 0 ? void 0 : _a.call(sub, true);
            });
        };
        /**
         * For publishing side: let subscribers know their subscription has been canceled. Should be called only once
         */
        const cancel = (reason) => {
            activationState = reason;
            subscribers.forEach(sub => {
                var _a;
                (_a = sub.activationCallback) === null || _a === void 0 ? void 0 : _a.call(sub, false, reason || new Error('unknown reason'));
            });
            subscribers.splice(0); // Clear all
        };
        const publisher = new EventPublisher(publish, start, cancel);
        eventPublisherCallback(publisher);
    }
}
exports.EventStream = EventStream;

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize2 = exports.serialize2 = exports.serialize = exports.detectSerializeVersion = exports.deserialize = void 0;
const path_reference_1 = require("./path-reference");
const utils_1 = require("./utils");
const ascii85_1 = require("./ascii85");
const path_info_1 = require("./path-info");
const partial_array_1 = require("./partial-array");
/*
    There are now 2 different serialization methods for transporting values.

    v1:
    The original version (v1) created an object with "map" and "val" properties.
    The "map" property was made optional in v1.14.1 so they won't be present for values needing no serializing

    v2:
    The new version replaces serialized values inline by objects containing ".type" and ".val" properties.
    This serializing method was introduced by `export` and `import` methods because they use streaming and
    are unable to prepare type mappings up-front. This format is smaller in transmission (in many cases),
    and easier to read and process.

    original: { "date": (some date) }
    v1 serialized: { "map": { "date": "date" }, "val": { date: "2022-04-22T07:49:23Z" } }
    v2 serialized: { "date": { ".type": "date", ".val": "2022-04-22T07:49:23Z" } }

    original: (some date)
    v1 serialized: { "map": "date", "val": "2022-04-22T07:49:23Z" }
    v2 serialized: { ".type": "date", ".val": "2022-04-22T07:49:23Z" }
    comment: top level value that need serializing is wrapped in an object with ".type" and ".val". v1 is smaller in this case

    original: 'some string'
    v1 serialized: { "map": {}, "val": "some string" }
    v2 serialized: "some string"
    comment: primitive types such as strings don't need serializing and are returned as is in v2

    original: { "date": (some date), "text": "Some string" }
    v1 serialized: { "map": { "date": "date" }, "val": { date: "2022-04-22T07:49:23Z", "text": "Some string" } }
    v2 serialized: { "date": { ".type": "date", ".val": "2022-04-22T07:49:23Z" }, "text": "Some string" }
*/
/**
 * Original deserialization method using global `map` and `val` properties
 * @param data
 * @returns
 */
const deserialize = (data) => {
    if (data.map === null || typeof data.map === 'undefined') {
        if (typeof data.val === 'undefined') {
            throw new Error('serialized value must have a val property');
        }
        return data.val;
    }
    const deserializeValue = (type, val) => {
        if (type === 'date') {
            // Date was serialized as a string (UTC)
            return new Date(val);
        }
        else if (type === 'binary') {
            // ascii85 encoded binary data
            return ascii85_1.ascii85.decode(val);
        }
        else if (type === 'reference') {
            return new path_reference_1.PathReference(val);
        }
        else if (type === 'regexp') {
            return new RegExp(val.pattern, val.flags);
        }
        else if (type === 'array') {
            return new partial_array_1.PartialArray(val);
        }
        else if (type === 'bigint') {
            return BigInt(val);
        }
        return val;
    };
    if (typeof data.map === 'string') {
        // Single value
        return deserializeValue(data.map, data.val);
    }
    Object.keys(data.map).forEach(path => {
        const type = data.map[path];
        const keys = path_info_1.PathInfo.getPathKeys(path);
        let parent = data;
        let key = 'val';
        let val = data.val;
        keys.forEach(k => {
            key = k;
            parent = val;
            val = val[key]; // If an error occurs here, there's something wrong with the calling code...
        });
        parent[key] = deserializeValue(type, val);
    });
    return data.val;
};
exports.deserialize = deserialize;
/**
 * Function to detect the used serialization method with for the given object
 * @param data
 * @returns
 */
const detectSerializeVersion = (data) => {
    if (typeof data !== 'object' || data === null) {
        // This can only be v2, which allows primitive types to bypass serializing
        return 2;
    }
    if ('map' in data && 'val' in data) {
        return 1;
    }
    else if ('val' in data) {
        // If it's v1, 'val' will be the only key in the object because serialize2 adds ".version": 2 to the object to prevent confusion.
        if (Object.keys(data).length > 1) {
            return 2;
        }
        return 1;
    }
    return 2;
};
exports.detectSerializeVersion = detectSerializeVersion;
/**
 * Original serialization method using global `map` and `val` properties
 * @param data
 * @returns
 */
const serialize = (obj) => {
    var _a;
    // Recursively find dates and binary data
    if (obj === null || typeof obj !== 'object' || obj instanceof Date || obj instanceof ArrayBuffer || obj instanceof path_reference_1.PathReference || obj instanceof RegExp) {
        // Single value
        const ser = (0, exports.serialize)({ value: obj });
        return {
            map: (_a = ser.map) === null || _a === void 0 ? void 0 : _a.value,
            val: ser.val.value,
        };
    }
    obj = (0, utils_1.cloneObject)(obj); // Make sure we don't alter the original object
    const process = (obj, mappings, prefix) => {
        if (obj instanceof partial_array_1.PartialArray) {
            mappings[prefix] = 'array';
        }
        Object.keys(obj).forEach(key => {
            const val = obj[key];
            const path = prefix.length === 0 ? key : `${prefix}/${key}`;
            if (typeof val === 'bigint') {
                obj[key] = val.toString();
                mappings[path] = 'bigint';
            }
            else if (val instanceof Date) {
                // serialize date to UTC string
                obj[key] = val.toISOString();
                mappings[path] = 'date';
            }
            else if (val instanceof ArrayBuffer) {
                // Serialize binary data with ascii85
                obj[key] = ascii85_1.ascii85.encode(val); //ascii85.encode(Buffer.from(val)).toString();
                mappings[path] = 'binary';
            }
            else if (val instanceof path_reference_1.PathReference) {
                obj[key] = val.path;
                mappings[path] = 'reference';
            }
            else if (val instanceof RegExp) {
                // Queries using the 'matches' filter with a regular expression can now also be used on remote db's
                obj[key] = { pattern: val.source, flags: val.flags };
                mappings[path] = 'regexp';
            }
            else if (typeof val === 'object' && val !== null) {
                process(val, mappings, path);
            }
        });
    };
    const mappings = {};
    process(obj, mappings, '');
    const serialized = { val: obj };
    if (Object.keys(mappings).length > 0) {
        serialized.map = mappings;
    }
    return serialized;
};
exports.serialize = serialize;
/**
 * New serialization method using inline `.type` and `.val` properties
 * @param obj
 * @returns
 */
const serialize2 = (obj) => {
    // Recursively find data that needs serializing
    const getSerializedValue = (val) => {
        if (typeof val === 'bigint') {
            // serialize bigint to string
            return {
                '.type': 'bigint',
                '.val': val.toString(),
            };
        }
        else if (val instanceof Date) {
            // serialize date to UTC string
            return {
                '.type': 'date',
                '.val': val.toISOString(),
            };
        }
        else if (val instanceof ArrayBuffer) {
            // Serialize binary data with ascii85
            return {
                '.type': 'binary',
                '.val': ascii85_1.ascii85.encode(val),
            };
        }
        else if (val instanceof path_reference_1.PathReference) {
            return {
                '.type': 'reference',
                '.val': val.path,
            };
        }
        else if (val instanceof RegExp) {
            // Queries using the 'matches' filter with a regular expression can now also be used on remote db's
            return {
                '.type': 'regexp',
                '.val': `/${val.source}/${val.flags}`, // new: shorter
                // '.val': {
                //     pattern: val.source,
                //     flags: val.flags
                // }
            };
        }
        else if (typeof val === 'object' && val !== null) {
            if (val instanceof Array) {
                const copy = [];
                for (let i = 0; i < val.length; i++) {
                    copy[i] = getSerializedValue(val[i]);
                }
                return copy;
            }
            else {
                const copy = {}; //val instanceof Array ? [] : {} as SerializedValueV2;
                if (val instanceof partial_array_1.PartialArray) {
                    // Mark the object as partial ("sparse") array
                    copy['.type'] = 'array';
                }
                for (const prop in val) {
                    copy[prop] = getSerializedValue(val[prop]);
                }
                return copy;
            }
        }
        else {
            // Primitive value. Don't serialize
            return val;
        }
    };
    const serialized = getSerializedValue(obj);
    if (serialized !== null && typeof serialized === 'object' && 'val' in serialized && Object.keys(serialized).length === 1) {
        // acebase-core v1.14.1 made the 'map' property optional.
        // This v2 serialized object might be confused with a v1 without mappings, because it only has a "val" property
        // To prevent this, mark the serialized object with version 2
        serialized['.version'] = 2;
    }
    return serialized;
};
exports.serialize2 = serialize2;
/**
 * New deserialization method using inline `.type` and `.val` properties
 * @param obj
 * @returns
 */
const deserialize2 = (data) => {
    if (typeof data !== 'object' || data === null) {
        // primitive value, not serialized
        return data;
    }
    if (typeof data['.type'] === 'undefined') {
        // No type given: this is a plain object or array
        if (data instanceof Array) {
            // Plain array, deserialize items into a copy
            const copy = [];
            const arr = data;
            for (let i = 0; i < arr.length; i++) {
                copy.push((0, exports.deserialize2)(arr[i]));
            }
            return copy;
        }
        else {
            // Plain object, deserialize properties into a copy
            const copy = {};
            const obj = data;
            for (const prop in obj) {
                copy[prop] = (0, exports.deserialize2)(obj[prop]);
            }
            return copy;
        }
    }
    else if (typeof data['.type'] === 'string') {
        const dataType = data['.type'].toLowerCase();
        if (dataType === 'bigint') {
            const val = data['.val'];
            return BigInt(val);
        }
        else if (dataType === 'array') {
            // partial ("sparse") array, deserialize children into a copy
            const arr = data;
            const copy = {};
            for (const index in arr) {
                copy[index] = (0, exports.deserialize2)(arr[index]);
            }
            delete copy['.type'];
            return new partial_array_1.PartialArray(copy);
        }
        else if (dataType === 'date') {
            // Date was serialized as a string (UTC)
            const val = data['.val'];
            return new Date(val);
        }
        else if (dataType === 'binary') {
            // ascii85 encoded binary data
            const val = data['.val'];
            return ascii85_1.ascii85.decode(val);
        }
        else if (dataType === 'reference') {
            const val = data['.val'];
            return new path_reference_1.PathReference(val);
        }
        else if (dataType === 'regexp') {
            const val = data['.val'];
            if (typeof val === 'string') {
                // serialized as '/(pattern)/flags'
                const match = /^\/(.*)\/([a-z]+)$/.exec(val);
                return new RegExp(match[1], match[2]);
            }
            // serialized as object with pattern & flags properties
            return new RegExp(val.pattern, val.flags);
        }
    }
    throw new Error(`Unknown data type "${data['.type']}" in serialized value`);
};
exports.deserialize2 = deserialize2;

},{"./ascii85":16,"./partial-array":28,"./path-info":29,"./path-reference":30,"./utils":39}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeMappings = void 0;
const utils_1 = require("./utils");
const path_info_1 = require("./path-info");
const data_reference_1 = require("./data-reference");
const data_snapshot_1 = require("./data-snapshot");
/**
 * (for internal use) - gets the mapping set for a specific path
 */
function get(mappings, path) {
    // path points to the mapped (object container) location
    path = path.replace(/^\/|\/$/g, ''); // trim slashes
    const keys = path_info_1.PathInfo.getPathKeys(path);
    const mappedPath = Object.keys(mappings).find(mpath => {
        const mkeys = path_info_1.PathInfo.getPathKeys(mpath);
        if (mkeys.length !== keys.length) {
            return false; // Can't be a match
        }
        return mkeys.every((mkey, index) => {
            if (mkey === '*' || (typeof mkey === 'string' && mkey[0] === '$')) {
                return true; // wildcard
            }
            return mkey === keys[index];
        });
    });
    const mapping = mappings[mappedPath];
    return mapping;
}
/**
 * (for internal use) - gets the mapping set for a specific path's parent
 */
function map(mappings, path) {
    // path points to the object location, its parent should have the mapping
    const targetPath = path_info_1.PathInfo.get(path).parentPath;
    if (targetPath === null) {
        return;
    }
    return get(mappings, targetPath);
}
/**
 * (for internal use) - gets all mappings set for a specific path and all subnodes
 * @returns returns array of all matched mappings in path
 */
function mapDeep(mappings, entryPath) {
    // returns mapping for this node, and all mappings for nested nodes
    // entryPath: "users/ewout"
    // mappingPath: "users"
    // mappingPath: "users/*/posts"
    entryPath = entryPath.replace(/^\/|\/$/g, ''); // trim slashes
    // Start with current path's parent node
    const pathInfo = path_info_1.PathInfo.get(entryPath);
    const startPath = pathInfo.parentPath;
    const keys = startPath ? path_info_1.PathInfo.getPathKeys(startPath) : [];
    // Every path that starts with startPath, is a match
    // TODO: refactor to return Object.keys(mappings),filter(...)
    const matches = Object.keys(mappings).reduce((m, mpath) => {
        //const mkeys = mpath.length > 0 ? mpath.split("/") : [];
        const mkeys = path_info_1.PathInfo.getPathKeys(mpath);
        if (mkeys.length < keys.length) {
            return m; // Can't be a match
        }
        let isMatch = true;
        if (keys.length === 0 && startPath !== null) {
            // Only match first node's children if mapping pattern is "*" or "$variable"
            isMatch = mkeys.length === 1 && (mkeys[0] === '*' || (typeof mkeys[0] === 'string' && mkeys[0][0] === '$'));
        }
        else {
            mkeys.every((mkey, index) => {
                if (index >= keys.length) {
                    return false; // stop .every loop
                }
                else if ((mkey === '*' || (typeof mkey === 'string' && mkey[0] === '$')) || mkey === keys[index]) {
                    return true; // continue .every loop
                }
                else {
                    isMatch = false;
                    return false; // stop .every loop
                }
            });
        }
        if (isMatch) {
            const mapping = mappings[mpath];
            m.push({ path: mpath, type: mapping });
        }
        return m;
    }, []);
    return matches;
}
/**
 * (for internal use) - serializes or deserializes an object using type mappings
 * @returns returns the (de)serialized value
 */
function process(db, mappings, path, obj, action) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    const keys = path_info_1.PathInfo.getPathKeys(path); // path.length > 0 ? path.split("/") : [];
    const m = mapDeep(mappings, path);
    const changes = [];
    m.sort((a, b) => path_info_1.PathInfo.getPathKeys(a.path).length > path_info_1.PathInfo.getPathKeys(b.path).length ? -1 : 1); // Deepest paths first
    m.forEach(mapping => {
        const mkeys = path_info_1.PathInfo.getPathKeys(mapping.path); //mapping.path.length > 0 ? mapping.path.split("/") : [];
        mkeys.push('*');
        const mTrailKeys = mkeys.slice(keys.length);
        if (mTrailKeys.length === 0) {
            const vars = path_info_1.PathInfo.extractVariables(mapping.path, path);
            const ref = new data_reference_1.DataReference(db, path, vars);
            if (action === 'serialize') {
                // serialize this object
                obj = mapping.type.serialize(obj, ref);
            }
            else if (action === 'deserialize') {
                // deserialize this object
                const snap = new data_snapshot_1.DataSnapshot(ref, obj);
                obj = mapping.type.deserialize(snap);
            }
            return;
        }
        // Find all nested objects at this trail path
        const process = (parentPath, parent, keys) => {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }
            const key = keys[0];
            let children = [];
            if (key === '*' || (typeof key === 'string' && key[0] === '$')) {
                // Include all children
                if (parent instanceof Array) {
                    children = parent.map((val, index) => ({ key: index, val }));
                }
                else {
                    children = Object.keys(parent).map(k => ({ key: k, val: parent[k] }));
                }
            }
            else {
                // Get the 1 child
                const child = parent[key];
                if (typeof child === 'object') {
                    children.push({ key, val: child });
                }
            }
            children.forEach(child => {
                const childPath = path_info_1.PathInfo.getChildPath(parentPath, child.key);
                const vars = path_info_1.PathInfo.extractVariables(mapping.path, childPath);
                const ref = new data_reference_1.DataReference(db, childPath, vars);
                if (keys.length === 1) {
                    // TODO: this alters the existing object, we must build our own copy!
                    if (action === 'serialize') {
                        // serialize this object
                        changes.push({ parent, key: child.key, original: parent[child.key] });
                        parent[child.key] = mapping.type.serialize(child.val, ref);
                    }
                    else if (action === 'deserialize') {
                        // deserialize this object
                        const snap = new data_snapshot_1.DataSnapshot(ref, child.val);
                        parent[child.key] = mapping.type.deserialize(snap);
                    }
                }
                else {
                    // Dig deeper
                    process(childPath, child.val, keys.slice(1));
                }
            });
        };
        process(path, obj, mTrailKeys);
    });
    if (action === 'serialize') {
        // Clone this serialized object so any types that remained
        // will become plain objects without functions, and we can restore
        // the original object's values if any mappings were processed.
        // This will also prevent circular references
        obj = (0, utils_1.cloneObject)(obj);
        if (changes.length > 0) {
            // Restore the changes made to the original object
            changes.forEach(change => {
                change.parent[change.key] = change.original;
            });
        }
    }
    return obj;
}
const _mappings = Symbol('mappings');
class TypeMappings {
    constructor(db) {
        this.db = db;
        this[_mappings] = {};
    }
    /** (for internal use) */
    get mappings() { return this[_mappings]; }
    /** (for internal use) */
    map(path) {
        return map(this[_mappings], path);
    }
    /**
     * Maps objects that are stored in a specific path to a class, so they can automatically be
     * serialized when stored to, and deserialized (instantiated) when loaded from the database.
     * @param path path to an object container, eg "users" or "users/*\/posts"
     * @param type class to bind all child objects of path to
     * Best practice is to implement 2 methods for instantiation and serializing of your objects:
     * 1) `static create(snap: DataSnapshot)` and 2) `serialize(ref: DataReference)`. See example
     * @param options (optional) You can specify the functions to use to
     * serialize and/or instantiate your class. If you do not specificy a creator (constructor) method,
     * AceBase will call `YourClass.create(snapshot)` method if it exists, or create an instance of
     * YourClass with `new YourClass(snapshot)`.
     * If you do not specifiy a serializer method, AceBase will call `YourClass.prototype.serialize(ref)`
     * if it exists, or tries storing your object's fields unaltered. NOTE: `this` in your creator
     * function will point to `YourClass`, and `this` in your serializer function will point to the
     * `instance` of `YourClass`.
     * @example
     * class User {
     *    static create(snap: DataSnapshot): User {
     *        // Deserialize (instantiate) User from plain database object
     *        let user = new User();
     *        Object.assign(user, snap.val()); // Copy all properties to user
     *        user.id = snap.ref.key; // Add the key as id
     *        return user;
     *    }
     *    serialize(ref: DataReference) {
     *        // Serialize user for database storage
     *        return {
     *            name: this.name
     *            email: this.email
     *        };
     *    }
     * }
     * db.types.bind('users', User); // Automatically uses serialize and static create methods
     */
    bind(path, type, options = {}) {
        // Maps objects that are stored in a specific path to a constructor method,
        // so they are automatically deserialized
        if (typeof path !== 'string') {
            throw new TypeError('path must be a string');
        }
        if (typeof type !== 'function') {
            throw new TypeError('constructor must be a function');
        }
        if (typeof options.serializer === 'undefined') {
            // if (typeof type.prototype.serialize === 'function') {
            //     // Use .serialize instance method
            //     options.serializer = type.prototype.serialize;
            // }
            // Use object's serialize method upon serialization (if available)
        }
        else if (typeof options.serializer === 'string') {
            if (typeof type.prototype[options.serializer] === 'function') {
                options.serializer = type.prototype[options.serializer];
            }
            else {
                throw new TypeError(`${type.name}.prototype.${options.serializer} is not a function, cannot use it as serializer`);
            }
        }
        else if (typeof options.serializer !== 'function') {
            throw new TypeError(`serializer for class ${type.name} must be a function, or the name of a prototype method`);
        }
        if (typeof options.creator === 'undefined') {
            if (typeof type.create === 'function') {
                // Use static .create as creator method
                options.creator = type.create;
            }
        }
        else if (typeof options.creator === 'string') {
            if (typeof type[options.creator] === 'function') {
                options.creator = type[options.creator];
            }
            else {
                throw new TypeError(`${type.name}.${options.creator} is not a function, cannot use it as creator`);
            }
        }
        else if (typeof options.creator !== 'function') {
            throw new TypeError(`creator for class ${type.name} must be a function, or the name of a static method`);
        }
        path = path.replace(/^\/|\/$/g, ''); // trim slashes
        this[_mappings][path] = {
            db: this.db,
            type,
            creator: options.creator,
            serializer: options.serializer,
            deserialize(snap) {
                // run constructor method
                let obj;
                if (this.creator) {
                    obj = this.creator.call(this.type, snap);
                }
                else {
                    obj = new this.type(snap);
                }
                return obj;
            },
            serialize(obj, ref) {
                if (this.serializer) {
                    obj = this.serializer.call(obj, ref, obj);
                }
                else if (obj && typeof obj.serialize === 'function') {
                    obj = obj.serialize(ref, obj);
                }
                return obj;
            },
        };
    }
    /**
     * @internal (for internal use)
     * Serializes any child in given object that has a type mapping
     * @param path | path to the object's location
     * @param obj object to serialize
     */
    serialize(path, obj) {
        return process(this.db, this[_mappings], path, obj, 'serialize');
    }
    /**
     * @internal (for internal use)
     * Deserialzes any child in given object that has a type mapping
     * @param path path to the object's location
     * @param obj object to deserialize
     */
    deserialize(path, obj) {
        return process(this.db, this[_mappings], path, obj, 'deserialize');
    }
}
exports.TypeMappings = TypeMappings;

},{"./data-reference":21,"./data-snapshot":22,"./path-info":29,"./utils":39}],39:[function(require,module,exports){
(function (global,Buffer){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalObject = exports.defer = exports.getChildValues = exports.getMutations = exports.compareValues = exports.ObjectDifferences = exports.valuesAreEqual = exports.cloneObject = exports.concatTypedArrays = exports.decodeString = exports.encodeString = exports.bytesToBigint = exports.bigintToBytes = exports.bytesToNumber = exports.numberToBytes = void 0;
const path_reference_1 = require("./path-reference");
const process_1 = require("./process");
const partial_array_1 = require("./partial-array");
function numberToBytes(number) {
    const bytes = new Uint8Array(8);
    const view = new DataView(bytes.buffer);
    view.setFloat64(0, number);
    return new Array(...bytes);
}
exports.numberToBytes = numberToBytes;
function bytesToNumber(bytes) {
    const length = Array.isArray(bytes) ? bytes.length : bytes.byteLength;
    if (length !== 8) {
        throw new TypeError('must be 8 bytes');
    }
    const bin = new Uint8Array(bytes);
    const view = new DataView(bin.buffer);
    const nr = view.getFloat64(0);
    return nr;
}
exports.bytesToNumber = bytesToNumber;
const big = {
    zero: BigInt(0),
    one: BigInt(1),
    two: BigInt(2),
    eight: BigInt(8),
    ff: BigInt(0xff),
};
function bigintToBytes(number) {
    if (typeof number !== 'bigint') {
        throw new Error('number must be a bigint');
    }
    const bytes = [];
    const negative = number < big.zero;
    do {
        const byte = Number(number & big.ff); // NOTE: bits are inverted on negative numbers
        bytes.push(byte);
        number = number >> big.eight;
    } while (number !== (negative ? -big.one : big.zero));
    bytes.reverse(); // little-endian
    if (negative ? bytes[0] < 128 : bytes[0] >= 128) {
        bytes.unshift(negative ? 255 : 0); // extra sign byte needed
    }
    return bytes;
}
exports.bigintToBytes = bigintToBytes;
function bytesToBigint(bytes) {
    const negative = bytes[0] >= 128;
    let number = big.zero;
    for (let b of bytes) {
        if (negative) {
            b = ~b & 0xff;
        } // Invert the bits
        number = (number << big.eight) + BigInt(b);
    }
    if (negative) {
        number = -(number + big.one);
    }
    return number;
}
exports.bytesToBigint = bytesToBigint;
/**
 * Converts a string to a utf-8 encoded Uint8Array
 */
function encodeString(str) {
    if (typeof TextEncoder !== 'undefined') {
        // Modern browsers, Node.js v11.0.0+ (or v8.3.0+ with util.TextEncoder)
        const encoder = new TextEncoder();
        return encoder.encode(str);
    }
    else if (typeof Buffer === 'function') {
        // Node.js
        const buf = Buffer.from(str, 'utf-8');
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    else {
        // Older browsers. Manually encode
        const arr = [];
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (code > 128) {
                // Attempt simple UTF-8 conversion. See https://en.wikipedia.org/wiki/UTF-8
                if ((code & 0xd800) === 0xd800) {
                    // code starts with 1101 10...: this is a 2-part utf-16 char code
                    const nextCode = str.charCodeAt(i + 1);
                    if ((nextCode & 0xdc00) !== 0xdc00) {
                        // next code must start with 1101 11...
                        throw new Error('follow-up utf-16 character does not start with 0xDC00');
                    }
                    i++;
                    const p1 = code & 0x3ff; // Only use last 10 bits
                    const p2 = nextCode & 0x3ff;
                    // Create code point from these 2: (see https://en.wikipedia.org/wiki/UTF-16)
                    code = 0x10000 | (p1 << 10) | p2;
                }
                if (code < 2048) {
                    // Use 2 bytes for 11 bit value, first byte starts with 110xxxxx (0xc0), 2nd byte with 10xxxxxx (0x80)
                    const b1 = 0xc0 | ((code >> 6) & 0x1f); // 0xc0 = 11000000, 0x1f = 11111
                    const b2 = 0x80 | (code & 0x3f); // 0x80 = 10000000, 0x3f = 111111
                    arr.push(b1, b2);
                }
                else if (code < 65536) {
                    // Use 3 bytes for 16-bit value, bits per byte: 4, 6, 6
                    const b1 = 0xe0 | ((code >> 12) & 0xf); // 0xe0 = 11100000, 0xf = 1111
                    const b2 = 0x80 | ((code >> 6) & 0x3f); // 0x80 = 10000000, 0x3f = 111111
                    const b3 = 0x80 | (code & 0x3f);
                    arr.push(b1, b2, b3);
                }
                else if (code < 2097152) {
                    // Use 4 bytes for 21-bit value, bits per byte: 3, 6, 6, 6
                    const b1 = 0xf0 | ((code >> 18) & 0x7); // 0xf0 = 11110000, 0x7 = 111
                    const b2 = 0x80 | ((code >> 12) & 0x3f); // 0x80 = 10000000, 0x3f = 111111
                    const b3 = 0x80 | ((code >> 6) & 0x3f); // 0x80 = 10000000, 0x3f = 111111
                    const b4 = 0x80 | (code & 0x3f);
                    arr.push(b1, b2, b3, b4);
                }
                else {
                    throw new Error(`Cannot convert character ${str.charAt(i)} (code ${code}) to utf-8`);
                }
            }
            else {
                arr.push(code < 128 ? code : 63); // 63 = ?
            }
        }
        return new Uint8Array(arr);
    }
}
exports.encodeString = encodeString;
/**
 * Converts a utf-8 encoded buffer to string
 */
function decodeString(buffer) {
    if (typeof TextDecoder !== 'undefined') {
        // Modern browsers, Node.js v11.0.0+ (or v8.3.0+ with util.TextDecoder)
        const decoder = new TextDecoder();
        if (buffer instanceof Uint8Array) {
            return decoder.decode(buffer);
        }
        const buf = Uint8Array.from(buffer);
        return decoder.decode(buf);
    }
    else if (typeof Buffer === 'function') {
        // Node.js (v10 and below)
        if (buffer instanceof Array) {
            buffer = Uint8Array.from(buffer); // convert to typed array
        }
        if (!(buffer instanceof Buffer) && 'buffer' in buffer && buffer.buffer instanceof ArrayBuffer) {
            const typedArray = buffer;
            buffer = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength); // Convert typed array to node.js Buffer
        }
        if (!(buffer instanceof Buffer)) {
            throw new Error('Unsupported buffer argument');
        }
        return buffer.toString('utf-8');
    }
    else {
        // Older browsers. Manually decode!
        if (!(buffer instanceof Uint8Array) && 'buffer' in buffer && buffer['buffer'] instanceof ArrayBuffer) {
            // Convert TypedArray to Uint8Array
            const typedArray = buffer;
            buffer = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
        }
        if (buffer instanceof Buffer || buffer instanceof Array || buffer instanceof Uint8Array) {
            let str = '';
            for (let i = 0; i < buffer.length; i++) {
                let code = buffer[i];
                if (code > 128) {
                    // Decode Unicode character
                    if ((code & 0xf0) === 0xf0) {
                        // 4 byte char
                        const b1 = code, b2 = buffer[i + 1], b3 = buffer[i + 2], b4 = buffer[i + 3];
                        code = ((b1 & 0x7) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
                        i += 3;
                    }
                    else if ((code & 0xe0) === 0xe0) {
                        // 3 byte char
                        const b1 = code, b2 = buffer[i + 1], b3 = buffer[i + 2];
                        code = ((b1 & 0xf) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
                        i += 2;
                    }
                    else if ((code & 0xc0) === 0xc0) {
                        // 2 byte char
                        const b1 = code, b2 = buffer[i + 1];
                        code = ((b1 & 0x1f) << 6) | (b2 & 0x3f);
                        i++;
                    }
                    else {
                        throw new Error('invalid utf-8 data');
                    }
                }
                if (code >= 65536) {
                    // Split into 2-part utf-16 char codes
                    code ^= 0x10000;
                    const p1 = 0xd800 | (code >> 10);
                    const p2 = 0xdc00 | (code & 0x3ff);
                    str += String.fromCharCode(p1);
                    str += String.fromCharCode(p2);
                }
                else {
                    str += String.fromCharCode(code);
                }
            }
            return str;
        }
        else {
            throw new Error('Unsupported buffer argument');
        }
    }
}
exports.decodeString = decodeString;
function concatTypedArrays(a, b) {
    const c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
}
exports.concatTypedArrays = concatTypedArrays;
function cloneObject(original, stack) {
    var _a;
    if (((_a = original === null || original === void 0 ? void 0 : original.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'DataSnapshot') {
        throw new TypeError(`Object to clone is a DataSnapshot (path "${original.ref.path}")`);
    }
    const checkAndFixTypedArray = (obj) => {
        if (obj !== null && typeof obj === 'object'
            && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string'
            && ['Buffer', 'Uint8Array', 'Int8Array', 'Uint16Array', 'Int16Array', 'Uint32Array', 'Int32Array', 'BigUint64Array', 'BigInt64Array'].includes(obj.constructor.name)) {
            // FIX for typed array being converted to objects with numeric properties:
            // Convert Buffer or TypedArray to ArrayBuffer
            obj = obj.buffer.slice(obj.byteOffset, obj.byteOffset + obj.byteLength);
        }
        return obj;
    };
    original = checkAndFixTypedArray(original);
    if (typeof original !== 'object' || original === null || original instanceof Date || original instanceof ArrayBuffer || original instanceof path_reference_1.PathReference || original instanceof RegExp) {
        return original;
    }
    const cloneValue = (val) => {
        if (stack.indexOf(val) >= 0) {
            throw new ReferenceError('object contains a circular reference');
        }
        val = checkAndFixTypedArray(val);
        if (val === null || val instanceof Date || val instanceof ArrayBuffer || val instanceof path_reference_1.PathReference || val instanceof RegExp) { // || val instanceof ID
            return val;
        }
        else if (typeof val === 'object') {
            stack.push(val);
            val = cloneObject(val, stack);
            stack.pop();
            return val;
        }
        else {
            return val; // Anything other can just be copied
        }
    };
    if (typeof stack === 'undefined') {
        stack = [original];
    }
    const clone = original instanceof Array ? [] : original instanceof partial_array_1.PartialArray ? new partial_array_1.PartialArray() : {};
    Object.keys(original).forEach(key => {
        const val = original[key];
        if (typeof val === 'function') {
            return; // skip functions
        }
        clone[key] = cloneValue(val);
    });
    return clone;
}
exports.cloneObject = cloneObject;
const isTypedArray = (val) => typeof val === 'object' && ['ArrayBuffer', 'Buffer', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Int8Array', 'Int16Array', 'Int32Array'].includes(val.constructor.name);
// CONSIDER: updating isTypedArray to: const isTypedArray = val => typeof val === 'object' && 'buffer' in val && 'byteOffset' in val && 'byteLength' in val;
function valuesAreEqual(val1, val2) {
    if (val1 === val2) {
        return true;
    }
    if (typeof val1 !== typeof val2) {
        return false;
    }
    if (typeof val1 === 'object' || typeof val2 === 'object') {
        if (val1 === null || val2 === null) {
            return false;
        }
        if (val1 instanceof path_reference_1.PathReference || val2 instanceof path_reference_1.PathReference) {
            return val1 instanceof path_reference_1.PathReference && val2 instanceof path_reference_1.PathReference && val1.path === val2.path;
        }
        if (val1 instanceof Date || val2 instanceof Date) {
            return val1 instanceof Date && val2 instanceof Date && val1.getTime() === val2.getTime();
        }
        if (val1 instanceof Array || val2 instanceof Array) {
            return val1 instanceof Array && val2 instanceof Array && val1.length === val2.length && val1.every((item, i) => valuesAreEqual(val1[i], val2[i]));
        }
        if (isTypedArray(val1) || isTypedArray(val2)) {
            if (!isTypedArray(val1) || !isTypedArray(val2) || val1.byteLength === val2.byteLength) {
                return false;
            }
            const typed1 = val1 instanceof ArrayBuffer ? new Uint8Array(val1) : new Uint8Array(val1.buffer, val1.byteOffset, val1.byteLength), typed2 = val2 instanceof ArrayBuffer ? new Uint8Array(val2) : new Uint8Array(val2.buffer, val2.byteOffset, val2.byteLength);
            return typed1.every((val, i) => typed2[i] === val);
        }
        const keys1 = Object.keys(val1), keys2 = Object.keys(val2);
        return keys1.length === keys2.length && keys1.every(key => keys2.includes(key)) && keys1.every(key => valuesAreEqual(val1[key], val2[key]));
    }
    return false;
}
exports.valuesAreEqual = valuesAreEqual;
class ObjectDifferences {
    constructor(added, removed, changed) {
        this.added = added;
        this.removed = removed;
        this.changed = changed;
    }
    forChild(key) {
        if (this.added.includes(key)) {
            return 'added';
        }
        if (this.removed.includes(key)) {
            return 'removed';
        }
        const changed = this.changed.find(ch => ch.key === key);
        return changed ? changed.change : 'identical';
    }
}
exports.ObjectDifferences = ObjectDifferences;
function compareValues(oldVal, newVal, sortedResults = false) {
    const voids = [undefined, null];
    if (oldVal === newVal) {
        return 'identical';
    }
    else if (voids.indexOf(oldVal) >= 0 && voids.indexOf(newVal) < 0) {
        return 'added';
    }
    else if (voids.indexOf(oldVal) < 0 && voids.indexOf(newVal) >= 0) {
        return 'removed';
    }
    else if (typeof oldVal !== typeof newVal) {
        return 'changed';
    }
    else if (isTypedArray(oldVal) || isTypedArray(newVal)) {
        // One or both values are typed arrays.
        if (!isTypedArray(oldVal) || !isTypedArray(newVal)) {
            return 'changed';
        }
        // Both are typed. Compare lengths and byte content of typed arrays
        const typed1 = oldVal instanceof Uint8Array ? oldVal : oldVal instanceof ArrayBuffer ? new Uint8Array(oldVal) : new Uint8Array(oldVal.buffer, oldVal.byteOffset, oldVal.byteLength);
        const typed2 = newVal instanceof Uint8Array ? newVal : newVal instanceof ArrayBuffer ? new Uint8Array(newVal) : new Uint8Array(newVal.buffer, newVal.byteOffset, newVal.byteLength);
        return typed1.byteLength === typed2.byteLength && typed1.every((val, i) => typed2[i] === val) ? 'identical' : 'changed';
    }
    else if (oldVal instanceof Date || newVal instanceof Date) {
        return oldVal instanceof Date && newVal instanceof Date && oldVal.getTime() === newVal.getTime() ? 'identical' : 'changed';
    }
    else if (oldVal instanceof path_reference_1.PathReference || newVal instanceof path_reference_1.PathReference) {
        return oldVal instanceof path_reference_1.PathReference && newVal instanceof path_reference_1.PathReference && oldVal.path === newVal.path ? 'identical' : 'changed';
    }
    else if (typeof oldVal === 'object') {
        // Do key-by-key comparison of objects
        const isArray = oldVal instanceof Array;
        const getKeys = (obj) => {
            let keys = Object.keys(obj).filter(key => !voids.includes(obj[key]));
            if (isArray) {
                keys = keys.map((v) => parseInt(v));
            }
            return keys;
        };
        const oldKeys = getKeys(oldVal);
        const newKeys = getKeys(newVal);
        const removedKeys = oldKeys.filter(key => !newKeys.includes(key));
        const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
        const changedKeys = newKeys.reduce((changed, key) => {
            if (oldKeys.includes(key)) {
                const val1 = oldVal[key];
                const val2 = newVal[key];
                const c = compareValues(val1, val2);
                if (c !== 'identical') {
                    changed.push({ key, change: c });
                }
            }
            return changed;
        }, []);
        if (addedKeys.length === 0 && removedKeys.length === 0 && changedKeys.length === 0) {
            return 'identical';
        }
        else {
            return new ObjectDifferences(addedKeys, removedKeys, sortedResults ? changedKeys.sort((a, b) => a.key < b.key ? -1 : 1) : changedKeys);
        }
    }
    return 'changed';
}
exports.compareValues = compareValues;
function getMutations(oldVal, newVal, sortedResults = false) {
    const process = (target, compareResult, prev, val) => {
        switch (compareResult) {
            case 'identical': return [];
            case 'changed': return [{ target, prev, val }];
            case 'added': return [{ target, prev: null, val }];
            case 'removed': return [{ target, prev, val: null }];
            default: {
                let changes = [];
                compareResult.added.forEach(key => changes.push({ target: target.concat(key), prev: null, val: val[key] }));
                compareResult.removed.forEach(key => changes.push({ target: target.concat(key), prev: prev[key], val: null }));
                compareResult.changed.forEach(item => {
                    const childChanges = process(target.concat(item.key), item.change, prev[item.key], val[item.key]);
                    changes = changes.concat(childChanges);
                });
                return changes;
            }
        }
    };
    const compareResult = compareValues(oldVal, newVal, sortedResults);
    return process([], compareResult, oldVal, newVal);
}
exports.getMutations = getMutations;
function getChildValues(childKey, oldValue, newValue) {
    oldValue = oldValue === null ? null : oldValue[childKey];
    if (typeof oldValue === 'undefined') {
        oldValue = null;
    }
    newValue = newValue === null ? null : newValue[childKey];
    if (typeof newValue === 'undefined') {
        newValue = null;
    }
    return { oldValue, newValue };
}
exports.getChildValues = getChildValues;
function defer(fn) {
    process_1.default.nextTick(fn);
}
exports.defer = defer;
function getGlobalObject() {
    var _a;
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof self !== 'undefined') {
        return self;
    }
    return (_a = (function () { return this; }())) !== null && _a !== void 0 ? _a : Function('return this')();
}
exports.getGlobalObject = getGlobalObject;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./partial-array":28,"./path-reference":30,"./process":31,"buffer":40}],40:[function(require,module,exports){

},{}],41:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * Socket.IO v2.5.0
 * (c) 2014-2021 Guillermo Rauch
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.io=e():t.io=e()}(this,function(){return function(t){function e(n){if(r[n])return r[n].exports;var o=r[n]={exports:{},id:n,loaded:!1};return t[n].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){"use strict";function n(t,e){"object"===("undefined"==typeof t?"undefined":o(t))&&(e=t,t=void 0),e=e||{};var r,n=i(t),s=n.source,p=n.id,h=n.path,u=c[p]&&h in c[p].nsps,f=e.forceNew||e["force new connection"]||!1===e.multiplex||u;return f?r=a(s,e):(c[p]||(c[p]=a(s,e)),r=c[p]),n.query&&!e.query&&(e.query=n.query),r.socket(n.path,e)}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=r(1),s=r(4),a=r(9);r(3)("socket.io-client");t.exports=e=n;var c=e.managers={};e.protocol=s.protocol,e.connect=n,e.Manager=r(9),e.Socket=r(34)},function(t,e,r){"use strict";function n(t,e){var r=t;e=e||"undefined"!=typeof location&&location,null==t&&(t=e.protocol+"//"+e.host),"string"==typeof t&&("/"===t.charAt(0)&&(t="/"===t.charAt(1)?e.protocol+t:e.host+t),/^(https?|wss?):\/\//.test(t)||(t="undefined"!=typeof e?e.protocol+"//"+t:"https://"+t),r=o(t)),r.port||(/^(http|ws)$/.test(r.protocol)?r.port="80":/^(http|ws)s$/.test(r.protocol)&&(r.port="443")),r.path=r.path||"/";var n=r.host.indexOf(":")!==-1,i=n?"["+r.host+"]":r.host;return r.id=r.protocol+"://"+i+":"+r.port,r.href=r.protocol+"://"+i+(e&&e.port===r.port?"":":"+r.port),r}var o=r(2);r(3)("socket.io-client:url");t.exports=n},function(t,e){function r(t,e){var r=/\/{2,9}/g,n=e.replace(r,"/").split("/");return"/"!=e.substr(0,1)&&0!==e.length||n.splice(0,1),"/"==e.substr(e.length-1,1)&&n.splice(n.length-1,1),n}function n(t,e){var r={};return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(t,e,n){e&&(r[e]=n)}),r}var o=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,i=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];t.exports=function(t){var e=t,s=t.indexOf("["),a=t.indexOf("]");s!=-1&&a!=-1&&(t=t.substring(0,s)+t.substring(s,a).replace(/:/g,";")+t.substring(a,t.length));for(var c=o.exec(t||""),p={},h=14;h--;)p[i[h]]=c[h]||"";return s!=-1&&a!=-1&&(p.source=e,p.host=p.host.substring(1,p.host.length-1).replace(/;/g,":"),p.authority=p.authority.replace("[","").replace("]","").replace(/;/g,":"),p.ipv6uri=!0),p.pathNames=r(p,p.path),p.queryKey=n(p,p.query),p}},function(t,e){"use strict";t.exports=function(){return function(){}}},function(t,e,r){function n(){}function o(t){var r=""+t.type;if(e.BINARY_EVENT!==t.type&&e.BINARY_ACK!==t.type||(r+=t.attachments+"-"),t.nsp&&"/"!==t.nsp&&(r+=t.nsp+","),null!=t.id&&(r+=t.id),null!=t.data){var n=i(t.data);if(n===!1)return m;r+=n}return r}function i(t){try{return JSON.stringify(t)}catch(t){return!1}}function s(t,e){function r(t){var r=l.deconstructPacket(t),n=o(r.packet),i=r.buffers;i.unshift(n),e(i)}l.removeBlobs(t,r)}function a(){this.reconstructor=null}function c(t){var r=0,n={type:Number(t.charAt(0))};if(null==e.types[n.type])return u("unknown packet type "+n.type);if(e.BINARY_EVENT===n.type||e.BINARY_ACK===n.type){for(var o="";"-"!==t.charAt(++r)&&(o+=t.charAt(r),r!=t.length););if(o!=Number(o)||"-"!==t.charAt(r))throw new Error("Illegal attachments");n.attachments=Number(o)}if("/"===t.charAt(r+1))for(n.nsp="";++r;){var i=t.charAt(r);if(","===i)break;if(n.nsp+=i,r===t.length)break}else n.nsp="/";var s=t.charAt(r+1);if(""!==s&&Number(s)==s){for(n.id="";++r;){var i=t.charAt(r);if(null==i||Number(i)!=i){--r;break}if(n.id+=t.charAt(r),r===t.length)break}n.id=Number(n.id)}if(t.charAt(++r)){var a=p(t.substr(r)),c=a!==!1&&(n.type===e.ERROR||d(a));if(!c)return u("invalid payload");n.data=a}return n}function p(t){try{return JSON.parse(t)}catch(t){return!1}}function h(t){this.reconPack=t,this.buffers=[]}function u(t){return{type:e.ERROR,data:"parser error: "+t}}var f=(r(3)("socket.io-parser"),r(5)),l=r(6),d=r(7),y=r(8);e.protocol=4,e.types=["CONNECT","DISCONNECT","EVENT","ACK","ERROR","BINARY_EVENT","BINARY_ACK"],e.CONNECT=0,e.DISCONNECT=1,e.EVENT=2,e.ACK=3,e.ERROR=4,e.BINARY_EVENT=5,e.BINARY_ACK=6,e.Encoder=n,e.Decoder=a;var m=e.ERROR+'"encode error"';n.prototype.encode=function(t,r){if(e.BINARY_EVENT===t.type||e.BINARY_ACK===t.type)s(t,r);else{var n=o(t);r([n])}},f(a.prototype),a.prototype.add=function(t){var r;if("string"==typeof t)r=c(t),e.BINARY_EVENT===r.type||e.BINARY_ACK===r.type?(this.reconstructor=new h(r),0===this.reconstructor.reconPack.attachments&&this.emit("decoded",r)):this.emit("decoded",r);else{if(!y(t)&&!t.base64)throw new Error("Unknown type: "+t);if(!this.reconstructor)throw new Error("got binary data when not reconstructing a packet");r=this.reconstructor.takeBinaryData(t),r&&(this.reconstructor=null,this.emit("decoded",r))}},a.prototype.destroy=function(){this.reconstructor&&this.reconstructor.finishedReconstruction()},h.prototype.takeBinaryData=function(t){if(this.buffers.push(t),this.buffers.length===this.reconPack.attachments){var e=l.reconstructPacket(this.reconPack,this.buffers);return this.finishedReconstruction(),e}return null},h.prototype.finishedReconstruction=function(){this.reconPack=null,this.buffers=[]}},function(t,e,r){function n(t){if(t)return o(t)}function o(t){for(var e in n.prototype)t[e]=n.prototype[e];return t}t.exports=n,n.prototype.on=n.prototype.addEventListener=function(t,e){return this._callbacks=this._callbacks||{},(this._callbacks["$"+t]=this._callbacks["$"+t]||[]).push(e),this},n.prototype.once=function(t,e){function r(){this.off(t,r),e.apply(this,arguments)}return r.fn=e,this.on(t,r),this},n.prototype.off=n.prototype.removeListener=n.prototype.removeAllListeners=n.prototype.removeEventListener=function(t,e){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var r=this._callbacks["$"+t];if(!r)return this;if(1==arguments.length)return delete this._callbacks["$"+t],this;for(var n,o=0;o<r.length;o++)if(n=r[o],n===e||n.fn===e){r.splice(o,1);break}return 0===r.length&&delete this._callbacks["$"+t],this},n.prototype.emit=function(t){this._callbacks=this._callbacks||{};for(var e=new Array(arguments.length-1),r=this._callbacks["$"+t],n=1;n<arguments.length;n++)e[n-1]=arguments[n];if(r){r=r.slice(0);for(var n=0,o=r.length;n<o;++n)r[n].apply(this,e)}return this},n.prototype.listeners=function(t){return this._callbacks=this._callbacks||{},this._callbacks["$"+t]||[]},n.prototype.hasListeners=function(t){return!!this.listeners(t).length}},function(t,e,r){function n(t,e){if(!t)return t;if(s(t)){var r={_placeholder:!0,num:e.length};return e.push(t),r}if(i(t)){for(var o=new Array(t.length),a=0;a<t.length;a++)o[a]=n(t[a],e);return o}if("object"==typeof t&&!(t instanceof Date)){var o={};for(var c in t)o[c]=n(t[c],e);return o}return t}function o(t,e){if(!t)return t;if(t&&t._placeholder)return e[t.num];if(i(t))for(var r=0;r<t.length;r++)t[r]=o(t[r],e);else if("object"==typeof t)for(var n in t)t[n]=o(t[n],e);return t}var i=r(7),s=r(8),a=Object.prototype.toString,c="function"==typeof Blob||"undefined"!=typeof Blob&&"[object BlobConstructor]"===a.call(Blob),p="function"==typeof File||"undefined"!=typeof File&&"[object FileConstructor]"===a.call(File);e.deconstructPacket=function(t){var e=[],r=t.data,o=t;return o.data=n(r,e),o.attachments=e.length,{packet:o,buffers:e}},e.reconstructPacket=function(t,e){return t.data=o(t.data,e),t.attachments=void 0,t},e.removeBlobs=function(t,e){function r(t,a,h){if(!t)return t;if(c&&t instanceof Blob||p&&t instanceof File){n++;var u=new FileReader;u.onload=function(){h?h[a]=this.result:o=this.result,--n||e(o)},u.readAsArrayBuffer(t)}else if(i(t))for(var f=0;f<t.length;f++)r(t[f],f,t);else if("object"==typeof t&&!s(t))for(var l in t)r(t[l],l,t)}var n=0,o=t;r(o),n||e(o)}},function(t,e){var r={}.toString;t.exports=Array.isArray||function(t){return"[object Array]"==r.call(t)}},function(t,e){function r(t){return n&&Buffer.isBuffer(t)||o&&(t instanceof ArrayBuffer||i(t))}t.exports=r;var n="function"==typeof Buffer&&"function"==typeof Buffer.isBuffer,o="function"==typeof ArrayBuffer,i=function(t){return"function"==typeof ArrayBuffer.isView?ArrayBuffer.isView(t):t.buffer instanceof ArrayBuffer}},function(t,e,r){"use strict";function n(t,e){if(!(this instanceof n))return new n(t,e);t&&"object"===("undefined"==typeof t?"undefined":o(t))&&(e=t,t=void 0),e=e||{},e.path=e.path||"/socket.io",this.nsps={},this.subs=[],this.opts=e,this.reconnection(e.reconnection!==!1),this.reconnectionAttempts(e.reconnectionAttempts||1/0),this.reconnectionDelay(e.reconnectionDelay||1e3),this.reconnectionDelayMax(e.reconnectionDelayMax||5e3),this.randomizationFactor(e.randomizationFactor||.5),this.backoff=new f({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(null==e.timeout?2e4:e.timeout),this.readyState="closed",this.uri=t,this.connecting=[],this.lastPing=null,this.encoding=!1,this.packetBuffer=[];var r=e.parser||c;this.encoder=new r.Encoder,this.decoder=new r.Decoder,this.autoConnect=e.autoConnect!==!1,this.autoConnect&&this.open()}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=r(10),s=r(34),a=r(5),c=r(4),p=r(36),h=r(37),u=(r(3)("socket.io-client:manager"),r(33)),f=r(38),l=Object.prototype.hasOwnProperty;t.exports=n,n.prototype.emitAll=function(){this.emit.apply(this,arguments);for(var t in this.nsps)l.call(this.nsps,t)&&this.nsps[t].emit.apply(this.nsps[t],arguments)},n.prototype.updateSocketIds=function(){for(var t in this.nsps)l.call(this.nsps,t)&&(this.nsps[t].id=this.generateId(t))},n.prototype.generateId=function(t){return("/"===t?"":t+"#")+this.engine.id},a(n.prototype),n.prototype.reconnection=function(t){return arguments.length?(this._reconnection=!!t,this):this._reconnection},n.prototype.reconnectionAttempts=function(t){return arguments.length?(this._reconnectionAttempts=t,this):this._reconnectionAttempts},n.prototype.reconnectionDelay=function(t){return arguments.length?(this._reconnectionDelay=t,this.backoff&&this.backoff.setMin(t),this):this._reconnectionDelay},n.prototype.randomizationFactor=function(t){return arguments.length?(this._randomizationFactor=t,this.backoff&&this.backoff.setJitter(t),this):this._randomizationFactor},n.prototype.reconnectionDelayMax=function(t){return arguments.length?(this._reconnectionDelayMax=t,this.backoff&&this.backoff.setMax(t),this):this._reconnectionDelayMax},n.prototype.timeout=function(t){return arguments.length?(this._timeout=t,this):this._timeout},n.prototype.maybeReconnectOnOpen=function(){!this.reconnecting&&this._reconnection&&0===this.backoff.attempts&&this.reconnect()},n.prototype.open=n.prototype.connect=function(t,e){if(~this.readyState.indexOf("open"))return this;this.engine=i(this.uri,this.opts);var r=this.engine,n=this;this.readyState="opening",this.skipReconnect=!1;var o=p(r,"open",function(){n.onopen(),t&&t()}),s=p(r,"error",function(e){if(n.cleanup(),n.readyState="closed",n.emitAll("connect_error",e),t){var r=new Error("Connection error");r.data=e,t(r)}else n.maybeReconnectOnOpen()});if(!1!==this._timeout){var a=this._timeout;0===a&&o.destroy();var c=setTimeout(function(){o.destroy(),r.close(),r.emit("error","timeout"),n.emitAll("connect_timeout",a)},a);this.subs.push({destroy:function(){clearTimeout(c)}})}return this.subs.push(o),this.subs.push(s),this},n.prototype.onopen=function(){this.cleanup(),this.readyState="open",this.emit("open");var t=this.engine;this.subs.push(p(t,"data",h(this,"ondata"))),this.subs.push(p(t,"ping",h(this,"onping"))),this.subs.push(p(t,"pong",h(this,"onpong"))),this.subs.push(p(t,"error",h(this,"onerror"))),this.subs.push(p(t,"close",h(this,"onclose"))),this.subs.push(p(this.decoder,"decoded",h(this,"ondecoded")))},n.prototype.onping=function(){this.lastPing=new Date,this.emitAll("ping")},n.prototype.onpong=function(){this.emitAll("pong",new Date-this.lastPing)},n.prototype.ondata=function(t){this.decoder.add(t)},n.prototype.ondecoded=function(t){this.emit("packet",t)},n.prototype.onerror=function(t){this.emitAll("error",t)},n.prototype.socket=function(t,e){function r(){~u(o.connecting,n)||o.connecting.push(n)}var n=this.nsps[t];if(!n){n=new s(this,t,e),this.nsps[t]=n;var o=this;n.on("connecting",r),n.on("connect",function(){n.id=o.generateId(t)}),this.autoConnect&&r()}return n},n.prototype.destroy=function(t){var e=u(this.connecting,t);~e&&this.connecting.splice(e,1),this.connecting.length||this.close()},n.prototype.packet=function(t){var e=this;t.query&&0===t.type&&(t.nsp+="?"+t.query),e.encoding?e.packetBuffer.push(t):(e.encoding=!0,this.encoder.encode(t,function(r){for(var n=0;n<r.length;n++)e.engine.write(r[n],t.options);e.encoding=!1,e.processPacketQueue()}))},n.prototype.processPacketQueue=function(){if(this.packetBuffer.length>0&&!this.encoding){var t=this.packetBuffer.shift();this.packet(t)}},n.prototype.cleanup=function(){for(var t=this.subs.length,e=0;e<t;e++){var r=this.subs.shift();r.destroy()}this.packetBuffer=[],this.encoding=!1,this.lastPing=null,this.decoder.destroy()},n.prototype.close=n.prototype.disconnect=function(){this.skipReconnect=!0,this.reconnecting=!1,"opening"===this.readyState&&this.cleanup(),this.backoff.reset(),this.readyState="closed",this.engine&&this.engine.close()},n.prototype.onclose=function(t){this.cleanup(),this.backoff.reset(),this.readyState="closed",this.emit("close",t),this._reconnection&&!this.skipReconnect&&this.reconnect()},n.prototype.reconnect=function(){if(this.reconnecting||this.skipReconnect)return this;var t=this;if(this.backoff.attempts>=this._reconnectionAttempts)this.backoff.reset(),this.emitAll("reconnect_failed"),this.reconnecting=!1;else{var e=this.backoff.duration();this.reconnecting=!0;var r=setTimeout(function(){t.skipReconnect||(t.emitAll("reconnect_attempt",t.backoff.attempts),t.emitAll("reconnecting",t.backoff.attempts),t.skipReconnect||t.open(function(e){e?(t.reconnecting=!1,t.reconnect(),t.emitAll("reconnect_error",e.data)):t.onreconnect()}))},e);this.subs.push({destroy:function(){clearTimeout(r)}})}},n.prototype.onreconnect=function(){var t=this.backoff.attempts;this.reconnecting=!1,this.backoff.reset(),this.updateSocketIds(),this.emitAll("reconnect",t)}},function(t,e,r){t.exports=r(11),t.exports.parser=r(19)},function(t,e,r){function n(t,e){return this instanceof n?(e=e||{},t&&"object"==typeof t&&(e=t,t=null),t?(t=p(t),e.hostname=t.host,e.secure="https"===t.protocol||"wss"===t.protocol,e.port=t.port,t.query&&(e.query=t.query)):e.host&&(e.hostname=p(e.host).host),this.secure=null!=e.secure?e.secure:"undefined"!=typeof location&&"https:"===location.protocol,e.hostname&&!e.port&&(e.port=this.secure?"443":"80"),this.agent=e.agent||!1,this.hostname=e.hostname||("undefined"!=typeof location?location.hostname:"localhost"),this.port=e.port||("undefined"!=typeof location&&location.port?location.port:this.secure?443:80),this.query=e.query||{},"string"==typeof this.query&&(this.query=h.decode(this.query)),this.upgrade=!1!==e.upgrade,this.path=(e.path||"/engine.io").replace(/\/$/,"")+"/",this.forceJSONP=!!e.forceJSONP,this.jsonp=!1!==e.jsonp,this.forceBase64=!!e.forceBase64,this.enablesXDR=!!e.enablesXDR,this.withCredentials=!1!==e.withCredentials,this.timestampParam=e.timestampParam||"t",this.timestampRequests=e.timestampRequests,this.transports=e.transports||["polling","websocket"],this.transportOptions=e.transportOptions||{},this.readyState="",this.writeBuffer=[],this.prevBufferLen=0,this.policyPort=e.policyPort||843,this.rememberUpgrade=e.rememberUpgrade||!1,this.binaryType=null,this.onlyBinaryUpgrades=e.onlyBinaryUpgrades,this.perMessageDeflate=!1!==e.perMessageDeflate&&(e.perMessageDeflate||{}),!0===this.perMessageDeflate&&(this.perMessageDeflate={}),this.perMessageDeflate&&null==this.perMessageDeflate.threshold&&(this.perMessageDeflate.threshold=1024),this.pfx=e.pfx||null,this.key=e.key||null,this.passphrase=e.passphrase||null,this.cert=e.cert||null,this.ca=e.ca||null,this.ciphers=e.ciphers||null,this.rejectUnauthorized=void 0===e.rejectUnauthorized||e.rejectUnauthorized,this.forceNode=!!e.forceNode,this.isReactNative="undefined"!=typeof navigator&&"string"==typeof navigator.product&&"reactnative"===navigator.product.toLowerCase(),("undefined"==typeof self||this.isReactNative)&&(e.extraHeaders&&Object.keys(e.extraHeaders).length>0&&(this.extraHeaders=e.extraHeaders),e.localAddress&&(this.localAddress=e.localAddress)),this.id=null,this.upgrades=null,this.pingInterval=null,this.pingTimeout=null,this.pingIntervalTimer=null,this.pingTimeoutTimer=null,void this.open()):new n(t,e)}function o(t){var e={};for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);return e}var i=r(12),s=r(5),a=(r(3)("engine.io-client:socket"),r(33)),c=r(19),p=r(2),h=r(27);t.exports=n,n.priorWebsocketSuccess=!1,s(n.prototype),n.protocol=c.protocol,n.Socket=n,n.Transport=r(18),n.transports=r(12),n.parser=r(19),n.prototype.createTransport=function(t){var e=o(this.query);e.EIO=c.protocol,e.transport=t;var r=this.transportOptions[t]||{};this.id&&(e.sid=this.id);var n=new i[t]({query:e,socket:this,agent:r.agent||this.agent,hostname:r.hostname||this.hostname,port:r.port||this.port,secure:r.secure||this.secure,path:r.path||this.path,forceJSONP:r.forceJSONP||this.forceJSONP,jsonp:r.jsonp||this.jsonp,forceBase64:r.forceBase64||this.forceBase64,enablesXDR:r.enablesXDR||this.enablesXDR,withCredentials:r.withCredentials||this.withCredentials,timestampRequests:r.timestampRequests||this.timestampRequests,timestampParam:r.timestampParam||this.timestampParam,policyPort:r.policyPort||this.policyPort,pfx:r.pfx||this.pfx,key:r.key||this.key,passphrase:r.passphrase||this.passphrase,cert:r.cert||this.cert,ca:r.ca||this.ca,ciphers:r.ciphers||this.ciphers,rejectUnauthorized:r.rejectUnauthorized||this.rejectUnauthorized,perMessageDeflate:r.perMessageDeflate||this.perMessageDeflate,extraHeaders:r.extraHeaders||this.extraHeaders,forceNode:r.forceNode||this.forceNode,localAddress:r.localAddress||this.localAddress,requestTimeout:r.requestTimeout||this.requestTimeout,protocols:r.protocols||void 0,isReactNative:this.isReactNative});return n},n.prototype.open=function(){var t;if(this.rememberUpgrade&&n.priorWebsocketSuccess&&this.transports.indexOf("websocket")!==-1)t="websocket";else{if(0===this.transports.length){var e=this;return void setTimeout(function(){e.emit("error","No transports available")},0)}t=this.transports[0]}this.readyState="opening";try{t=this.createTransport(t)}catch(t){return this.transports.shift(),void this.open()}t.open(),this.setTransport(t)},n.prototype.setTransport=function(t){var e=this;this.transport&&this.transport.removeAllListeners(),this.transport=t,t.on("drain",function(){e.onDrain()}).on("packet",function(t){e.onPacket(t)}).on("error",function(t){e.onError(t)}).on("close",function(){e.onClose("transport close")})},n.prototype.probe=function(t){function e(){if(u.onlyBinaryUpgrades){var t=!this.supportsBinary&&u.transport.supportsBinary;h=h||t}h||(p.send([{type:"ping",data:"probe"}]),p.once("packet",function(t){if(!h)if("pong"===t.type&&"probe"===t.data){if(u.upgrading=!0,u.emit("upgrading",p),!p)return;n.priorWebsocketSuccess="websocket"===p.name,u.transport.pause(function(){h||"closed"!==u.readyState&&(c(),u.setTransport(p),p.send([{type:"upgrade"}]),u.emit("upgrade",p),p=null,u.upgrading=!1,u.flush())})}else{var e=new Error("probe error");e.transport=p.name,u.emit("upgradeError",e)}}))}function r(){h||(h=!0,c(),p.close(),p=null)}function o(t){var e=new Error("probe error: "+t);e.transport=p.name,r(),u.emit("upgradeError",e)}function i(){o("transport closed")}function s(){o("socket closed")}function a(t){p&&t.name!==p.name&&r()}function c(){p.removeListener("open",e),p.removeListener("error",o),p.removeListener("close",i),u.removeListener("close",s),u.removeListener("upgrading",a)}var p=this.createTransport(t,{probe:1}),h=!1,u=this;n.priorWebsocketSuccess=!1,p.once("open",e),p.once("error",o),p.once("close",i),this.once("close",s),this.once("upgrading",a),p.open()},n.prototype.onOpen=function(){if(this.readyState="open",n.priorWebsocketSuccess="websocket"===this.transport.name,this.emit("open"),this.flush(),"open"===this.readyState&&this.upgrade&&this.transport.pause)for(var t=0,e=this.upgrades.length;t<e;t++)this.probe(this.upgrades[t])},n.prototype.onPacket=function(t){if("opening"===this.readyState||"open"===this.readyState||"closing"===this.readyState)switch(this.emit("packet",t),this.emit("heartbeat"),t.type){case"open":this.onHandshake(JSON.parse(t.data));break;case"pong":this.setPing(),this.emit("pong");break;case"error":var e=new Error("server error");e.code=t.data,this.onError(e);break;case"message":this.emit("data",t.data),this.emit("message",t.data)}},n.prototype.onHandshake=function(t){this.emit("handshake",t),this.id=t.sid,this.transport.query.sid=t.sid,this.upgrades=this.filterUpgrades(t.upgrades),this.pingInterval=t.pingInterval,this.pingTimeout=t.pingTimeout,this.onOpen(),"closed"!==this.readyState&&(this.setPing(),this.removeListener("heartbeat",this.onHeartbeat),this.on("heartbeat",this.onHeartbeat))},n.prototype.onHeartbeat=function(t){clearTimeout(this.pingTimeoutTimer);var e=this;e.pingTimeoutTimer=setTimeout(function(){"closed"!==e.readyState&&e.onClose("ping timeout")},t||e.pingInterval+e.pingTimeout)},n.prototype.setPing=function(){var t=this;clearTimeout(t.pingIntervalTimer),t.pingIntervalTimer=setTimeout(function(){t.ping(),t.onHeartbeat(t.pingTimeout)},t.pingInterval)},n.prototype.ping=function(){var t=this;this.sendPacket("ping",function(){t.emit("ping")})},n.prototype.onDrain=function(){this.writeBuffer.splice(0,this.prevBufferLen),this.prevBufferLen=0,0===this.writeBuffer.length?this.emit("drain"):this.flush()},n.prototype.flush=function(){"closed"!==this.readyState&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length&&(this.transport.send(this.writeBuffer),this.prevBufferLen=this.writeBuffer.length,this.emit("flush"))},n.prototype.write=n.prototype.send=function(t,e,r){return this.sendPacket("message",t,e,r),this},n.prototype.sendPacket=function(t,e,r,n){if("function"==typeof e&&(n=e,e=void 0),"function"==typeof r&&(n=r,r=null),"closing"!==this.readyState&&"closed"!==this.readyState){r=r||{},r.compress=!1!==r.compress;var o={type:t,data:e,options:r};this.emit("packetCreate",o),this.writeBuffer.push(o),n&&this.once("flush",n),this.flush()}},n.prototype.close=function(){function t(){n.onClose("forced close"),n.transport.close()}function e(){n.removeListener("upgrade",e),n.removeListener("upgradeError",e),t()}function r(){n.once("upgrade",e),n.once("upgradeError",e)}if("opening"===this.readyState||"open"===this.readyState){this.readyState="closing";var n=this;this.writeBuffer.length?this.once("drain",function(){this.upgrading?r():t()}):this.upgrading?r():t()}return this},n.prototype.onError=function(t){n.priorWebsocketSuccess=!1,this.emit("error",t),this.onClose("transport error",t)},n.prototype.onClose=function(t,e){if("opening"===this.readyState||"open"===this.readyState||"closing"===this.readyState){var r=this;clearTimeout(this.pingIntervalTimer),clearTimeout(this.pingTimeoutTimer),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),this.readyState="closed",this.id=null,this.emit("close",t,e),r.writeBuffer=[],r.prevBufferLen=0}},n.prototype.filterUpgrades=function(t){for(var e=[],r=0,n=t.length;r<n;r++)~a(this.transports,t[r])&&e.push(t[r]);return e}},function(t,e,r){function n(t){var e,r=!1,n=!1,a=!1!==t.jsonp;if("undefined"!=typeof location){var c="https:"===location.protocol,p=location.port;p||(p=c?443:80),r=t.hostname!==location.hostname||p!==t.port,n=t.secure!==c}if(t.xdomain=r,t.xscheme=n,e=new o(t),"open"in e&&!t.forceJSONP)return new i(t);if(!a)throw new Error("JSONP disabled");return new s(t)}var o=r(13),i=r(16),s=r(30),a=r(31);e.polling=n,e.websocket=a},function(t,e,r){var n=r(14),o=r(15);t.exports=function(t){var e=t.xdomain,r=t.xscheme,i=t.enablesXDR;try{if("undefined"!=typeof XMLHttpRequest&&(!e||n))return new XMLHttpRequest}catch(t){}try{if("undefined"!=typeof XDomainRequest&&!r&&i)return new XDomainRequest}catch(t){}if(!e)try{return new(o[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")}catch(t){}}},function(t,e){try{t.exports="undefined"!=typeof XMLHttpRequest&&"withCredentials"in new XMLHttpRequest}catch(e){t.exports=!1}},function(t,e){t.exports=function(){return"undefined"!=typeof self?self:"undefined"!=typeof window?window:Function("return this")()}()},function(t,e,r){function n(){}function o(t){if(c.call(this,t),this.requestTimeout=t.requestTimeout,this.extraHeaders=t.extraHeaders,"undefined"!=typeof location){var e="https:"===location.protocol,r=location.port;r||(r=e?443:80),this.xd="undefined"!=typeof location&&t.hostname!==location.hostname||r!==t.port,this.xs=t.secure!==e}}function i(t){this.method=t.method||"GET",this.uri=t.uri,this.xd=!!t.xd,this.xs=!!t.xs,this.async=!1!==t.async,this.data=void 0!==t.data?t.data:null,this.agent=t.agent,this.isBinary=t.isBinary,this.supportsBinary=t.supportsBinary,this.enablesXDR=t.enablesXDR,this.withCredentials=t.withCredentials,this.requestTimeout=t.requestTimeout,this.pfx=t.pfx,this.key=t.key,this.passphrase=t.passphrase,this.cert=t.cert,this.ca=t.ca,this.ciphers=t.ciphers,this.rejectUnauthorized=t.rejectUnauthorized,this.extraHeaders=t.extraHeaders,this.create()}function s(){for(var t in i.requests)i.requests.hasOwnProperty(t)&&i.requests[t].abort()}var a=r(13),c=r(17),p=r(5),h=r(28),u=(r(3)("engine.io-client:polling-xhr"),r(15));if(t.exports=o,t.exports.Request=i,h(o,c),o.prototype.supportsBinary=!0,o.prototype.request=function(t){return t=t||{},t.uri=this.uri(),t.xd=this.xd,t.xs=this.xs,t.agent=this.agent||!1,t.supportsBinary=this.supportsBinary,t.enablesXDR=this.enablesXDR,t.withCredentials=this.withCredentials,t.pfx=this.pfx,t.key=this.key,t.passphrase=this.passphrase,t.cert=this.cert,t.ca=this.ca,t.ciphers=this.ciphers,t.rejectUnauthorized=this.rejectUnauthorized,t.requestTimeout=this.requestTimeout,t.extraHeaders=this.extraHeaders,new i(t)},o.prototype.doWrite=function(t,e){var r="string"!=typeof t&&void 0!==t,n=this.request({method:"POST",data:t,isBinary:r}),o=this;n.on("success",e),n.on("error",function(t){o.onError("xhr post error",t)}),this.sendXhr=n},o.prototype.doPoll=function(){var t=this.request(),e=this;t.on("data",function(t){e.onData(t)}),t.on("error",function(t){e.onError("xhr poll error",t)}),this.pollXhr=t},p(i.prototype),i.prototype.create=function(){var t={agent:this.agent,xdomain:this.xd,xscheme:this.xs,enablesXDR:this.enablesXDR};t.pfx=this.pfx,t.key=this.key,t.passphrase=this.passphrase,t.cert=this.cert,t.ca=this.ca,t.ciphers=this.ciphers,t.rejectUnauthorized=this.rejectUnauthorized;var e=this.xhr=new a(t),r=this;try{e.open(this.method,this.uri,this.async);try{if(this.extraHeaders){e.setDisableHeaderCheck&&e.setDisableHeaderCheck(!0);for(var n in this.extraHeaders)this.extraHeaders.hasOwnProperty(n)&&e.setRequestHeader(n,this.extraHeaders[n])}}catch(t){}if("POST"===this.method)try{this.isBinary?e.setRequestHeader("Content-type","application/octet-stream"):e.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch(t){}try{e.setRequestHeader("Accept","*/*")}catch(t){}"withCredentials"in e&&(e.withCredentials=this.withCredentials),this.requestTimeout&&(e.timeout=this.requestTimeout),this.hasXDR()?(e.onload=function(){r.onLoad()},e.onerror=function(){r.onError(e.responseText)}):e.onreadystatechange=function(){if(2===e.readyState)try{var t=e.getResponseHeader("Content-Type");(r.supportsBinary&&"application/octet-stream"===t||"application/octet-stream; charset=UTF-8"===t)&&(e.responseType="arraybuffer")}catch(t){}4===e.readyState&&(200===e.status||1223===e.status?r.onLoad():setTimeout(function(){r.onError("number"==typeof e.status?e.status:0)},0))},e.send(this.data)}catch(t){return void setTimeout(function(){r.onError(t)},0)}"undefined"!=typeof document&&(this.index=i.requestsCount++,i.requests[this.index]=this)},i.prototype.onSuccess=function(){this.emit("success"),this.cleanup()},i.prototype.onData=function(t){this.emit("data",t),this.onSuccess()},i.prototype.onError=function(t){this.emit("error",t),this.cleanup(!0)},i.prototype.cleanup=function(t){if("undefined"!=typeof this.xhr&&null!==this.xhr){if(this.hasXDR()?this.xhr.onload=this.xhr.onerror=n:this.xhr.onreadystatechange=n,t)try{this.xhr.abort()}catch(t){}"undefined"!=typeof document&&delete i.requests[this.index],this.xhr=null}},i.prototype.onLoad=function(){var t;try{var e;try{e=this.xhr.getResponseHeader("Content-Type")}catch(t){}t="application/octet-stream"===e||"application/octet-stream; charset=UTF-8"===e?this.xhr.response||this.xhr.responseText:this.xhr.responseText}catch(t){this.onError(t)}null!=t&&this.onData(t)},i.prototype.hasXDR=function(){return"undefined"!=typeof XDomainRequest&&!this.xs&&this.enablesXDR},i.prototype.abort=function(){this.cleanup()},i.requestsCount=0,i.requests={},"undefined"!=typeof document)if("function"==typeof attachEvent)attachEvent("onunload",s);else if("function"==typeof addEventListener){var f="onpagehide"in u?"pagehide":"unload";addEventListener(f,s,!1)}},function(t,e,r){function n(t){var e=t&&t.forceBase64;p&&!e||(this.supportsBinary=!1),o.call(this,t)}var o=r(18),i=r(27),s=r(19),a=r(28),c=r(29);r(3)("engine.io-client:polling");t.exports=n;var p=function(){var t=r(13),e=new t({xdomain:!1});return null!=e.responseType}();a(n,o),n.prototype.name="polling",n.prototype.doOpen=function(){this.poll()},n.prototype.pause=function(t){function e(){r.readyState="paused",t()}var r=this;if(this.readyState="pausing",this.polling||!this.writable){var n=0;this.polling&&(n++,this.once("pollComplete",function(){--n||e()})),this.writable||(n++,this.once("drain",function(){--n||e()}))}else e()},n.prototype.poll=function(){this.polling=!0,this.doPoll(),this.emit("poll")},n.prototype.onData=function(t){var e=this,r=function(t,r,n){return"opening"===e.readyState&&"open"===t.type&&e.onOpen(),"close"===t.type?(e.onClose(),!1):void e.onPacket(t)};s.decodePayload(t,this.socket.binaryType,r),"closed"!==this.readyState&&(this.polling=!1,this.emit("pollComplete"),"open"===this.readyState&&this.poll())},n.prototype.doClose=function(){function t(){e.write([{type:"close"}])}var e=this;"open"===this.readyState?t():this.once("open",t)},n.prototype.write=function(t){var e=this;this.writable=!1;var r=function(){e.writable=!0,e.emit("drain")};s.encodePayload(t,this.supportsBinary,function(t){e.doWrite(t,r)})},n.prototype.uri=function(){var t=this.query||{},e=this.secure?"https":"http",r="";!1!==this.timestampRequests&&(t[this.timestampParam]=c()),this.supportsBinary||t.sid||(t.b64=1),t=i.encode(t),this.port&&("https"===e&&443!==Number(this.port)||"http"===e&&80!==Number(this.port))&&(r=":"+this.port),t.length&&(t="?"+t);var n=this.hostname.indexOf(":")!==-1;return e+"://"+(n?"["+this.hostname+"]":this.hostname)+r+this.path+t}},function(t,e,r){function n(t){this.path=t.path,this.hostname=t.hostname,this.port=t.port,this.secure=t.secure,this.query=t.query,this.timestampParam=t.timestampParam,this.timestampRequests=t.timestampRequests,this.readyState="",this.agent=t.agent||!1,this.socket=t.socket,this.enablesXDR=t.enablesXDR,this.withCredentials=t.withCredentials,this.pfx=t.pfx,this.key=t.key,this.passphrase=t.passphrase,this.cert=t.cert,this.ca=t.ca,this.ciphers=t.ciphers,this.rejectUnauthorized=t.rejectUnauthorized,this.forceNode=t.forceNode,
this.isReactNative=t.isReactNative,this.extraHeaders=t.extraHeaders,this.localAddress=t.localAddress}var o=r(19),i=r(5);t.exports=n,i(n.prototype),n.prototype.onError=function(t,e){var r=new Error(t);return r.type="TransportError",r.description=e,this.emit("error",r),this},n.prototype.open=function(){return"closed"!==this.readyState&&""!==this.readyState||(this.readyState="opening",this.doOpen()),this},n.prototype.close=function(){return"opening"!==this.readyState&&"open"!==this.readyState||(this.doClose(),this.onClose()),this},n.prototype.send=function(t){if("open"!==this.readyState)throw new Error("Transport not open");this.write(t)},n.prototype.onOpen=function(){this.readyState="open",this.writable=!0,this.emit("open")},n.prototype.onData=function(t){var e=o.decodePacket(t,this.socket.binaryType);this.onPacket(e)},n.prototype.onPacket=function(t){this.emit("packet",t)},n.prototype.onClose=function(){this.readyState="closed",this.emit("close")}},function(t,e,r){function n(t,r){var n="b"+e.packets[t.type]+t.data.data;return r(n)}function o(t,r,n){if(!r)return e.encodeBase64Packet(t,n);var o=t.data,i=new Uint8Array(o),s=new Uint8Array(1+o.byteLength);s[0]=v[t.type];for(var a=0;a<i.length;a++)s[a+1]=i[a];return n(s.buffer)}function i(t,r,n){if(!r)return e.encodeBase64Packet(t,n);var o=new FileReader;return o.onload=function(){e.encodePacket({type:t.type,data:o.result},r,!0,n)},o.readAsArrayBuffer(t.data)}function s(t,r,n){if(!r)return e.encodeBase64Packet(t,n);if(g)return i(t,r,n);var o=new Uint8Array(1);o[0]=v[t.type];var s=new w([o.buffer,t.data]);return n(s)}function a(t){try{t=d.decode(t,{strict:!1})}catch(t){return!1}return t}function c(t,e,r){for(var n=new Array(t.length),o=l(t.length,r),i=function(t,r,o){e(r,function(e,r){n[t]=r,o(e,n)})},s=0;s<t.length;s++)i(s,t[s],o)}var p,h=r(20),u=r(21),f=r(22),l=r(23),d=r(24);"undefined"!=typeof ArrayBuffer&&(p=r(25));var y="undefined"!=typeof navigator&&/Android/i.test(navigator.userAgent),m="undefined"!=typeof navigator&&/PhantomJS/i.test(navigator.userAgent),g=y||m;e.protocol=3;var v=e.packets={open:0,close:1,ping:2,pong:3,message:4,upgrade:5,noop:6},b=h(v),k={type:"error",data:"parser error"},w=r(26);e.encodePacket=function(t,e,r,i){"function"==typeof e&&(i=e,e=!1),"function"==typeof r&&(i=r,r=null);var a=void 0===t.data?void 0:t.data.buffer||t.data;if("undefined"!=typeof ArrayBuffer&&a instanceof ArrayBuffer)return o(t,e,i);if("undefined"!=typeof w&&a instanceof w)return s(t,e,i);if(a&&a.base64)return n(t,i);var c=v[t.type];return void 0!==t.data&&(c+=r?d.encode(String(t.data),{strict:!1}):String(t.data)),i(""+c)},e.encodeBase64Packet=function(t,r){var n="b"+e.packets[t.type];if("undefined"!=typeof w&&t.data instanceof w){var o=new FileReader;return o.onload=function(){var t=o.result.split(",")[1];r(n+t)},o.readAsDataURL(t.data)}var i;try{i=String.fromCharCode.apply(null,new Uint8Array(t.data))}catch(e){for(var s=new Uint8Array(t.data),a=new Array(s.length),c=0;c<s.length;c++)a[c]=s[c];i=String.fromCharCode.apply(null,a)}return n+=btoa(i),r(n)},e.decodePacket=function(t,r,n){if(void 0===t)return k;if("string"==typeof t){if("b"===t.charAt(0))return e.decodeBase64Packet(t.substr(1),r);if(n&&(t=a(t),t===!1))return k;var o=t.charAt(0);return Number(o)==o&&b[o]?t.length>1?{type:b[o],data:t.substring(1)}:{type:b[o]}:k}var i=new Uint8Array(t),o=i[0],s=f(t,1);return w&&"blob"===r&&(s=new w([s])),{type:b[o],data:s}},e.decodeBase64Packet=function(t,e){var r=b[t.charAt(0)];if(!p)return{type:r,data:{base64:!0,data:t.substr(1)}};var n=p.decode(t.substr(1));return"blob"===e&&w&&(n=new w([n])),{type:r,data:n}},e.encodePayload=function(t,r,n){function o(t){return t.length+":"+t}function i(t,n){e.encodePacket(t,!!s&&r,!1,function(t){n(null,o(t))})}"function"==typeof r&&(n=r,r=null);var s=u(t);return r&&s?w&&!g?e.encodePayloadAsBlob(t,n):e.encodePayloadAsArrayBuffer(t,n):t.length?void c(t,i,function(t,e){return n(e.join(""))}):n("0:")},e.decodePayload=function(t,r,n){if("string"!=typeof t)return e.decodePayloadAsBinary(t,r,n);"function"==typeof r&&(n=r,r=null);var o;if(""===t)return n(k,0,1);for(var i,s,a="",c=0,p=t.length;c<p;c++){var h=t.charAt(c);if(":"===h){if(""===a||a!=(i=Number(a)))return n(k,0,1);if(s=t.substr(c+1,i),a!=s.length)return n(k,0,1);if(s.length){if(o=e.decodePacket(s,r,!1),k.type===o.type&&k.data===o.data)return n(k,0,1);var u=n(o,c+i,p);if(!1===u)return}c+=i,a=""}else a+=h}return""!==a?n(k,0,1):void 0},e.encodePayloadAsArrayBuffer=function(t,r){function n(t,r){e.encodePacket(t,!0,!0,function(t){return r(null,t)})}return t.length?void c(t,n,function(t,e){var n=e.reduce(function(t,e){var r;return r="string"==typeof e?e.length:e.byteLength,t+r.toString().length+r+2},0),o=new Uint8Array(n),i=0;return e.forEach(function(t){var e="string"==typeof t,r=t;if(e){for(var n=new Uint8Array(t.length),s=0;s<t.length;s++)n[s]=t.charCodeAt(s);r=n.buffer}e?o[i++]=0:o[i++]=1;for(var a=r.byteLength.toString(),s=0;s<a.length;s++)o[i++]=parseInt(a[s]);o[i++]=255;for(var n=new Uint8Array(r),s=0;s<n.length;s++)o[i++]=n[s]}),r(o.buffer)}):r(new ArrayBuffer(0))},e.encodePayloadAsBlob=function(t,r){function n(t,r){e.encodePacket(t,!0,!0,function(t){var e=new Uint8Array(1);if(e[0]=1,"string"==typeof t){for(var n=new Uint8Array(t.length),o=0;o<t.length;o++)n[o]=t.charCodeAt(o);t=n.buffer,e[0]=0}for(var i=t instanceof ArrayBuffer?t.byteLength:t.size,s=i.toString(),a=new Uint8Array(s.length+1),o=0;o<s.length;o++)a[o]=parseInt(s[o]);if(a[s.length]=255,w){var c=new w([e.buffer,a.buffer,t]);r(null,c)}})}c(t,n,function(t,e){return r(new w(e))})},e.decodePayloadAsBinary=function(t,r,n){"function"==typeof r&&(n=r,r=null);for(var o=t,i=[];o.byteLength>0;){for(var s=new Uint8Array(o),a=0===s[0],c="",p=1;255!==s[p];p++){if(c.length>310)return n(k,0,1);c+=s[p]}o=f(o,2+c.length),c=parseInt(c);var h=f(o,0,c);if(a)try{h=String.fromCharCode.apply(null,new Uint8Array(h))}catch(t){var u=new Uint8Array(h);h="";for(var p=0;p<u.length;p++)h+=String.fromCharCode(u[p])}i.push(h),o=f(o,c)}var l=i.length;i.forEach(function(t,o){n(e.decodePacket(t,r,!0),o,l)})}},function(t,e){t.exports=Object.keys||function(t){var e=[],r=Object.prototype.hasOwnProperty;for(var n in t)r.call(t,n)&&e.push(n);return e}},function(t,e,r){function n(t){if(!t||"object"!=typeof t)return!1;if(o(t)){for(var e=0,r=t.length;e<r;e++)if(n(t[e]))return!0;return!1}if("function"==typeof Buffer&&Buffer.isBuffer&&Buffer.isBuffer(t)||"function"==typeof ArrayBuffer&&t instanceof ArrayBuffer||s&&t instanceof Blob||a&&t instanceof File)return!0;if(t.toJSON&&"function"==typeof t.toJSON&&1===arguments.length)return n(t.toJSON(),!0);for(var i in t)if(Object.prototype.hasOwnProperty.call(t,i)&&n(t[i]))return!0;return!1}var o=r(7),i=Object.prototype.toString,s="function"==typeof Blob||"undefined"!=typeof Blob&&"[object BlobConstructor]"===i.call(Blob),a="function"==typeof File||"undefined"!=typeof File&&"[object FileConstructor]"===i.call(File);t.exports=n},function(t,e){t.exports=function(t,e,r){var n=t.byteLength;if(e=e||0,r=r||n,t.slice)return t.slice(e,r);if(e<0&&(e+=n),r<0&&(r+=n),r>n&&(r=n),e>=n||e>=r||0===n)return new ArrayBuffer(0);for(var o=new Uint8Array(t),i=new Uint8Array(r-e),s=e,a=0;s<r;s++,a++)i[a]=o[s];return i.buffer}},function(t,e){function r(t,e,r){function o(t,n){if(o.count<=0)throw new Error("after called too many times");--o.count,t?(i=!0,e(t),e=r):0!==o.count||i||e(null,n)}var i=!1;return r=r||n,o.count=t,0===t?e():o}function n(){}t.exports=r},function(t,e){function r(t){for(var e,r,n=[],o=0,i=t.length;o<i;)e=t.charCodeAt(o++),e>=55296&&e<=56319&&o<i?(r=t.charCodeAt(o++),56320==(64512&r)?n.push(((1023&e)<<10)+(1023&r)+65536):(n.push(e),o--)):n.push(e);return n}function n(t){for(var e,r=t.length,n=-1,o="";++n<r;)e=t[n],e>65535&&(e-=65536,o+=d(e>>>10&1023|55296),e=56320|1023&e),o+=d(e);return o}function o(t,e){if(t>=55296&&t<=57343){if(e)throw Error("Lone surrogate U+"+t.toString(16).toUpperCase()+" is not a scalar value");return!1}return!0}function i(t,e){return d(t>>e&63|128)}function s(t,e){if(0==(4294967168&t))return d(t);var r="";return 0==(4294965248&t)?r=d(t>>6&31|192):0==(4294901760&t)?(o(t,e)||(t=65533),r=d(t>>12&15|224),r+=i(t,6)):0==(4292870144&t)&&(r=d(t>>18&7|240),r+=i(t,12),r+=i(t,6)),r+=d(63&t|128)}function a(t,e){e=e||{};for(var n,o=!1!==e.strict,i=r(t),a=i.length,c=-1,p="";++c<a;)n=i[c],p+=s(n,o);return p}function c(){if(l>=f)throw Error("Invalid byte index");var t=255&u[l];if(l++,128==(192&t))return 63&t;throw Error("Invalid continuation byte")}function p(t){var e,r,n,i,s;if(l>f)throw Error("Invalid byte index");if(l==f)return!1;if(e=255&u[l],l++,0==(128&e))return e;if(192==(224&e)){if(r=c(),s=(31&e)<<6|r,s>=128)return s;throw Error("Invalid continuation byte")}if(224==(240&e)){if(r=c(),n=c(),s=(15&e)<<12|r<<6|n,s>=2048)return o(s,t)?s:65533;throw Error("Invalid continuation byte")}if(240==(248&e)&&(r=c(),n=c(),i=c(),s=(7&e)<<18|r<<12|n<<6|i,s>=65536&&s<=1114111))return s;throw Error("Invalid UTF-8 detected")}function h(t,e){e=e||{};var o=!1!==e.strict;u=r(t),f=u.length,l=0;for(var i,s=[];(i=p(o))!==!1;)s.push(i);return n(s)}/*! https://mths.be/utf8js v2.1.2 by @mathias */
var u,f,l,d=String.fromCharCode;t.exports={version:"2.1.2",encode:a,decode:h}},function(t,e){!function(t){"use strict";e.encode=function(e){var r,n=new Uint8Array(e),o=n.length,i="";for(r=0;r<o;r+=3)i+=t[n[r]>>2],i+=t[(3&n[r])<<4|n[r+1]>>4],i+=t[(15&n[r+1])<<2|n[r+2]>>6],i+=t[63&n[r+2]];return o%3===2?i=i.substring(0,i.length-1)+"=":o%3===1&&(i=i.substring(0,i.length-2)+"=="),i},e.decode=function(e){var r,n,o,i,s,a=.75*e.length,c=e.length,p=0;"="===e[e.length-1]&&(a--,"="===e[e.length-2]&&a--);var h=new ArrayBuffer(a),u=new Uint8Array(h);for(r=0;r<c;r+=4)n=t.indexOf(e[r]),o=t.indexOf(e[r+1]),i=t.indexOf(e[r+2]),s=t.indexOf(e[r+3]),u[p++]=n<<2|o>>4,u[p++]=(15&o)<<4|i>>2,u[p++]=(3&i)<<6|63&s;return h}}("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")},function(t,e){function r(t){return t.map(function(t){if(t.buffer instanceof ArrayBuffer){var e=t.buffer;if(t.byteLength!==e.byteLength){var r=new Uint8Array(t.byteLength);r.set(new Uint8Array(e,t.byteOffset,t.byteLength)),e=r.buffer}return e}return t})}function n(t,e){e=e||{};var n=new i;return r(t).forEach(function(t){n.append(t)}),e.type?n.getBlob(e.type):n.getBlob()}function o(t,e){return new Blob(r(t),e||{})}var i="undefined"!=typeof i?i:"undefined"!=typeof WebKitBlobBuilder?WebKitBlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder&&MozBlobBuilder,s=function(){try{var t=new Blob(["hi"]);return 2===t.size}catch(t){return!1}}(),a=s&&function(){try{var t=new Blob([new Uint8Array([1,2])]);return 2===t.size}catch(t){return!1}}(),c=i&&i.prototype.append&&i.prototype.getBlob;"undefined"!=typeof Blob&&(n.prototype=Blob.prototype,o.prototype=Blob.prototype),t.exports=function(){return s?a?Blob:o:c?n:void 0}()},function(t,e){e.encode=function(t){var e="";for(var r in t)t.hasOwnProperty(r)&&(e.length&&(e+="&"),e+=encodeURIComponent(r)+"="+encodeURIComponent(t[r]));return e},e.decode=function(t){for(var e={},r=t.split("&"),n=0,o=r.length;n<o;n++){var i=r[n].split("=");e[decodeURIComponent(i[0])]=decodeURIComponent(i[1])}return e}},function(t,e){t.exports=function(t,e){var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t}},function(t,e){"use strict";function r(t){var e="";do e=s[t%a]+e,t=Math.floor(t/a);while(t>0);return e}function n(t){var e=0;for(h=0;h<t.length;h++)e=e*a+c[t.charAt(h)];return e}function o(){var t=r(+new Date);return t!==i?(p=0,i=t):t+"."+r(p++)}for(var i,s="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""),a=64,c={},p=0,h=0;h<a;h++)c[s[h]]=h;o.encode=r,o.decode=n,t.exports=o},function(t,e,r){function n(){}function o(t){i.call(this,t),this.query=this.query||{},c||(c=a.___eio=a.___eio||[]),this.index=c.length;var e=this;c.push(function(t){e.onData(t)}),this.query.j=this.index,"function"==typeof addEventListener&&addEventListener("beforeunload",function(){e.script&&(e.script.onerror=n)},!1)}var i=r(17),s=r(28),a=r(15);t.exports=o;var c,p=/\n/g,h=/\\n/g;s(o,i),o.prototype.supportsBinary=!1,o.prototype.doClose=function(){this.script&&(this.script.parentNode.removeChild(this.script),this.script=null),this.form&&(this.form.parentNode.removeChild(this.form),this.form=null,this.iframe=null),i.prototype.doClose.call(this)},o.prototype.doPoll=function(){var t=this,e=document.createElement("script");this.script&&(this.script.parentNode.removeChild(this.script),this.script=null),e.async=!0,e.src=this.uri(),e.onerror=function(e){t.onError("jsonp poll error",e)};var r=document.getElementsByTagName("script")[0];r?r.parentNode.insertBefore(e,r):(document.head||document.body).appendChild(e),this.script=e;var n="undefined"!=typeof navigator&&/gecko/i.test(navigator.userAgent);n&&setTimeout(function(){var t=document.createElement("iframe");document.body.appendChild(t),document.body.removeChild(t)},100)},o.prototype.doWrite=function(t,e){function r(){n(),e()}function n(){if(o.iframe)try{o.form.removeChild(o.iframe)}catch(t){o.onError("jsonp polling iframe removal error",t)}try{var t='<iframe src="javascript:0" name="'+o.iframeId+'">';i=document.createElement(t)}catch(t){i=document.createElement("iframe"),i.name=o.iframeId,i.src="javascript:0"}i.id=o.iframeId,o.form.appendChild(i),o.iframe=i}var o=this;if(!this.form){var i,s=document.createElement("form"),a=document.createElement("textarea"),c=this.iframeId="eio_iframe_"+this.index;s.className="socketio",s.style.position="absolute",s.style.top="-1000px",s.style.left="-1000px",s.target=c,s.method="POST",s.setAttribute("accept-charset","utf-8"),a.name="d",s.appendChild(a),document.body.appendChild(s),this.form=s,this.area=a}this.form.action=this.uri(),n(),t=t.replace(h,"\\\n"),this.area.value=t.replace(p,"\\n");try{this.form.submit()}catch(t){}this.iframe.attachEvent?this.iframe.onreadystatechange=function(){"complete"===o.iframe.readyState&&r()}:this.iframe.onload=r}},function(t,e,r){function n(t){var e=t&&t.forceBase64;e&&(this.supportsBinary=!1),this.perMessageDeflate=t.perMessageDeflate,this.usingBrowserWebSocket=o&&!t.forceNode,this.protocols=t.protocols,this.usingBrowserWebSocket||(u=i),s.call(this,t)}var o,i,s=r(18),a=r(19),c=r(27),p=r(28),h=r(29);r(3)("engine.io-client:websocket");if("undefined"!=typeof WebSocket?o=WebSocket:"undefined"!=typeof self&&(o=self.WebSocket||self.MozWebSocket),"undefined"==typeof window)try{i=r(32)}catch(t){}var u=o||i;t.exports=n,p(n,s),n.prototype.name="websocket",n.prototype.supportsBinary=!0,n.prototype.doOpen=function(){if(this.check()){var t=this.uri(),e=this.protocols,r={};this.isReactNative||(r.agent=this.agent,r.perMessageDeflate=this.perMessageDeflate,r.pfx=this.pfx,r.key=this.key,r.passphrase=this.passphrase,r.cert=this.cert,r.ca=this.ca,r.ciphers=this.ciphers,r.rejectUnauthorized=this.rejectUnauthorized),this.extraHeaders&&(r.headers=this.extraHeaders),this.localAddress&&(r.localAddress=this.localAddress);try{this.ws=this.usingBrowserWebSocket&&!this.isReactNative?e?new u(t,e):new u(t):new u(t,e,r)}catch(t){return this.emit("error",t)}void 0===this.ws.binaryType&&(this.supportsBinary=!1),this.ws.supports&&this.ws.supports.binary?(this.supportsBinary=!0,this.ws.binaryType="nodebuffer"):this.ws.binaryType="arraybuffer",this.addEventListeners()}},n.prototype.addEventListeners=function(){var t=this;this.ws.onopen=function(){t.onOpen()},this.ws.onclose=function(){t.onClose()},this.ws.onmessage=function(e){t.onData(e.data)},this.ws.onerror=function(e){t.onError("websocket error",e)}},n.prototype.write=function(t){function e(){r.emit("flush"),setTimeout(function(){r.writable=!0,r.emit("drain")},0)}var r=this;this.writable=!1;for(var n=t.length,o=0,i=n;o<i;o++)!function(t){a.encodePacket(t,r.supportsBinary,function(o){if(!r.usingBrowserWebSocket){var i={};if(t.options&&(i.compress=t.options.compress),r.perMessageDeflate){var s="string"==typeof o?Buffer.byteLength(o):o.length;s<r.perMessageDeflate.threshold&&(i.compress=!1)}}try{r.usingBrowserWebSocket?r.ws.send(o):r.ws.send(o,i)}catch(t){}--n||e()})}(t[o])},n.prototype.onClose=function(){s.prototype.onClose.call(this)},n.prototype.doClose=function(){"undefined"!=typeof this.ws&&this.ws.close()},n.prototype.uri=function(){var t=this.query||{},e=this.secure?"wss":"ws",r="";this.port&&("wss"===e&&443!==Number(this.port)||"ws"===e&&80!==Number(this.port))&&(r=":"+this.port),this.timestampRequests&&(t[this.timestampParam]=h()),this.supportsBinary||(t.b64=1),t=c.encode(t),t.length&&(t="?"+t);var n=this.hostname.indexOf(":")!==-1;return e+"://"+(n?"["+this.hostname+"]":this.hostname)+r+this.path+t},n.prototype.check=function(){return!(!u||"__initialize"in u&&this.name===n.prototype.name)}},function(t,e){},function(t,e){var r=[].indexOf;t.exports=function(t,e){if(r)return t.indexOf(e);for(var n=0;n<t.length;++n)if(t[n]===e)return n;return-1}},function(t,e,r){"use strict";function n(t,e,r){this.io=t,this.nsp=e,this.json=this,this.ids=0,this.acks={},this.receiveBuffer=[],this.sendBuffer=[],this.connected=!1,this.disconnected=!0,this.flags={},r&&r.query&&(this.query=r.query),this.io.autoConnect&&this.open()}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=r(4),s=r(5),a=r(35),c=r(36),p=r(37),h=(r(3)("socket.io-client:socket"),r(27)),u=r(21);t.exports=e=n;var f={connect:1,connect_error:1,connect_timeout:1,connecting:1,disconnect:1,error:1,reconnect:1,reconnect_attempt:1,reconnect_failed:1,reconnect_error:1,reconnecting:1,ping:1,pong:1},l=s.prototype.emit;s(n.prototype),n.prototype.subEvents=function(){if(!this.subs){var t=this.io;this.subs=[c(t,"open",p(this,"onopen")),c(t,"packet",p(this,"onpacket")),c(t,"close",p(this,"onclose"))]}},n.prototype.open=n.prototype.connect=function(){return this.connected?this:(this.subEvents(),this.io.reconnecting||this.io.open(),"open"===this.io.readyState&&this.onopen(),this.emit("connecting"),this)},n.prototype.send=function(){var t=a(arguments);return t.unshift("message"),this.emit.apply(this,t),this},n.prototype.emit=function(t){if(f.hasOwnProperty(t))return l.apply(this,arguments),this;var e=a(arguments),r={type:(void 0!==this.flags.binary?this.flags.binary:u(e))?i.BINARY_EVENT:i.EVENT,data:e};return r.options={},r.options.compress=!this.flags||!1!==this.flags.compress,"function"==typeof e[e.length-1]&&(this.acks[this.ids]=e.pop(),r.id=this.ids++),this.connected?this.packet(r):this.sendBuffer.push(r),this.flags={},this},n.prototype.packet=function(t){t.nsp=this.nsp,this.io.packet(t)},n.prototype.onopen=function(){if("/"!==this.nsp)if(this.query){var t="object"===o(this.query)?h.encode(this.query):this.query;this.packet({type:i.CONNECT,query:t})}else this.packet({type:i.CONNECT})},n.prototype.onclose=function(t){this.connected=!1,this.disconnected=!0,delete this.id,this.emit("disconnect",t)},n.prototype.onpacket=function(t){var e=t.nsp===this.nsp,r=t.type===i.ERROR&&"/"===t.nsp;if(e||r)switch(t.type){case i.CONNECT:this.onconnect();break;case i.EVENT:this.onevent(t);break;case i.BINARY_EVENT:this.onevent(t);break;case i.ACK:this.onack(t);break;case i.BINARY_ACK:this.onack(t);break;case i.DISCONNECT:this.ondisconnect();break;case i.ERROR:this.emit("error",t.data)}},n.prototype.onevent=function(t){var e=t.data||[];null!=t.id&&e.push(this.ack(t.id)),this.connected?l.apply(this,e):this.receiveBuffer.push(e)},n.prototype.ack=function(t){var e=this,r=!1;return function(){if(!r){r=!0;var n=a(arguments);e.packet({type:u(n)?i.BINARY_ACK:i.ACK,id:t,data:n})}}},n.prototype.onack=function(t){var e=this.acks[t.id];"function"==typeof e&&(e.apply(this,t.data),delete this.acks[t.id])},n.prototype.onconnect=function(){this.connected=!0,this.disconnected=!1,this.emitBuffered(),this.emit("connect")},n.prototype.emitBuffered=function(){var t;for(t=0;t<this.receiveBuffer.length;t++)l.apply(this,this.receiveBuffer[t]);for(this.receiveBuffer=[],t=0;t<this.sendBuffer.length;t++)this.packet(this.sendBuffer[t]);this.sendBuffer=[]},n.prototype.ondisconnect=function(){this.destroy(),this.onclose("io server disconnect")},n.prototype.destroy=function(){if(this.subs){for(var t=0;t<this.subs.length;t++)this.subs[t].destroy();this.subs=null}this.io.destroy(this)},n.prototype.close=n.prototype.disconnect=function(){return this.connected&&this.packet({type:i.DISCONNECT}),this.destroy(),this.connected&&this.onclose("io client disconnect"),this},n.prototype.compress=function(t){return this.flags.compress=t,this},n.prototype.binary=function(t){return this.flags.binary=t,this}},function(t,e){function r(t,e){var r=[];e=e||0;for(var n=e||0;n<t.length;n++)r[n-e]=t[n];return r}t.exports=r},function(t,e){"use strict";function r(t,e,r){return t.on(e,r),{destroy:function(){t.removeListener(e,r)}}}t.exports=r},function(t,e){var r=[].slice;t.exports=function(t,e){if("string"==typeof e&&(e=t[e]),"function"!=typeof e)throw new Error("bind() requires a function");var n=r.call(arguments,2);return function(){return e.apply(t,n.concat(r.call(arguments)))}}},function(t,e){function r(t){t=t||{},this.ms=t.min||100,this.max=t.max||1e4,this.factor=t.factor||2,this.jitter=t.jitter>0&&t.jitter<=1?t.jitter:0,this.attempts=0}t.exports=r,r.prototype.duration=function(){var t=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var e=Math.random(),r=Math.floor(e*this.jitter*t);t=0==(1&Math.floor(10*e))?t-r:t+r}return 0|Math.min(t,this.max)},r.prototype.reset=function(){this.attempts=0},r.prototype.setMin=function(t){this.ms=t},r.prototype.setMax=function(t){this.max=t},r.prototype.setJitter=function(t){this.jitter=t}}])});


}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":40}]},{},[5])(5)
});
