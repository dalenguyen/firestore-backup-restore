"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
exports.admin = admin;
const restoreService = require("./import");
const backupService = require("./export");
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
 * @param {Array<string> = []} subCollections
 * @return {json}
 */
exports.backup = (collectionName, subCollections = []) => {
    return backupService.backup(collectionName, subCollections);
};
/**
 * Restore data to firestore
 *
 * @param {any} fileName
 */
exports.restore = (fileName, dateArray = []) => {
    restoreService.restore(fileName, dateArray);
};
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 */
exports.backups = (collectionNameArray = []) => {
    return backupService.getAllCollections(collectionNameArray);
};
//# sourceMappingURL=index.js.map