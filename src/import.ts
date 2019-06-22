import * as admin from 'firebase-admin';
import * as fs from 'fs';

/**
 * Restore data to firestore
 * 
 * @param {string} fileName 
 * @param {Array<string>} dateArray
 * @param {Array<string>} geoArray
 */
export const restore = (fileName: string, dateArray: Array<string>, geoArray: Array<string>): Promise<any> => {

  const db = admin.firestore();

  return new Promise((resolve, reject) => {
    if (typeof fileName === 'object') {
      let dataArray = fileName;

      udpateCollection(db, dataArray, dateArray, geoArray).then(() => {
          resolve({ status: true, message: 'Successfully import collection!' });
      }).catch(error => {
          reject({ status: false, message: error.message });
      });
    } else {
      fs.readFile(fileName, 'utf8', function (err, data) {
        if (err) {
          console.log(err)
          reject({ status: false, message: err.message });
        }
  
        // Turn string from file to an Array
        let dataArray = JSON.parse(data);
  
        udpateCollection(db, dataArray, dateArray, geoArray).then(() => {
            resolve({ status: true, message: 'Successfully import collection!' });
        }).catch(error => {
            reject({ status: false, message: error.message });
        });
  
      })
    }    
  })

}

/**
 * Update data to firestore
 * 
 * @param {any} db 
 * @param {Array<any>} dataArray 
 * @param {Array<string>} dateArray 
 * @param {Array<string>} geoArray 
 */
const udpateCollection = async (db, dataArray: Array<any>, dateArray: Array<string>, geoArray: Array<string>) => {
  for (var index in dataArray) {
    var collectionName = index;
    for (var doc in dataArray[index]) {
      if (dataArray[index].hasOwnProperty(doc)) {
        await startUpdating(db, collectionName, doc, dataArray[index][doc], dateArray, geoArray);
      }
    }
  }
}

/**
 * Write data to database
 * @param db 
 * @param collectionName 
 * @param doc 
 * @param data 
 * @param dateArray 
 * @param geoArray 
 */
const startUpdating = (db, collectionName: string, doc, data, dateArray: Array<string>, geoArray: Array<string>) => {
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

    // Enter geo value
    if(typeof geoArray !== 'undefined' && geoArray.length > 0) {
      geoArray.map(geo => {
        if(data.hasOwnProperty(geo)) {        
          data[geo] = new admin.firestore.GeoPoint(data[geo]._latitude, data[geo]._longitude);        
        } else {
          console.log('Please check your geo parameters!!!', geoArray);
          parameterValid = false;
        }
      })
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