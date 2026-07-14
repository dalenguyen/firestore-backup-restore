import {
  cert,
  getApps,
  initializeApp,
  AppOptions,
  App,
} from 'firebase-admin/app'
import { Firestore, getFirestore } from 'firebase-admin/firestore'
import {
  backupFromDocService,
  getAllCollectionsService,
  backupService,
} from './export.js'
import { IExportOptions, IImportOptions } from './helper.js'
import { restoreService } from './import.js'

interface IInitializeAppOptions {
  firestore?: FirebaseFirestore.Settings
}

const warnedExistingAppNames = new Set<string>()

/**
 * Initialize Firebase App
 *
 * @param {object} serviceAccount
 * @param {string} name
 * @param {IInitializeAppOptions} options
 *
 * @return Firestore
 */
export const initializeFirebaseApp = (
  serviceAccount?: AppOptions | null,
  name = '[DEFAULT]',
  options: IInitializeAppOptions = {}
): Firestore => {
  const existingApp = getApps().find((a) => a.name === name)

  if (existingApp) {
    if (!warnedExistingAppNames.has(name)) {
      console.warn(`Firebase App "${name}" already exists. Returning existing Firestore instance.`)
      warnedExistingAppNames.add(name)
    }
    return getFirestore(existingApp)
  }

  let app: App
  if (serviceAccount) {
    app = initializeApp(
      {
        credential: cert(serviceAccount),
        databaseURL: serviceAccount['databaseURL'],
      },
      name
    )
  } else {
    app = initializeApp(undefined, name)
  }

  const firestore = getFirestore(app)
  firestore.settings({
    timestampsInSnapshots: true,
    ...options.firestore,
  })

  return firestore
}

/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @param {IExportOptions} options
 * @return {json}
 */
export const backup = <T>(
  db: Firestore,
  collectionName: string,
  options?: IExportOptions
) => {
  return backupService<T>(db, collectionName, options)
}

/**
 * Backup data from a specific firestore document specified by db.collection(collectionName).doc(documentName)
 *
 * @param {string} collectionName
 * @param {string} documentName
 * @param {IExportOptions} options
 * @return {json}
 */
export const backupFromDoc = <T>(
  db: Firestore,
  collectionName: string,
  documentName: string,
  options?: IExportOptions
) => {
  return backupFromDocService<T>(db, collectionName, documentName, options)
}

/**
 * Restore data to firestore
 * @param fileName
 * @param options
 */
export const restore = (
  db: Firestore,
  fileName: string | Object,
  options: IImportOptions = {}
) => {
  return restoreService(db, fileName, options)
}

/**
 * Get all collections data
 * @param {Array<string>} collectionNameArray
 * @param {IExportOptions} options
 */
export const backups = <T>(
  db: Firestore,
  collectionNameArray: Array<string> = [],
  options?: IExportOptions
) => {
  return getAllCollectionsService<T>(db, collectionNameArray, options)
}
