import { Firestore } from 'firebase-admin/firestore'
import fs from 'fs'
import { v1 as uuidv1 } from 'uuid'
import {
  makeTime,
  traverseObjects,
  IImportOptions,
  parseAndConvertDates,
  makeGeoPoint,
  parseAndConvertGeos,
} from './helper.js'

/**
 * Restore data to firestore
 *
 * @param {string} fileName
 * @param {IImportOptions} options
 */
export const restoreService = (
  db: Firestore,
  fileName: string | Object,
  options: IImportOptions
): Promise<{ status: boolean; message: string }> => {
  return new Promise<{ status: boolean; message: string }>(
    (resolve, reject) => {
      if (typeof fileName === 'object') {
        let dataObj = fileName

        updateCollection(db, dataObj, options)
          .then(() => {
            resolve({
              status: true,
              message: 'Collection successfully imported!',
            })
          })
          .catch((error) => {
            reject({ status: false, message: error.message })
          })
      } else {
        fs.readFile(fileName, 'utf8', function (err, data) {
          if (err) {
            console.log(err)
            reject({ status: false, message: err.message })
          }

          // Turn string from file to an Array
          let dataObj = JSON.parse(data)

          updateCollection(db, dataObj, options)
            .then(() => {
              resolve({
                status: true,
                message: 'Collection successfully imported!',
              })
            })
            .catch((error) => {
              reject({ status: false, message: error.message })
            })
        })
      }
    }
  )
}

/**
 * Update data to firestore
 *
 * @param {any} db
 * @param {object} dataObj
 * @param {IImportOptions} options
 */
const updateCollection = async (
  db,
  dataObj: object,
  options: IImportOptions = {}
) => {
  for (const index in dataObj) {
    let collectionName = index
    for (const doc in dataObj[index]) {
      if (dataObj[index].hasOwnProperty(doc)) {
        // assign document id for array type
        let docId = Array.isArray(dataObj[index]) ? uuidv1() : doc
        if (!Array.isArray(dataObj[index])) {
          const subCollections = dataObj[index][docId]['subCollection']
          delete dataObj[index][doc]['subCollection']
          try {
            await startUpdating(
              db,
              collectionName,
              docId,
              dataObj[index][doc],
              options
            )
          } catch (error) {
            console.error(error)
          }

          if (subCollections) {
            await updateCollection(db, subCollections, options)
          }
        } else {
          const subCollections = dataObj[index][doc]['subCollection']

          delete dataObj[index][doc]['subCollection']

          await startUpdating(
            db,
            collectionName,
            docId,
            dataObj[index][doc],
            options
          )

          if (subCollections) {
            for (const subIndex in subCollections) {
              const revivedSubCollection = {}
              const subCollectionPath = `${collectionName}/${docId}/${subIndex}`
              revivedSubCollection[subCollectionPath] = subCollections[subIndex]
              await updateCollection(db, revivedSubCollection, options)
            }
          }
        }
      }
    }
  }
}

/**
 * Write data to database
 * @param db
 * @param collectionName
 * @param docId
 * @param data
 * @param options
 */

const startUpdating = (
  db,
  collectionName: string,
  docId: string,
  data: object,
  options: IImportOptions
) => {
  // Update date value
  if (options.dates && options.dates.length > 0) {
    options.dates.forEach((date) => {
      if (data.hasOwnProperty(date)) {
        // check type of the date
        if (Array.isArray(data[date])) {
          data[date] = data[date].map((d) => makeTime(d))
        } else {
          data[date] = makeTime(data[date])
        }
      }

      // Check for nested date
      if (date.indexOf('.') > -1) {
        traverseObjects(data, (value) => {
          if (!value.hasOwnProperty('_seconds')) {
            return null
          }
          return makeTime(value)
        })
      }
    })
  }

  if (options.autoParseDates) {
    parseAndConvertDates(data)
  }

  // reference key
  if (options.refs?.length) {
    options.refs.forEach((ref) => {
      if (data.hasOwnProperty(ref)) {
        // check type of the reference
        if (Array.isArray(data[ref])) {
          data[ref] = data[ref].map((dataRef) => db.doc(dataRef))
        } else {
          data[ref] = db.doc(data[ref])
        }
      } else if (data.hasOwnProperty(ref.split('.')[0])) {
        // Nested object ref let test each element
        ref.split('.').reduce((prev, curr, index) => {
          // check if the data is array of object
          if (Array.isArray(prev)) {
            // If we have array at root we test each element
            return prev.reduce((acc, c) => {
              if (typeof c[curr] === 'string') {
                // if is string transform them in refs
                c[curr] = db.doc(c[curr])
              } else if (typeof c[curr] === 'object') {
                // if is object return the object for next callback of reduce
                return (acc = c[curr])
              } else {
                // if it's undefined beacause the properties not exist return the object
                return acc
              }
            }, {})
          } else {
            if (
              Array.isArray(prev[curr]) &&
              ref.split('.').length === index + 1
            ) {
              // If we have array at seconds transform them in refs
              prev[curr] = prev[curr].map((e) => db.doc(e))
            } else if (ref.split('.').length === index + 1 && prev[curr]) {
              // Transform in ref if we are at last ref
              return (prev[curr] = db.doc(prev[curr]))
            } else {
              // If pre[curr] is undefined, set it to null
              return (prev[curr] = prev[curr] || null)
            }
          }
        }, data)
      }
    })
  }

  // Enter geo value
  if (options.geos && options.geos.length > 0) {
    options.geos.forEach((geo) => {
      if (data.hasOwnProperty(geo)) {
        // array of geo locations
        if (Array.isArray(data[geo])) {
          data[geo] = data[geo].map((geoValues) => makeGeoPoint(geoValues))
        } else {
          data[geo] = makeGeoPoint(data[geo])
        }
      }

      if (geo.indexOf('.') > -1) {
        traverseObjects(data, (value) => {
          if (!value.hasOwnProperty('_latitude')) {
            return null
          }
          return makeGeoPoint(value)
        })
      }
    })
  }

  if (options.autoParseGeos) {
    parseAndConvertGeos(data)
  }

  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .doc(docId)
      .set(data)
      .then(() => {
        options?.showLogs &&
          console.log(`${docId} was successfully added to firestore!`)
        resolve({
          status: true,
          message: `${docId} was successfully added to firestore!`,
        })
      })
      .catch((error) => {
        console.log(error)
        reject({
          status: false,
          message: error.message,
        })
      })
  })
}
