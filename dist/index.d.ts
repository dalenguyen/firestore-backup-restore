import * as admin from 'firebase-admin';
import * as firebase from '@firebase/testing';
import { Firestore } from '@google-cloud/firestore';
/**
 * Initialize Firebase App
 *
 * @param {any} serviceAccount
 * @param {any} databaseURL
 */
export declare const initializeApp: (serviceAccount: string, databaseURL: string) => boolean;
export { admin };
/**
 * Initialize Firebase App
 *
 * @param {any} projectId
 * @param {any} auth
 */
export declare const initializeTestApp: (projectId: string, auth: object) => firebase.firestore.Firestore;
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @param {string} subCollection
 * @return {json}
 */
export declare const backup: (collectionName: string, subCollection?: string) => Promise<any>;
/**
 * Restore data to firestore
 * @param fileName
 * @param dateArray
 * @param geoArray
 */
export declare const restore: (fileName: string, dateArray?: string[], geoArray?: string[], db?: Firestore) => Promise<any>;
/**
 * Add fictures data to firestore emulator
 * @param fileName
 * @param projectId
 * @param auth
 */
export declare const fixtures: (fileName: string, dateArray: string[], geoArray: string[], db: Firestore) => Promise<any>;
/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 */
export declare const backups: (collectionNameArray?: string[]) => Promise<any>;
