import * as admin from 'firebase-admin';
import * as restoreService from './import';
import * as backupService from './export';

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
 * Backup data from firestore
 * 
 * @param {string} collectionName
 * @param {Array<string> = []} subCollections
 * @return {json}
 */
export const backup = (collectionName: string, subCollections: Array<string> = []) => {    
    return backupService.backup(collectionName, subCollections);
}

/**
 * Restore data to firestore
 * 
 * @param {any} fileName 
 */
export const restore = (fileName: string, dateArray: Array<string> = []) => {
    restoreService.restore(fileName, dateArray);
}

/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 */
export const backups = (collectionNameArray: Array<string> = []) => {
    return backupService.getAllCollections(collectionNameArray);
}