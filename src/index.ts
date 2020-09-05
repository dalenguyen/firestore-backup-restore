import * as admin from 'firebase-admin'
import * as restoreService from './import'
import * as backupService from './export'
import { IImportOptions } from './helper'

/**
 * Initialize Firebase App
 *
 * @param {any} serviceAccount
 * @param {any} databaseURL
 * @param {string} name
 */
export const initializeApp = (
  serviceAccount: string,
  databaseURL: string,
  name = '[DEFAULT]'
) => {
  if (
    admin.apps.length === 0 ||
    (admin.apps.length > 0 && admin.app().name !== name)
  ) {
    admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
      },
      name
    )
    admin.firestore().settings({ timestampsInSnapshots: true })
  }
  return true
}

export { admin }

/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @return {json}
 */
export const backup = (collectionName: string) => {
  return backupService.backup(collectionName)
}

/**
 * Restore data to firestore
 * @param fileName
 * @param options
 */
export const restore = (fileName: string, options: IImportOptions = {}) => {
  return restoreService.restore(fileName, options)
}

/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 * @param {number} [docsFromEachCollection]
 */
export const backups = (collectionNameArray: Array<string> = [], docsFromEachCollection?: number) => {
  return backupService.getAllCollections(collectionNameArray, docsFromEachCollection)
}
