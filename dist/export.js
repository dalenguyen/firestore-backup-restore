"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
/**
 * Get data from all collections
 * Suggestion from jcummings2 and leningsv
 * @param {Array<string>} collectionNameArray
 */
exports.getAllCollections = (collectionNameArray) => {
    const db = admin.firestore();
    // get all the root-level paths
    return new Promise((resolve) => {
        db.getCollections().then((snap) => {
            let paths = collectionNameArray;
            if (paths.length === 0) { // get all collections
                snap.forEach((collection) => paths.push(...collection['_referencePath'].segments));
            }
            // fetch in parallel
            let promises = [];
            paths.forEach((segment) => {
                let result = exports.backup(segment);
                promises.push(result);
            });
            // assemble the pieces into one object
            Promise.all(promises).then((value) => {
                let all = Object.assign({}, ...value);
                resolve(all);
            });
        });
    });
};
/**
 * Backup data from firestore
 *
 * @param {string} collectionName
 * @param {string} [subCollection='']
 * @returns {Promise<any>}
 */
exports.backup = (collectionName, subCollection = '') => {
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
            });
            return data;
        })
            .catch(error => {
            console.log(error);
        });
        results.then(dt => {
            if (subCollection === '') {
                resolve(dt);
            }
            else {
                getSubCollection(db, data, dt, collectionName, subCollection).then(() => {
                    resolve(data);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
            }
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
};
/**
 * Get sub collection from a document if possible
 *
 * @param {any} db
 * @param {any} data
 * @param {any} dt
 * @param {any} collectionName
 * @param {any} subCollection
 */
const getSubCollection = (db, data, dt, collectionName, subCollection) => __awaiter(this, void 0, void 0, function* () {
    for (let [key, value] of Object.entries([dt[collectionName]][0])) {
        data[collectionName][key]['subCollection'] = {};
        yield addSubCollection(db, key, data[collectionName][key]['subCollection'], collectionName, subCollection);
    }
});
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
                resolve('Added data');
            });
        }).catch(error => {
            reject(false);
            console.log(error);
        });
    });
};
//# sourceMappingURL=export.js.map