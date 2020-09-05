import * as admin from 'firebase-admin';

/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export const getAllCollections = async (
  collectionNameArray: string[],
  docsFromEachCollection?: number
): Promise<any> => {
  const db = admin.firestore();
  // get all the root-level paths
  const snap = await db.listCollections();
  let paths = collectionNameArray;

  if (paths.length === 0) {
    // get all collections
    snap.forEach((collection) => paths.push(collection.path));
  }

  // fetch in parallel
  const promises: Promise<any>[] = [];
  paths.forEach((segment) => {
    const result = backup(segment, docsFromEachCollection);
    promises.push(result);
  });
  // assemble the pieces into one object
  const value = await Promise.all(promises);
  const all = Object.assign({}, ...value);
  return all;
};

/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @returns {Promise<any>}
 */
export const backup = async (collectionName: string, docsFromEachCollection?: number): Promise<any> => {

  function addElement(ElementList: Object, element: Object) {
    let newList = Object.assign(ElementList, element)
    return newList
  }

  try {
    const db = admin.firestore();
    let data = {};
    data[collectionName] = {};

    const documents = await db.collection(collectionName).get();
    const docs =
      docsFromEachCollection > 0
        ? documents.docs.slice(0, docsFromEachCollection)
        : documents.docs;

    for (const doc of docs) {
      const subCollections = await doc.ref.listCollections();

      data[collectionName][doc.id] = doc.data();
      data[collectionName][doc.id]['subCollection'] = {};

      for (const subCol of subCollections) {
        const subColData = await backup(
          `${collectionName}/${doc.id}/${subCol.id}`,
          docsFromEachCollection
        );
        data[collectionName][doc.id]['subCollection'] = addElement(data[collectionName][doc.id]['subCollection'], subColData);
      }
    }

    return data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
