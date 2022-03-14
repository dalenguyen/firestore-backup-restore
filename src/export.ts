import * as admin from 'firebase-admin'
import { getPath, IExportOptions, traverseObjects } from './helper'

/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export const getAllCollections = async <T>(
  collectionNameArray: string[],
  options?: IExportOptions
): Promise<T> => {
  const db = admin.firestore()
  // get all the root-level paths
  const snap = await db.listCollections()
  let paths = collectionNameArray

  if (paths.length === 0) {
    // get all collections
    snap.forEach((collection) => paths.push(collection.path))
  }

  // fetch in parallel
  const promises: Promise<unknown>[] = []
  paths.forEach((segment) => {
    const result = backup(segment, options)
    promises.push(result)
  })
  // assemble the pieces into one object
  const value = await Promise.all(promises)
  const all = Object.assign({}, ...value)
  return all
}

/**
 * Backup data from a specific firestore document specified by db.collection(collectionName).doc(documentName)
 *
 * @param {string} collectionName
 * @param {string} documentName
 * @returns {Promise<T>}
 */
export const backupFromDoc = async <T>(
  collectionName: string,
  documentName: string,
  options?: IExportOptions
): Promise<T> => {
  try {
    const db = admin.firestore()
    let data = {}
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
            traverseObjects(data, (value) => {
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
          const subColData = await backup<object>(
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
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  collectionPath: String,
  options?: IExportOptions
): Promise<T> => {
      const subCollections = await doc.ref.listCollections()
      let data = Object.assign({}, doc.data())
      

      if (options?.refs) {
        for (const refKey of options?.refs) {
          if (refKey.indexOf('.') > -1) {
            traverseObjects(data, (value) => {
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
              } else if (
                typeof data[refKey].path === 'string'
              ) {
                data[refKey] =
                  data[refKey].path
              }
            }
          }
        }
      }

      if (subCollections.length > 0) {
        data['subCollection'] = {}
        for (const subCol of subCollections) {
          const subColData = await backup<object>(
            `${collectionPath}/${doc.id}/${subCol.id}`,
            options
          )

          data['subCollection'] = {
            ...data['subCollection'],
            ...subColData,
          }
        }
      }
      let tR = {

      }
      tR[doc.id]=data;
      return tR as T;
}

/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @returns {Promise<T>}
 */
export const backup = async <T>(
  collectionName: string,
  options?: IExportOptions
): Promise<T> => {
  try {
    const db = admin.firestore()
    let data = {}
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

    //fetch in parallel
    const promises: Promise<unknown>[] = []
    docs.forEach((doc) => {
      const result = backUpDocRef(doc, collectionRef.path, options);
      promises.push(result)
    });
    //returns promises with structure
    //{
    //  $docID: $docData
    //}
    const promiseValues = await Promise.all(promises);
    promiseValues.forEach((dataMap) => {
      data[collectionName] = Object.assign(data[collectionName], dataMap)     
    })

    return data as T
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}
