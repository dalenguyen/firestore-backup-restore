import * as admin from 'firebase-admin';
import * as restoreService from './import';
/**
 * Initialize Firebase App
 *
 * @param {any} serviceAccount
 * @param {any} databaseURL
 * @param {string} name
 */
export declare const initializeApp: (serviceAccount: string, databaseURL: string, name?: string) => boolean;
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
 * @param options
 */
export declare const restore: (fileName: string, options?: restoreService.IImportOptions) => Promise<any>;
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 */
export declare const backups: (collectionNameArray?: string[]) => Promise<any>;
