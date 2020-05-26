export interface IImportOptions {
    dates?: string[];
    geos?: string[];
    refs?: string[];
    nested?: boolean;
}
/**
 * Restore data to firestore
 *
 * @param {string} fileName
 * @param {IImportOptions} options
 */
export declare const restore: (fileName: string, options: IImportOptions) => Promise<any>;
