import * as admin from "firebase-admin";
import * as fs from "fs";

/**
 * Convert time array in document object
 * @param dateArray 
 * @param documentObj 
 */
const updateTime = (dateArray, documentObj): void => {
  dateArray.forEach(c => {
    c.split(".").reduce((acc, cur, i, a) => {
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
 * @param {Array<string>} dateArray
 * @param {Array<string>} geoArray
 */
export const restore = (
  fileName: string,
  dateArray: Array<string>,
  geoArray: Array<string>
): Promise<any> => {
  const db = admin.firestore();

  return new Promise((resolve, reject) => {
    if (typeof fileName === "object") {
      let dataArray = fileName;

      updateCollection(db, dataArray, dateArray, geoArray)
        .then(() => {
          resolve({
            status: true,
            message: "Collection successfully imported!"
          });
        })
        .catch(error => {
          reject({ status: false, message: error.message });
        });
    } else {
      fs.readFile(fileName, "utf8", function(err, data) {
        if (err) {
          console.log(err);
          reject({ status: false, message: err.message });
        }

        // Turn string from file to an Array
        let dataArray = JSON.parse(data);

        updateCollection(db, dataArray, dateArray, geoArray)
          .then(() => {
            resolve({
              status: true,
              message: "Collection successfully imported!"
            });
          })
          .catch(error => {
            reject({ status: false, message: error.message });
          });
      });
    }
  });
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
  dateArray: Array<string>,
  geoArray: Array<string>
) => {
  for (var index in dataArray) {
    var collectionName = index;
    for (var doc in dataArray[index]) {
      if (dataArray[index].hasOwnProperty(doc)) {
        if (dataArray[index][doc]["subCollection"]) {
          const subCollections = dataArray[index][doc]["subCollection"];
          delete dataArray[index][doc]["subCollection"];
          await startUpdating(
            db,
            collectionName,
            doc,
            dataArray[index][doc],
            dateArray,
            geoArray
          );
          await updateCollection(db, subCollections, [], []);
        } else {
          await startUpdating(
            db,
            collectionName,
            doc,
            dataArray[index][doc],
            dateArray,
            geoArray
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
 * @param doc
 * @param data
 * @param dateArray
 * @param geoArray
 */
const startUpdating = (
  db,
  collectionName: string,
  doc: string,
  data: object,
  dateArray: Array<string>,
  geoArray: Array<string>
) => {
  let parameterValid = true;

  if (typeof dateArray === "object" && dateArray.length > 0) {
    updateTime(dateArray, data);    
  }

  // Enter geo value
  if (typeof geoArray !== "undefined" && geoArray.length > 0) {
    geoArray.forEach(geo => {
      if (data.hasOwnProperty(geo)) {
        data[geo] = new admin.firestore.GeoPoint(
          data[geo]._latitude,
          data[geo]._longitude
        );
      } else {
        console.log("Please check your geo parameters!!!", geoArray);
        parameterValid = false;
      }
    });
  }

  if (parameterValid) {
    return new Promise(resolve => {
      db.collection(collectionName)
        .doc(doc)
        .set(data)
        .then(() => {
          console.log(`${doc} was successfully added to firestore!`);
          resolve("Data written!");
        })
        .catch(error => {
          console.log(error);
        });
    });
  } else {
    console.log(
      `${doc} was not imported to firestore. Please check your parameters or ignore if you don't need to import the property above.`
    );
    return false;
  }
};
