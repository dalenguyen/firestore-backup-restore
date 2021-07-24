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
export declare const backup: (collectionName: string, options?: IExportOptions) => Promise<unknown>;
/**
 * Backup data from a specific firestore document specified by db.collection(collectionName).doc(documentName)
 *
 * @param {string} collectionName
 * @param {string} documentName
 * @param {IExportOptions} options
 * @return {json}
 */
export declare const backupFromDoc: (collectionName: string, documentName: string, options?: IExportOptions) => Promise<unknown>;
/**
 * Restore data to firestore
 * @param fileName
 * @param options
 */
export declare const restore: (fileName: string | Object, options?: IImportOptions) => Promise<{
    status: boolean;
    message: string;
}>;
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 * @param {IExportOptions} options
 */
export declare const backups: (collectionNameArray?: Array<string>, options?: IExportOptions) => Promise<unknown>;
