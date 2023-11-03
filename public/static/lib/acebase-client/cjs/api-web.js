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
//# sourceMappingURL=api-web.js.map