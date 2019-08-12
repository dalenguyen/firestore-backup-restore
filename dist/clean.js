"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var admin = __importStar(require("firebase-admin"));
/**
 * Remove data from a collection
 *
 * @param {string} fileName
 * @param {Array<string>} dateArray
 * @param {Array<string>} geoArray
 */
exports.clean = function (collectionName) {
    var db = admin.firestore();
    return new Promise(function (resolve, reject) {
        cleanCollection(db, collectionName)
            .then(function () {
            resolve({ status: true, message: "Successfully deleted collection!" });
        })
            .catch(function (error) {
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
var cleanCollection = function (db, collectionName) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        db.collection(collectionName)
            .get()
            .then(function (snapshot) {
            snapshot.forEach(function (doc) {
                promises.push(cleanDocument(doc));
            });
            Promise.all(promises)
                .then(function () { return resolve(); })
                .catch(function (error) { return reject(error); });
        });
    });
};
/**
 * Remove documents from a collection
 *
 * @param {doc} document
 */
var cleanDocument = function (doc) {
    var docId = doc.id;
    var docRef = doc.ref;
    return new Promise(function (resolve, reject) {
        console.log("clean", docId);
        docRef
            .set({})
            .then(function () {
            console.log("Document cleaned", docId);
            docRef
                .delete()
                .then(function () {
                console.log("Document deleted", docId);
                resolve();
            })
                .catch(function (error) { return reject({ delete: error }); });
        })
            .catch(function (err) { return reject({ set: err }); });
    });
};
//# sourceMappingURL=clean.js.map