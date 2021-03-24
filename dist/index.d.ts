import * as admin from 'firebase-admin';
import { IExportOptions, IImportOptions } from './helper';
interface IInitializeAppOptions {
    firestore?: FirebaseFirestore.Settings;
}
/**
 * Initialize Firebase App
 *
 * @param {object} serviceAccount
 * @param {string} name
 * @param {IInitializeAppOptions} options
 */
export declare const initializeApp: (serviceAccount: object, name?: string, options?: IInitializeAppOptions) => boolean;
export { admin };
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @param {IExportOptions} options
 * @return {json}
 */
export declare const backup: (collectionName: string, options?: IExportOptions) => Promise<any>;
/**
 * Restore data to firestore
 * @param fileName
 * @param options
 */
export declare const restore: (fileName: string | Object, options?: IImportOptions) => Promise<any>;
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 * @param {IExportOptions} options
 */
export declare const backups: (collectionNameArray?: Array<string>, options?: IExportOptions) => Promise<any>;
