import { IImportOptions } from './helper';
/**
 * Restore data to firestore
 *
 * @param {string} fileName
 * @param {IImportOptions} options
 */
export declare const restore: (fileName: string | Object, options: IImportOptions) => Promise<{
    status: boolean;
    message: string;
}>;
