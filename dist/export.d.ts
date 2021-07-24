import { IExportOptions } from './helper';
/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export declare const getAllCollections: <T>(collectionNameArray: string[], options?: IExportOptions) => Promise<T>;
/**
 * Backup data from a specific firestore document specified by db.collection(collectionName).doc(documentName)
 *
 * @param {string} collectionName
 * @param {string} documentName
 * @returns {Promise<T>}
 */
export declare const backupFromDoc: <T>(collectionName: string, documentName: string, options?: IExportOptions) => Promise<T>;
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @returns {Promise<T>}
 */
export declare const backup: <T>(collectionName: string, options?: IExportOptions) => Promise<T>;
