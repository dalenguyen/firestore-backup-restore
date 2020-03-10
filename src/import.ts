import * as fs from 'fs';
import { v1 as uuidv1 } from 'uuid';
import * as admin from 'firebase-admin';

export interface IImportOptions {
  dates?: string[];
  geos?: string[];
  refs?: string[];
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
        acc[cur] = new Date(acc[cur]._seconds * 1000);
      } else return acc[cur] || {};
    }, documentObj);
  });
};

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
  const db = admin.firestore();

  return new Promise((resolve, reject) => {
    if (typeof fileName === 'object') {
      let dataArray = fileName;

      updateCollection(db, dataArray, options)
        .then(() => {
          resolve({
            status: true,
            message: 'Collection successfully imported!'
          });
        })
        .catch(error => {
          reject({ status: false, message: error.message });
        });
    } else {
      fs.readFile(fileName, 'utf8', function(err, data) {
        if (err) {
          console.log(err);
          reject({ status: false, message: err.message });
        }

        // Turn string from file to an Array
        let dataArray = JSON.parse(data);

        updateCollection(db, dataArray, options)
          .then(() => {
            resolve({
              status: true,
              message: 'Collection successfully imported!'
            });
          })
          .catch(error => {
            reject({ status: false, message: error.message });
          });
      });
    }
  }).catch(error => console.error(error));
};

/**
 * Update data to firestore
 *
 * @param {any} db
 * @param {Array<any>} dataArray
 * @param {Array<string>} dateArray
 * @param {Array<string>} geoArray
 */
const updateCollection = async (
  db,
  dataArray: Array<any>,
  options: IImportOptions = {}
) => {
  for (var index in dataArray) {
    var collectionName = index;
    for (var doc in dataArray[index]) {
      if (dataArray[index].hasOwnProperty(doc)) {
        // asign document id for array type
        let docId = Array.isArray(dataArray[index]) ? uuidv1() : doc;
        if (dataArray[index][doc]['subCollection']) {
          const subCollections = dataArray[index][docId]['subCollection'];
          delete dataArray[index][doc]['subCollection'];
          await startUpdating(
            db,
            collectionName,
            docId,
            dataArray[index][doc],
            options
          );
          // Update sub collection
          await updateCollection(db, subCollections);
        } else {
          await startUpdating(
            db,
            collectionName,
            docId,
            dataArray[index][doc],
            options
          );
        }
      }
    }
  }
};

/**
 * Write data to database
 * @param db
 * @param collectionName
 * @param docId
 * @param data
 * @param dateArray
 * @param geoArray
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
    updateTime(options.dates, data);
  }

  // reference key
  if (options.refs && options.refs.length > 0) {
    options.refs.forEach(ref => {
      if (data.hasOwnProperty(ref)) {
        data[ref] = db.doc(data[ref]);
      }
    });
  }

  // Enter geo value
  if (options.geos && options.geos.length > 0) {
    options.geos.forEach(geo => {
      if (data.hasOwnProperty(geo)) {
        data[geo] = new admin.firestore.GeoPoint(
          data[geo]._latitude,
          data[geo]._longitude
        );
      } else {
        console.warn('Please check your geo parameters!!!', options.geos);
      }
    });
  }

  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .doc(docId)
      .set(data)
      .then(() => {
        console.log(`${docId} was successfully added to firestore!`);
        resolve({
          status: true,
          message: `${docId} was successfully added to firestore!`
        });
      })
      .catch(error => {
        console.log(error);
        reject({
          status: false,
          message: error.message
        });
      });
  });
};
