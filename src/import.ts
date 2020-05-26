import * as fs from 'fs'
import { v1 as uuidv1 } from 'uuid'
import * as admin from 'firebase-admin'

export interface IImportOptions {
  dates?: string[]
  geos?: string[]
  refs?: string[]
  nested?: boolean
}

/**
 * Convert time array in a Date object
 * @param firebaseTimestamp
 */
const makeTime = (firebaseTimestamp: {_seconds: number, _nanoseconds: number}): Date => {
  if (!firebaseTimestamp._seconds) {
    return null;
  }
  return new Date(firebaseTimestamp._seconds * 1000);
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
      options.dates.forEach(date => {
        if (data.hasOwnProperty(date)) {
          // check type of the date
          if (Array.isArray(data[date])) {
              data[date] = data[date].map(d =>  makeTime(d))
          } else {
              data[date] = makeTime(data[date])
          }
        }

        if (options.nested) {
           traverseObjects(data, (value) => {
              if (!value.hasOwnProperty(date)) {
                return null;
              }

              value[date] = makeTime(value[date]);
              return value;
            });
        }
      });
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

      if (options.nested) {
        traverseObjects(data, (value) => {
          if (!value.hasOwnProperty(ref)) {
            return null;
          }

          value[ref] = db.doc(data[ref]);
          return value;
        });
      }
    })
  }

  // Enter geo value
  if (options.geos && options.geos.length > 0) {
    const makeGeoPoint = (geoValues: {_latitude: number, _longitude: number}) => {
      if (!geoValues._latitude || !geoValues._longitude) {
        return null;
      }

      return new admin.firestore.GeoPoint(
          geoValues._latitude,
          geoValues._longitude
      );
    };

    options.geos.forEach(geo => {
      if (data.hasOwnProperty(geo)) {
        // array of geo locations
        if (Array.isArray(data[geo])) {
          data[geo] = data[geo].map(geoValues => makeGeoPoint(geoValues))
        } else {
          data[geo] = makeGeoPoint(data[geo])
        }
      }

      if (options.nested) {
        traverseObjects(data, (value) => {
          if (!value.hasOwnProperty(geo)) {
            return null;
          }

          value[geo] = makeGeoPoint(value[geo]);
          return value;
        });
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

/**
 * Check if the parameter is an Object
 * @param test
 */
const isObject = (test: any) => {
  return test?.constructor === Object;
}

/**
 * Traverse given data, until there is no sub node anymore
 * Executes the callback function for every sub node found
 * @param data
 * @param callback
 */
const traverseObjects = (data: any, callback: Function) => {
  for (const [key, value] of Object.entries(data)) {
    if (!isObject(value)) {
      continue;
    }

    const checkResult: any = callback(value)
    if (checkResult) {
      data[key] = checkResult;
      continue;
    }

    traverseObjects(data[key], callback);
  }
}
