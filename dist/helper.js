"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Convert time array in a Date object
 * @param firebaseTimestamp
 */
exports.makeTime = function (firebaseTimestamp) {
    if (!firebaseTimestamp || !firebaseTimestamp._seconds) {
        return null;
    }
    return new Date(firebaseTimestamp._seconds * 1000);
};
/**
 * Check if the parameter is an Object
 * @param test
 */
var isObject = function (test) {
    return (test === null || test === void 0 ? void 0 : test.constructor) === Object;
};
/**
 * Traverse given data, until there is no sub node anymore
 * Executes the callback function for every sub node found
 * @param data
 * @param callback
 */
exports.traverseObjects = function (data, callback) {
    for (var _i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (!isObject(value)) {
            continue;
        }
        var checkResult = callback(value);
        if (checkResult) {
            data[key] = checkResult;
            continue;
        }
        exports.traverseObjects(data[key], callback);
    }
};
//# sourceMappingURL=helper.js.map