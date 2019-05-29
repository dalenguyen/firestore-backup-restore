"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
const restoreService = __importStar(require("./import"));
const backupService = __importStar(require("./export"));
/**
 * Initialize Firebase App
 *
 * @param {any} serviceAccount
 * @param {any} databaseURL
 */
exports.initializeApp = (serviceAccount, databaseURL) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
    });
    admin.firestore().settings({ timestampsInSnapshots: true });
    return true;
};
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @param {string} subCollection
 * @return {json}
 */
exports.backup = (collectionName, subCollection = '') => {
    return backupService.backup(collectionName, subCollection);
};
/**
 * Restore data to firestore
 * @param fileName
 * @param dateArray
 * @param geoArray
 */
exports.restore = (fileName, dateArray = [], geoArray = []) => {
    return restoreService.restore(fileName, dateArray, geoArray);
};
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 */
exports.backups = (collectionNameArray = []) => {
    return backupService.getAllCollections(collectionNameArray);
};
//# sourceMappingURL=index.js.map