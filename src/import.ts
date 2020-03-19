import * as fs from 'fs'
import { v1 as uuidv1 } from 'uuid'
import * as admin from 'firebase-admin'

export interface IImportOptions {
  dates?: string[]
  geos?: string[]
  refs?: string[]
}

/**
 * Convert time array in document object
 * @param dateArray
 * @param documentObj
 */
const updateTime = (dateArray, documentObj): void => {
  dateArray.forEach(c => {
    c.split('.').reduce((acc, cur, i, a) => {
      if (!a[i + 1] && acc[cur] && acc[cur]._seconds) {
        acc[cur] = new Date(acc[cur]._seconds * 1000)
      } else return acc[cur] || {}
    }, documentObj)
  })
}

/**
 * Restore data to firestore
 *
 * @param {string} fileName
 * @param {IImportOptions} options
 */
export const restore = (
  fileName: string,
  options: IImportOptions
): Promise<any> => {
  const db = admin.firestore()

  return new Promise((resolve, reject) => {
    if (typeof fileName === 'object') {
      let dataObj = fileName

      updateCollection(db, dataObj, options)
        .then(() => {
          resolve({
            status: true,
            message: 'Collection successfully imported!'
          })
        })
        .catch(error => {
          reject({ status: false, message: error.message })
        })
    } else {
      fs.readFile(fileName, 'utf8', function(err, data) {
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
              message: 'Collection successfully imported!'
            })
          })
          .catch(error => {
            reject({ status: false, message: error.message })
          })
      })
    }
  }).catch(error => console.error(error))
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
  for (var index in dataObj) {
    var collectionName = index
    for (var doc in dataObj[index]) {
      if (dataObj[index].hasOwnProperty(doc)) {
        // asign document id for array type
        let docId = Array.isArray(dataObj[index]) ? uuidv1() : doc
        if (!Array.isArray(dataObj[index])) {
          const subCollections = dataObj[index][docId]['subCollection']
          delete dataObj[index][doc]['subCollection']
          await startUpdating(
            db,
            collectionName,
            docId,
            dataObj[index][doc],
            options
          )

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
    updateTime(options.dates, data)
  }

  // reference key
  if (options.refs && options.refs.length > 0) {
    options.refs.forEach(ref => {
      if (data.hasOwnProperty(ref)) {
        // check type of the reference
        if (Array.isArray(data[ref])) {
          data[ref] = data[ref].map(ref => db.doc(ref))
        } else {
          data[ref] = db.doc(data[ref])
        }
      }
    })
  }

  // Enter geo value
  if (options.geos && options.geos.length > 0) {
    options.geos.forEach(geo => {
      if (data.hasOwnProperty(geo)) {
        // array of geo locations
        if (Array.isArray(data[geo])) {
          data[geo] = data[geo].map(geoValues => {
            return new admin.firestore.GeoPoint(
              geoValues._latitude,
              geoValues._longitude
            )
          })
        } else {
          data[geo] = new admin.firestore.GeoPoint(
            data[geo]._latitude,
            data[geo]._longitude
          )
        }
      }
    })
  }

  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .doc(docId)
      .set(data)
      .then(() => {
        console.log(`${docId} was successfully added to firestore!`)
        resolve({
          status: true,
          message: `${docId} was successfully added to firestore!`
        })
      })
      .catch(error => {
        console.log(error)
        reject({
          status: false,
          message: error.message
        })
      })
  })
}
