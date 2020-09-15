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
OR
yarn add firestore-export-import
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
// appName is optional, you can omit it.
const appName = '[DEFAULT]';
firestoreService.initializeApp(serviceAccount, databaseURL, appName);

// Start exporting your data
firestoreService
  .backup('collection-name')
  .then((data) => console.log(JSON.stringify(data)));
```

Sub collections will be added under **'subCollection'** object.

### Get all collections data

This is a suggestion from [jcummings2](https://github.com/jcummings2) and [leningsv](https://github.com/Leningsv)

The ['collectionName1', 'collectionName2'] is OPTIONAL, you can remove this parameter to get all of the current collections in your firestore.

The result is an object of collection's data.

```javascript
firestoreService
  .backups(['collectionName1', 'collectionName2']) // Array of collection's name is OPTIONAL
  .then((collections) => {
    // You can do whatever you want with collections
    console.log(JSON.stringify(collections));
  });
```

### Import data to firestore (Predefined Document Id)

This code will help you to import data from a JSON file to firestore. You have two options:

- Restore from a JSON file from your local machine
- Restore from a JSON from a HTTP request

This will return a Promise<{status: boolean, message: string}>

Remember that, this action doesn't remove the collection. It will override or add new data to the collection. If you want to remove the current collection, you should do it from firebase console or using [firebase firestore:delete](https://firebase.google.com/docs/cli)

```sh
firebase firestore:delete [options] <<path>>
```

#### For local JSON

Usually the date, location & reference are not converted correctly when you backup the Firestore database. In order to import correctly, you have to pass to parameters for the options:

```javascript
// Import options
const options = {
  dates: ['date1', 'date1.date2', 'date1.date2.date3'],
  geos: ['location', 'locations'],
  refs: ['refKey'],
};
```

If you don't want to specify `dates`, you can use another parameter in order to transform fields to date auttomatically.

```javascript
// Import options with auto parse date
const options = {
  autoParseDates: true // use this one in stead of dates: [...]
  geos: ['location', 'locations'],
  refs: ['refKey'],
};
```

After that, the data will be converted based on their types.

```javascript
// In your index.js
const firestoreService = require('firestore-export-import');
const serviceAccount = require('./serviceAccountKey.json');

// Initiate Firebase App
// appName is optional, you can obmit it.
const appName = '[DEFAULT]';
firestoreService.initializeApp(serviceAccount, databaseURL, appName);

// Start importing your data
// The array of date, location and reference fields are optional
firestoreService.restore('your-file-path.json', {
  dates: ['date1', 'date1.date2', 'date1.date2.date3'],
  geos: ['location', 'locations'],
  refs: ['refKey', 'arrayRef'],
});
```

#### For HTTP Request

```javascript
import request from 'request-promise';
...
const backupData = await request('JSON-URL');
const status = await firestoreService.restore(JSON.parse(backupData), {
  dates: ['date'],
  geos: ['location']
});
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
      "three": {
        "level": {
          "time": {
            "_seconds": 1534046400,
            "_nanoseconds": 0
          }
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
      "locationNested": {
        "geopoint": {
          "_latitude": 49.290683,
          "_longitude": -123.133956
        }
      },
      "locations": [
        {
          "_latitude": 50.290683,
          "_longitude": -123.133956
        },
        {
          "_latitude": 51.290683,
          "_longitude": -123.133956
        }
      ],
      "email": "dungnq@itbox4vn.com",
      "secondRef": "test/second-key",
      "arrayRef": ["test/second-key", "test/second-key"],
      "nestedRef": {
        "secondRef": "test/second-key"
      },
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
        },
        "test/first-key/contacts": {
          "33J2A10u5902CXagoBP6": {
            "contactId": "1",
            "name": "Dale Nguyen"
          },
          "MSZTWEP7Lewx0Qr1Mu5s": {
            "contactId": "2",
            "name": "Yen Nguyen"
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

### Import data to firestore (auto generate document id)

It works the same way as above. However the structure of JSON file is different. It's an array of documents.

```json
// import-array-to-firestore.json
{
  "test": [
    {
      "name": "Dale Nguyen",
      "email": "dale@dalenguyen.me",
      "subCollection": {
        "details": [
          {
            "dogId": "2",
            "dogName": "hello"
          },
          {
            "dogName": "lala",
            "dogId": "2"
          }
        ]
      }
    },
    {
      "name": "Yen Nguyen",
      "email": "yenchan@gmail.com"
    },
    {
      "name": "Harry Potter",
      "email": "harry@potter.me"
    }
  ]
}
```

## Contributions

This project is based on [firestore-import-export](https://github.com/dalenguyen/firestore-import-export), feel free to report bugs and make feature requests in the [Issue Tracker](https://github.com/dalenguyen/firestore-backup-restore/issues), fork and create pull requests!
