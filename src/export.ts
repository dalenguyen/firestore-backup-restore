import * as admin from 'firebase-admin'
import { IExportOptions } from './helper'

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

  function getPath(obj?: { path?: string }) {
    if (obj && typeof obj.path === 'string') {
      return obj.path
    }
    return obj
  }

  try {
    const db = admin.firestore()
    let data = {}
    data[collectionName] = {}

    const documents = await db.collection(collectionName).get()
    const docs =
      options?.docsFromEachCollection > 0
        ? documents.docs.slice(0, options?.docsFromEachCollection)
        : documents.docs

    for (const doc of docs) {
      const subCollections = await doc.ref.listCollections()

      data[collectionName][doc.id] = doc.data()

      if (options?.refs) {
        for (const refKey of options?.refs) {
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
