/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export declare const getAllCollections: (collectionNameArray: any) => Promise<any>;
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @param {string} [subCollection='']
 * @returns {Promise<any>}
 */
export declare const backup: (collectionName: string, subCollection?: string) => Promise<any>;
