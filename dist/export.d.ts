/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export declare const getAllCollections: (collectionNameArray: string[], docsFromEachCollection?: number) => Promise<any>;
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @returns {Promise<any>}
 */
export declare const backup: (collectionName: string, docsFromEachCollection?: number) => Promise<any>;
