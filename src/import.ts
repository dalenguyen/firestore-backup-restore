import * as admin from 'firebase-admin';
import * as fs from 'fs';

/**
 * Restore data to firestore
 * 
 * @param {string} fileName 
 * @param {Array<string>} dateArray
 */
export const restore = (fileName: string, dateArray: Array<string>) => {

  const db = admin.firestore();

  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    // Turn string from file to an Array
    let dataArray = JSON.parse(data);

    udpateCollection(db, dataArray, dateArray);

  })

}

/**
 * Update data to firestore
 * 
 * @param {any} db 
 * @param {Array<any>} dataArray 
 * @param {Array<string>} dateArray 
 */
const udpateCollection = async (db, dataArray: Array<any>, dateArray: Array<string>) => {
  for (var index in dataArray) {
    var collectionName = index;
    for (var doc in dataArray[index]) {
      if (dataArray[index].hasOwnProperty(doc)) {
        await startUpdating(db, collectionName, doc, dataArray[index][doc], dateArray)
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
const startUpdating = (db, collectionName, doc, data, dateArray) => {
  // convert date from unixtimestamp  
  let parameterValid = true;

  if(typeof dateArray === 'object' && dateArray.length > 0) {        
    dateArray.map(date => {      
      if (data.hasOwnProperty(date)) {
        data[date] = new Date(data[date]._seconds * 1000);
      } else {
        console.log('Please check your date parameters!!!', dateArray);
        parameterValid = false;
      }     
    });    
  }

  if (parameterValid) {
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
  } else {
    console.log(`${doc} is not imported to firestore. Please check your parameters!`);
    return false;
  }
}