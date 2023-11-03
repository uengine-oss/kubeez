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
//# sourceMappingURL=server-date.js.map