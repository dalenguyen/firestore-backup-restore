import * as admin from "firebase-admin";

/**
 * Remove data from a collection
 *
 * @param {string} fileName
 * @param {Array<string>} dateArray
 * @param {Array<string>} geoArray
 */
export const clean = (collectionName: string): Promise<any> => {
  const db = admin.firestore();

  return new Promise((resolve, reject) => {
    cleanCollection(db, collectionName)
      .then(() => {
        resolve({ status: true, message: "Successfully deleted collection!" });
      })
      .catch(error => {
        reject({ status: false, message: error.message });
      });
  });
};

/**
 * Remove all documents from a collection
 *
 * @param {any} db
 * @param {string} collectionName
 */
const cleanCollection = (db, collectionName: string) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    db.collection(collectionName)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          promises.push(cleanDocument(doc));
        });
        Promise.all(promises)
          .then(() => resolve())
          .catch(error => reject(error));
      });
  });
};

/**
 * Remove documents from a collection
 *
 * @param {doc} document
 */
const cleanDocument = (doc: any) => {
  const docId = doc.id;
  const docRef = doc.ref;
  return new Promise((resolve, reject) => {
    console.log("clean", docId);
    docRef
      .set({})
      .then(() => {
        console.log("Document cleaned", docId);
        docRef
          .delete()
          .then(() => {
            console.log("Document deleted", docId);
            resolve();
          })
          .catch(error => reject({ delete: error }));
      })
      .catch(err => reject({ set: err }));
  });
};
