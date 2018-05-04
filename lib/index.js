'use strict';
const admin = require('firebase-admin');
const restoreService = require('./import.js');
const backupService = require('./export');

/**
 * Initialize Firebase App
 * 
 * @param {any} serviceAccount 
 * @param {any} databaseURL
 */
exports.initializeApp = function (serviceAccount, databaseURL) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
    })
    return true;    
}

/**
 * Backup data from firestore
 * 
 * @param {string} collectionName
 * @param {string} subCollection
 * @return {json}
 */
exports.backup = function(collectionName, subCollection = ''){    
    return backupService.backup(collectionName, subCollection);
}

/**
 * Restore data to firestore
 * 
 * @param {any} fileName 
 */
exports.restore = function(fileName){
    restoreService.restore(fileName);
}