'use strict';
var expect = require('chai').expect;
var firestoreService = require('../dist/index.js');
var serviceAccount = require('./serviceAccountKey.json');
var importData = require('./import-to-firestore.json');

// describe('initializeApp function test', () => {
//     it('should return true', () => {
//         var result = firestoreService.initializeApp(serviceAccount, 'https://ionic-firestore-dn.firebaseio.com');
//         expect(result).to.equal(true);
//     })
// })

firestoreService.initializeApp(serviceAccount, 'https://ionic-firestore-dn.firebaseio.com');
var result = firestoreService.backup('test', 'sub');
result.then(data => console.log(JSON.stringify(data)))

// var result = firestoreService.restore('test/import-to-firestore.json');
