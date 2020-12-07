import { IExportOptions } from './helper';
/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export declare const getAllCollections: (collectionNameArray: string[], options?: IExportOptions) => Promise<any>;
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @returns {Promise<any>}
 */
export declare const backup: (collectionName: string, options?: IExportOptions) => Promise<any>;
