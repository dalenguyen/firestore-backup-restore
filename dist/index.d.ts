import * as admin from 'firebase-admin';
import { IImportOptions } from './helper';
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
export declare const restore: (fileName: string, options?: IImportOptions) => Promise<any>;
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 * @param {number} [docsFromEachCollection]
 */
export declare const backups: (collectionNameArray?: Array<string>, docsFromEachCollection?: number) => Promise<any>;
