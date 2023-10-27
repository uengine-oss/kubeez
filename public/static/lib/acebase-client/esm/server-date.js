import { ID } from 'acebase-core';
import performance from './performance/index.js';
const time = {
    serverBias: 0,
    localBias: 0,
    lastTime: Date.now(),
    lastPerf: performance.now(),
    get bias() { return this.serverBias + this.localBias; },
};
function biasChanged() {
    console.log(`Bias changed. server bias = ${time.serverBias}ms, local bias = ${time.localBias}ms`);
    ID.timeBias = time.bias; // undocumented
}
// Keep monitoring local time for changes, adjust local bias accordingly
const interval = 10000; // 10s
function checkLocalTime() {
    // console.log('Checking time...');
    const now = Date.now(), // eg 20:00:00
    perf = performance.now(), msPassed = perf - time.lastPerf, // now - time.lastTime, //
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
export function setServerBias(bias) {
    if (typeof bias === 'number') {
        time.serverBias = bias;
        time.localBias = 0;
        biasChanged();
    }
}
export class ServerDate extends Date {
    constructor() {
        const biasedTime = Date.now() + time.bias;
        super(biasedTime);
    }
}
//# sourceMappingURL=server-date.js.map