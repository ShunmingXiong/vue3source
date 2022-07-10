"use strict";
exports.__esModule = true;
exports.queueJob = void 0;
var queue = [];
function queueJob(job) {
    if (!queue.includes(job)) {
        queue.push(job);
        queueFlush();
    }
}
exports.queueJob = queueJob;
var isFlushPending = false;
function queueFlush() {
    if (!isFlushPending) {
        isFlushPending = true;
        Promise.resolve().then(flushJobs);
    }
}
function flushJobs() {
    isFlushPending = false;
    //清空时需要根据调用的顺序依次刷新
    queue.sort(function (a, b) { return a.id - b.id; });
    for (var i = 0; i < queue.length; i++) {
        var job = queue[i];
        job();
    }
    queue.length = 0;
}
