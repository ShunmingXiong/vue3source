"use strict";
exports.__esModule = true;
exports.PublicInstanceProxyHandlers = void 0;
var shared_1 = require("@vue/shared");
exports.PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props, data = instance.data;
        if (key[0] == '$')
            return;
        if (shared_1.hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (shared_1.hasOwn(props, key)) {
            return props[key];
        }
        else if (shared_1.hasOwn(data, key)) {
            return data[key];
        }
        else {
            return undefined;
        }
    },
    set: function (_a, key, value) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props, data = instance.data;
        if (shared_1.hasOwn(setupState, key)) {
            setupState[key] = value;
        }
        else if (shared_1.hasOwn(props, key)) {
            props[key] = value;
        }
        else if (shared_1.hasOwn(data, key)) {
            data[key] = value;
        }
        return true;
    }
};
