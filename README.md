# firestore-export-import
NPM package for backup and restore Firebase Firestore

You can export and import data from firestore with sub collection. 

## Installation 

Install using [__npm__](https://www.npmjs.com/).

```sh
npm install firestore-export-import
```

## Get Google Cloud Account Credentials from Firebase

You can __Generate New Private Key__ from Project Settings from [Firebase Console](https://console.firebase.google.com).

After that you need to copy the __databaseURL__ for initiating the App. 

## Usage 

You have to import this package in a JavaScript file and work from there.

### Export data from firestore 

You can export collection and sub collection from your data. The sub collection is optional.

```
// In your index.js 

const firestoreService = require('firestore-export-import');
const serviceAccount = require('./serviceAccountKey.json');

// Initiate Firebase App
firestoreService.initializeApp(serviceAccount, databaseURL);

// Start exporting your data
let result = firestoreService.backup('collection-name', 'sub-collection-optional');
result.then(data => console.log(data))
```

### Import data to firestore 

This code will help you to import data from a JSON file to firestore

```
// In your index.js 

const firestoreService = require('firestore-export-import');
const serviceAccount = require('./serviceAccountKey.json');

// Initiate Firebase App
firestoreService.initializeApp(serviceAccount, databaseURL);

// Start exporting your data
let result = firestoreService.restore('your-file-path.json');
```

The JSON is formated as below. The collection name is __test__. __first-key__ and __second-key__ are document ids. 

```
{
  "test" : {
    "first-key" : {
      "email"   : "dungnq@itbox4vn.com",
      "website" : "dalenguyen.me",
      "custom"  : {
        "firstName" : "Dale",
        "lastName"  : "Nguyen"
      }
    },
    "second-key" : {
      "email"   : "test@dalenguyen.me",
      "website" : "google.com",
      "custom"  : {
        "firstName" : "Harry",
        "lastName"  : "Potter"
      }
    }
  }
}
```

## Contributions

This project is based on [firestore-import-export](https://github.com/dalenguyen/firestore-import-export), feel free to report bugs and make feature requests in the [Issue Tracker](https://github.com/dalenguyen/firestore-backup-restore/issues), fork and create pull requests!