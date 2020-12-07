"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backups = exports.restore = exports.backup = exports.admin = exports.initializeApp = void 0;
var admin = __importStar(require("firebase-admin"));
exports.admin = admin;
var restoreService = __importStar(require("./import"));
var backupService = __importStar(require("./export"));
/**
 * Initialize Firebase App
 *
 * @param {any} serviceAccount
 * @param {any} databaseURL
 * @param {string} name
 */
exports.initializeApp = function (serviceAccount, databaseURL, name) {
    if (name === void 0) { name = '[DEFAULT]'; }
    if (admin.apps.length === 0 ||
        (admin.apps.length > 0 && admin.app().name !== name)) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: databaseURL
        }, name);
        admin.firestore().settings({ timestampsInSnapshots: true });
    }
    return true;
};
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @return {json}
 */
exports.backup = function (collectionName, refKeys) {
    return backupService.backup(collectionName, undefined, refKeys);
};
/**
 * Restore data to firestore
 * @param fileName
 * @param options
 */
exports.restore = function (fileName, options) {
    if (options === void 0) { options = {}; }
    return restoreService.restore(fileName, options);
};
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 * @param {number} [docsFromEachCollection]
 */
exports.backups = function (collectionNameArray, docsFromEachCollection, refKeys) {
    if (collectionNameArray === void 0) { collectionNameArray = []; }
    return backupService.getAllCollections(collectionNameArray, docsFromEachCollection, refKeys);
};
//# sourceMappingURL=index.js.map