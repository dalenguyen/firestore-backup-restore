import * as admin from 'firebase-admin';

/**
 * Backup data from firestore
 * 
 * @param {string} collectionName 
 * @param {string} [subCollection=''] 
 * @returns {Promise<any>} 
 */
export const backup = function (collectionName: string, subCollection: string = ''): Promise<any> {
    console.log('Geting data from: ', collectionName);
    return new Promise((resolve, reject) => {
        const db = admin.firestore();
        let data = {};

        data[collectionName] = {};

        let results = db.collection(collectionName)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    data[collectionName][doc.id] = doc.data();
                })
                return data;
            })
            .catch(error => {
                console.log(error);
            })

        results.then(dt => {
            if (subCollection === '') {
                resolve(dt);
            } else {
                getSubCollection(db, data, dt, collectionName, subCollection).then(() => {
                    resolve(data)
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            }
        }).catch(error => {
            console.log(error)
            reject(error);
        })
    })

}

/**
 * Get sub collection from a document if possible
 * 
 * @param {any} db 
 * @param {any} data 
 * @param {any} dt 
 * @param {any} collectionName 
 * @param {any} subCollection 
 */
async function getSubCollection(db, data, dt, collectionName, subCollection) {
    for (let [key, value] of Object.entries([dt[collectionName]][0])) {
        data[collectionName][key]['subCollection'] = {};
        await addSubCollection(db, key, data[collectionName][key]['subCollection'], collectionName, subCollection);
    }
}

/**
 * Add sub collection to data object if possible
 * 
 * @param {any} db 
 * @param {any} key 
 * @param {any} subData 
 * @param {any} collectionName 
 * @param {any} subCollection 
 * @returns 
 */
function addSubCollection(db, key, subData, collectionName, subCollection) {
    return new Promise((resolve, reject) => {
        db.collection(collectionName).doc(key).collection(subCollection).get()
            .then(snapshot => {
                snapshot.forEach(subDoc => {
                    subData[subDoc.id] = subDoc.data();
                    resolve('Added data');
                })
            }).catch(error => {
                reject(false);
                console.log(error);
            })
    })
}