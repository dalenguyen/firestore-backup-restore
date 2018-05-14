import * as admin from 'firebase-admin';
import * as fs from 'fs';

/**
 * Restore data to firestore
 * 
 * @param {string} fileName 
 */
export const restore = (fileName: string) => {

  const db = admin.firestore();

  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    // Turn string from file to an Array
    let dataArray = JSON.parse(data);

    udpateCollection(db, dataArray).then(() => {
      console.log('Successfully import collection!');
    }).catch(error => {
      console.log(error);
    });

  })

}

/**
 * Update data to firestore
 * 
 * @param {any} db 
 * @param {any} dataArray 
 */
async function udpateCollection(db, dataArray) {
  for (var index in dataArray) {
    var collectionName = index;
    for (var doc in dataArray[index]) {
      if (dataArray[index].hasOwnProperty(doc)) {
        await startUpdating(db, collectionName, doc, dataArray[index][doc])
      }
    }
  }
}

/**
 * Write data to document
 * 
 * @param {any} db 
 * @param {any} collectionName 
 * @param {any} doc 
 * @param {any} data 
 * @returns 
 */
function startUpdating(db, collectionName, doc, data) {
  return new Promise(resolve => {
    db.collection(collectionName).doc(doc)
      .set(data)
      .then(() => {
        console.log(`${doc} is successed adding to firestore!`);
        resolve('Data wrote!');
      })
      .catch(error => {
        console.log(error);
      });
  })
}