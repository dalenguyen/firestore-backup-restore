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
const fs = require("fs");
/**
 * Restore data to firestore
 *
 * @param {string} fileName
 */
exports.restore = (fileName) => {
    const db = admin.firestore();
    db.settings({ timestampsInSnapshots: true });
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
    });
};
/**
 * Update data to firestore
 *
 * @param {any} db
 * @param {any} dataArray
 */
function udpateCollection(db, dataArray) {
    return __awaiter(this, void 0, void 0, function* () {
        for (var index in dataArray) {
            var collectionName = index;
            for (var doc in dataArray[index]) {
                if (dataArray[index].hasOwnProperty(doc)) {
                    yield startUpdating(db, collectionName, doc, dataArray[index][doc]);
                }
            }
        }
    });
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
    });
}
//# sourceMappingURL=import.js.map