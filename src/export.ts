import { Firestore } from 'firebase-admin/firestore'
import { getPath, IExportOptions, traverseObjects } from './helper.js'

/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export const getAllCollectionsService = async <T>(
  db: Firestore,
  collectionNameArray: string[],
  options?: IExportOptions
): Promise<T> => {
  // get all the root-level paths
  let paths = collectionNameArray

  if (paths.length === 0) {
    const snap = await db.listCollections()
    // get all collections
    snap.forEach((collection) => paths.push(collection.path))
  }

  // fetch in parallel
  const promises: Promise<T>[] = paths.map((path) =>
    backupService<T>(db, path, options)
  )
  // assemble the pieces into one object
  const value = await Promise.all(promises)
  return Object.assign({}, ...value)
}

/**
 * Backup data from a specific firestore document specified by db.collection(collectionName).doc(documentName)
 *
 * @param {string} collectionName
 * @param {string} documentName
 * @returns {Promise<T>}
 */
export const backupFromDocService = async <T>(
  db: Firestore,
  collectionName: string,
  documentName: string,
  options?: IExportOptions
): Promise<T> => {
  try {
    let data: { [key: string]: any } = {}
    data[collectionName] = {}

    const documentRef = db.collection(collectionName).doc(documentName)
    const document = await documentRef.get()
    const docs = [document]

    for (const doc of docs) {
      const subCollections = await doc.ref.listCollections()
      data[collectionName][doc.id] = doc.data() || {}

      if (options?.refs) {
        for (const refKey of options?.refs) {
          if (refKey.indexOf('.') > -1) {
            traverseObjects(data, (value: any) => {
              if (value.constructor?.name !== 'DocumentReference') {
                return null
              }
              return getPath(value)
            })
          } else {
            if (data[collectionName][doc.id][refKey]) {
              if (Array.isArray(data[collectionName][doc.id][refKey])) {
                for (let val of data[collectionName][doc.id][refKey]) {
                  data[collectionName][doc.id][refKey] = getPath(val)
                }
              } else if (
                typeof data[collectionName][doc.id][refKey].path === 'string'
              ) {
                data[collectionName][doc.id][refKey] =
                  data[collectionName][doc.id][refKey].path
              }
            }
          }
        }
      }

      if (subCollections.length > 0) {
        data[collectionName][doc.id]['subCollection'] = {}

        for (const subCol of subCollections) {
          const subColData = await backupService<object>(
            db,
            `${collectionName}/${documentName}/${subCol.id}`,
            options
          )

          data[collectionName][doc.id]['subCollection'] = {
            ...data[collectionName][doc.id]['subCollection'],
            ...subColData,
          }
        }
      }
    }

    return data as T
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

/**
 * backs up document with subcollections for parallelization
 * @param doc
 * @param options
 * @param collectionPath
 */

export const backUpDocRef = async <T>(
  db: Firestore,
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  collectionPath: String,
  options?: IExportOptions
): Promise<T> => {
  const subCollections = await doc.ref.listCollections()
  let data = Object.assign({}, doc.data())

  if (options?.refs) {
    for (const refKey of options?.refs) {
      if (refKey.indexOf('.') > -1) {
        traverseObjects(data, (value: any) => {
          if (value.constructor?.name !== 'DocumentReference') {
            return null
          }
          return getPath(value)
        })
      } else {
        if (data[refKey]) {
          if (Array.isArray(data[refKey])) {
            for (let val of data[refKey]) {
              data[refKey] = getPath(val)
            }
          } else if (typeof data[refKey].path === 'string') {
            data[refKey] = data[refKey].path
          }
        }
      }
    }
  }

  if (subCollections.length > 0) {
    data['subCollection'] = {}
    const subColOptions = { ...options }
    if (subColOptions?.queryCollection) {
      delete subColOptions.queryCollection
    }
    for (const subCol of subCollections) {
      const subColData = await backupService<object>(
        db,
        `${collectionPath}/${doc.id}/${subCol.id}`,
        subColOptions
      )

      data['subCollection'] = {
        ...data['subCollection'],
        ...subColData,
      }
    }
  }
  let tR: { [key: string]: any } = {}
  tR[doc.id] = data
  return tR as T
}

/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @returns {Promise<T>}
 */
export const backupService = async <T>(
  db: Firestore,
  collectionName: string,
  options?: IExportOptions
): Promise<T> => {
  try {
    let data: { [key: string]: any } = {}
    data[collectionName] = {}

    const collectionRef = db.collection(collectionName)
    const documents: FirebaseFirestore.QuerySnapshot =
      options?.queryCollection != null
        ? await options.queryCollection(collectionRef)
        : await collectionRef.get()
    const docs =
      options?.docsFromEachCollection > 0
        ? documents.docs.slice(0, options?.docsFromEachCollection)
        : documents.docs

    // fetch in parallel
    const promises = docs.map((doc) =>
      backUpDocRef(db, doc, collectionRef.path, options)
    )
    //returns promises with structure
    //{
    //  $docID: $docData
    //}
    const promiseValues = await Promise.all(promises)
    promiseValues.forEach((dataMap) => {
      data[collectionName] = Object.assign(data[collectionName], dataMap)
    })

    return data as T
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}
