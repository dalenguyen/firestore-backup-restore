import { cert, getApps, initializeApp } from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore'
import { backupFromDocService, getAllCollectionsService, backupService } from './export.js';
import { IExportOptions, IImportOptions } from './helper.js'
import { restoreService } from './import.js';

interface IInitializeAppOptions {
  firestore?: FirebaseFirestore.Settings
}

/**
 * Initialize Firebase App
 *
 * @param {object} serviceAccount
 * @param {string} name
 * @param {IInitializeAppOptions} options
 */
export const initializeFirebaseApp = (
  serviceAccount: object,
  name = '[DEFAULT]',
  options: IInitializeAppOptions = {}
) => {
  const apps = getApps()
  if (
    apps.length === 0 ||
    (apps.length > 0 && apps[0].name !== name)
  ) {
    initializeApp(
      {
        credential: cert(serviceAccount),
        databaseURL: serviceAccount['databaseURL'],
      },
      name
    )
    getFirestore().settings({ timestampsInSnapshots: true, ...options.firestore })
  }
  return true
}

/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @param {IExportOptions} options
 * @return {json}
 */
export const backup = <T>(collectionName: string, options?: IExportOptions) => {
  return backupService<T>(collectionName, options)
}

/**
 * Backup data from a specific firestore document specified by db.collection(collectionName).doc(documentName)
 *
 * @param {string} collectionName
 * @param {string} documentName
 * @param {IExportOptions} options
 * @return {json}
 */
export const backupFromDoc = <T>(collectionName: string, documentName: string, options?: IExportOptions) => {
  return backupFromDocService<T>(collectionName, documentName, options)
}

/**
 * Restore data to firestore
 * @param fileName
 * @param options
 */
export const restore = (
  fileName: string | Object,
  options: IImportOptions = {}
) => {
  return restoreService(fileName, options)
}

/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 * @param {IExportOptions} options
 */
export const backups = <T>(
  collectionNameArray: Array<string> = [],
  options?: IExportOptions
) => {
  return getAllCollectionsService<T>(collectionNameArray, options)
}
