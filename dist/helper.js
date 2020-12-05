"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndConvertDates = exports.traverseObjects = exports.makeTime = void 0;
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
 * Check if the parameter is an Object
 * @param test
 */
var isArray = function (test) {
    return Array.isArray(test);
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
        if (!isObject(value) && !isArray(value)) {
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
function parseAndConvertDates(data) {
    exports.traverseObjects(data, function (value) {
        var isTimeStamp = typeof value === "object" &&
            value.hasOwnProperty("_seconds") &&
            value.hasOwnProperty("_nanoseconds");
        if (isTimeStamp) {
            return exports.makeTime(value);
        }
        return null;
    });
}
exports.parseAndConvertDates = parseAndConvertDates;
//# sourceMappingURL=helper.js.map