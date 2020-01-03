import * as admin from 'firebase-admin';
/**
 * Initialize Firebase App
 *
 * @param {any} serviceAccount
 * @param {any} databaseURL
 */
export declare const initializeApp: (serviceAccount: string, databaseURL: string) => boolean;
export { admin };
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @return {json}
 */
export declare const backup: (collectionName: string) => Promise<any>;
/**
 * Restore data to firestore
 * @param fileName
 * @param dateArray
 * @param geoArray
 */
export declare const restore: (fileName: string, dateArray?: string[], geoArray?: string[]) => Promise<any>;
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 */
export declare const backups: (collectionNameArray?: string[]) => Promise<any>;
