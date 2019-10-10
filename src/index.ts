import * as admin from 'firebase-admin';
import * as firebase from '@firebase/testing'
import * as restoreService from './import';
import * as backupService from './export';
import { Firestore } from '@google-cloud/firestore';

/**
 * Initialize Firebase App
 *
 * @param {any} serviceAccount
 * @param {any} databaseURL
 */
export const initializeApp = (serviceAccount: string, databaseURL: string) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
    });
    admin.firestore().settings({ timestampsInSnapshots: true });
    return true;
}

export { admin }

/**
 * Initialize Firebase App
 *
 * @param {any} projectId
 * @param {any} auth
 */
export const initializeTestApp = (projectId: string, auth: object) => {
    return firebase.initializeTestApp({
        projectId,
        auth,
    }).firestore();
}

/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @param {string} subCollection
 * @return {json}
 */
export const backup = (collectionName: string, subCollection: string = '') => {
    return backupService.backup(collectionName, subCollection);
}

/**
 * Restore data to firestore
 * @param fileName
 * @param dateArray
 * @param geoArray
 */
export const restore = (fileName: string, dateArray: Array<string> = [], geoArray: Array<string> = [], db: Firestore = null) => {
    return restoreService.restore(fileName, dateArray, geoArray, db);
}

/**
 * Add fictures data to firestore emulator
 * @param fileName
 * @param projectId
 * @param auth
 */
export const fixtures = (fileName: string, dateArray: Array<string> = [], geoArray: Array<string> = [], db: Firestore) => {
    return restoreService.restore(fileName, dateArray, geoArray, db);
}

/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 */
export const backups = (collectionNameArray: Array<string> = []) => {
    return backupService.getAllCollections(collectionNameArray);
}