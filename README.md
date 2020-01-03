# firestore-export-import

[![GitHub version](https://badge.fury.io/gh/dalenguyen%2Ffirestore-backup-restore.svg)](https://badge.fury.io/gh/dalenguyen%2Ffirestore-backup-restore)
[![Build Status](https://travis-ci.org/dalenguyen/firestore-backup-restore.svg?branch=master)](https://travis-ci.org/dalenguyen/firestore-backup-restore)
[![David badge](https://david-dm.org/dalenguyen/firestore-backup-restore.svg)](https://david-dm.org/dalenguyen/firestore-backup-restore)

NPM package for backup and restore Firebase Firestore

You can export and import data from firestore with sub collection.

## Installation

Install using [**npm**](https://www.npmjs.com/).

```sh
npm install firestore-export-import
```

## Get Google Cloud Account Credentials from Firebase

You can **Generate New Private Key** from Project Settings from [Firebase Console](https://console.firebase.google.com).

After that you need to copy the **databaseURL** for initiating the App.

## Usage

You have to import this package in a JavaScript file and work from there.

### Export data from firestore

You can export collection and sub collection from your data. The sub collection is optional.

```javascript
// In your index.js

const firestoreService = require('firestore-export-import');
const serviceAccount = require('./serviceAccountKey.json');

// Initiate Firebase App
firestoreService.initializeApp(serviceAccount, databaseURL);

// Start exporting your data
firestoreService
  .backup('collection-name')
  .then(data => console.log(JSON.stringify(data)));
```

Sub collections will be added under **'subCollection'** object.

### Get all collections data

This is a suggestion from [jcummings2](https://github.com/jcummings2) and [leningsv](https://github.com/Leningsv)

The ['collectionName1', 'collectionName2'] is OPTIONAL, you can remove this parameter to get all of the current collections in your firestore.

The result is an object of collection's data.

```javascript
firestoreService
  .backups(['collectionName1', 'collectionName2']) // Array of collection's name is OPTIONAL
  .then(collections => {
    // You can do whatever you want with collections
    console.log(JSON.stringify(collections));
  });
```

### Import data to firestore

This code will help you to import data from a JSON file to firestore. You have two options:

- Restore from a JSON file from your local machine
- Restore from a JSON from a HTTP request

This will return a Promise<{status: boolean, message: string}>

Remember that, this action doesn't remove the collection. It will override or add new data to the collection. If you want to remove the current collection, you should do it from firebase console or using [firebase firestore:delete](https://firebase.google.com/docs/cli)

```sh
firebase firestore:delete [options] <<path>>
```

#### For local JSON

```javascript
// In your index.js

const firestoreService = require('firestore-export-import');
const serviceAccount = require('./serviceAccountKey.json');

// Initiate Firebase App
firestoreService.initializeApp(serviceAccount, databaseURL);

// Start importing your data
// The array of date and location fields are optional
firestoreService.restore(
  'your-file-path.json',
  ['date1', 'date2.date3'],
  ['location1', 'location2']
);
```

- Note that the date array only support two levels now. If you pass ['date1.date2.date3'], it won't work.

#### For HTTP Request

```javascript
import request from 'request-promise';
...
const backupData = await request('JSON-URL');
const status = await firestoreService.restore(JSON.parse(backupData), ['date'], ['location']);
```

The JSON is formated as below. The collection name is **test**. **first-key** and **second-key** are document ids.

```json
{
  "test": {
    "first-key": {
      "website": "dalenguyen.me",
      "date": {
        "_seconds": 1534046400,
        "_nanoseconds": 0
      },
      "schedule": {
        "time": {
          "_seconds": 1534046400,
          "_nanoseconds": 0
        }
      },
      "custom": {
        "lastName": "Nguyen",
        "firstName": "Dale"
      },
      "location": {
        "_latitude": 49.290683,
        "_longitude": -123.133956
      },
      "email": "dungnq@itbox4vn.com",
      "subCollection": {
        "test/first-key/details": {
          "33J2A10u5902CXagoBP6": {
            "dogId": "2",
            "dogName": "hello"
          },
          "MSZTWEP7Lewx0Qr1Mu5s": {
            "dogName": "lala",
            "dogId": "2"
          }
        }
      }
    },
    "second-key": {
      "website": "google.com",
      "date": {
        "_seconds": 1534262435,
        "_nanoseconds": 0
      },
      "custom": {
        "lastName": "Potter",
        "firstName": "Harry"
      },
      "location": {
        "_latitude": 49.290683,
        "_longitude": -123.133956
      },
      "email": "test@dalenguyen.me"
    }
  }
}
```

## Contributions

This project is based on [firestore-import-export](https://github.com/dalenguyen/firestore-import-export), feel free to report bugs and make feature requests in the [Issue Tracker](https://github.com/dalenguyen/firestore-backup-restore/issues), fork and create pull requests!
