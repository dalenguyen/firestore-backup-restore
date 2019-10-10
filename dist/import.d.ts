import { Firestore } from '@google-cloud/firestore';
/**
 * Restore data to firestore
 *
 * @param {string} fileName
 * @param {Array<string>} dateArray
 * @param {Array<string>} geoArray
 * @param {Firestore} db
 */
export declare const restore: (fileName: string, dateArray: string[], geoArray: string[], db: Firestore) => Promise<any>;
