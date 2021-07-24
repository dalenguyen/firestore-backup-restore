import * as admin from 'firebase-admin'
import { getPath, IExportOptions, traverseObjects } from './helper'

/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export const getAllCollections = async (
  collectionNameArray: string[],
  options?: IExportOptions
): Promise<any> => {
  const db = admin.firestore()
  // get all the root-level paths
  const snap = await db.listCollections()
  let paths = collectionNameArray

  if (paths.length === 0) {
    // get all collections
    snap.forEach((collection) => paths.push(collection.path))
  }

  // fetch in parallel
  const promises: Promise<any>[] = []
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
 * @returns {Promise<any>}
 */
export const backupFromDoc = async (
  collectionName: string,
  documentName: string,
  options?: IExportOptions
): Promise<any> => {
  function addElement(ElementList: Object, element: Object) {
    let newList = Object.assign(ElementList, element)
    return newList
  }

  try {
    const db = admin.firestore()
    let data = {}
    data[collectionName] = {}

    const documentRef = db.collection(collectionName).doc(documentName)
    const document = await documentRef.get();
    const docs = [document];

    for (const doc of docs) {
      const subCollections = await doc.ref.listCollections()

      data[collectionName][doc.id] = doc.data()

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

      data[collectionName][doc.id]['subCollection'] = {}

      for (const subCol of subCollections) {
        const subColData = await backup(
          `${collectionName}/${documentName}/${subCol.id}`,
          options
        )
        data[collectionName][doc.id]['subCollection'] = addElement(
          data[collectionName][doc.id]['subCollection'],
          subColData
        )
      }
    }

    return data
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @returns {Promise<any>}
 */
export const backup = async (
  collectionName: string,
  options?: IExportOptions
): Promise<any> => {
  function addElement(ElementList: Object, element: Object) {
    let newList = Object.assign(ElementList, element)
    return newList
  }

  try {
    const db = admin.firestore()
    let data = {}
    data[collectionName] = {}

    const collectionRef = db.collection(collectionName)
    const documents =
      options?.queryCollection != null
        ? await options.queryCollection(collectionRef)
        : await collectionRef.get()
    const docs =
      options?.docsFromEachCollection > 0
        ? documents.docs.slice(0, options?.docsFromEachCollection)
        : documents.docs

    for (const doc of docs) {
      const subCollections = await doc.ref.listCollections()

      data[collectionName][doc.id] = doc.data()

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

      data[collectionName][doc.id]['subCollection'] = {}

      for (const subCol of subCollections) {
        const subColData = await backup(
          `${collectionName}/${doc.id}/${subCol.id}`,
          options
        )
        data[collectionName][doc.id]['subCollection'] = addElement(
          data[collectionName][doc.id]['subCollection'],
          subColData
        )
      }
    }

    return data
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}
