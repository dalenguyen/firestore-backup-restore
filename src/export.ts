import * as admin from 'firebase-admin';

/**
 * Get data from all collections 
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
export const getAllCollections = (collectionNameArray): Promise<any> => {
    const db = admin.firestore();
    // get all the root-level paths
    return new Promise((resolve) => {
        db.getCollections().then((snap) => {
            let paths = collectionNameArray;
            
            if(paths.length === 0) { // get all collections
                snap.forEach((collection) => paths.push(...collection['_referencePath'].segments));            
            }            
            
            // fetch in parallel
            let promises = [];
            paths.forEach((segment) => {
                let result = backup(segment);
                promises.push(result);
            });
            // assemble the pieces into one object
            Promise.all(promises).then((value) => {
                let all = Object.assign({}, ...value);                       
                resolve(all);
            });
        });
    })    
}

/**
 * Backup data from firestore
 * 
 * @param {string} collectionName 
 * @param {any} [subCollections=[]]
 * @returns {Promise<any>} 
 */
export const backup = (collectionName: string, subCollections = []): Promise<any> => {
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
            if (typeof subCollections === 'string') subCollections = [subCollections];
            if (subCollections.length === 0) {
                resolve(dt);
            } else {
                let count = 0;
                subCollections.forEach(subCollection => {
                    getSubCollection(db, data, dt, collectionName, subCollection).then(() => {
                        count++;
                        if (count === subCollections.length) {
                            resolve(data)
                        }
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    })
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
const getSubCollection = async (db, data, dt, collectionName, subCollection) => {
    for (let [key, value] of Object.entries([dt[collectionName]][0])) {
        if (data[collectionName][key]['subCollections'] == null) {
            data[collectionName][key]['subCollections'] = {};
        }
        data[collectionName][key]['subCollections'][subCollection] = {};
        await addSubCollection(db, key, data[collectionName][key]['subCollections'][subCollection], collectionName, subCollection);
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
const addSubCollection = (db, key, subData, collectionName, subCollection) => {
    return new Promise((resolve, reject) => {
        db.collection(collectionName).doc(key).collection(subCollection).get()
            .then(snapshot => {
                snapshot.forEach(subDoc => {
                    subData[subDoc.id] = subDoc.data();
                })
                resolve('Added data');
            }).catch(error => {
                reject(false);
                console.log(error);
            })
    })
}
