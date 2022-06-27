import { expect } from 'chai'
import request from 'request-promise'
import { parseAndConvertDates, parseAndConvertGeos } from '../src/helper'
import { serviceAccount } from './serviceAccount'
import { backup, backupFromDoc, backups, initializeFirebaseApp, restore } from '../dist'
import { firestore } from 'firebase-admin'

const app = initializeFirebaseApp(serviceAccount)
const backupAPI =
  'https://firebasestorage.googleapis.com/v0/b/firbase-function-helper-qa.appspot.com/o/import-to-firestore.json?alt=media&token=a0530902-8983-45a4-90c2-72c345c7a3d5'

describe('initializeApp function test', () => {
  it('Initialize app', () => {
    expect(app).to.equal(true)
  })

  it('Restore data from API', async () => {
    const backupData = await request(backupAPI)
    const status = await restore(JSON.parse(backupData), {
      dates: ['date'],
      geos: ['location'],
    })
    expect(status.status).ok
  })

  it('Get all collections', async () => {
    try {
      const all = await backups()
      expect(Object.keys(all).length).is.greaterThan(0)
    } catch (error) {
      console.log(error)
    }
  })

  it('Get an array of collections', async () => {
    const all = await backups(['test', 'users'])
    expect(Object.keys(all).length).is.equal(2)
  })

  it('Backup from document', async () => {
    const doc = await backupFromDoc('test', 'first-key')
    // console.log(JSON.stringify(doc))

    expect(JSON.stringify(doc)).contains('subCollection')
    expect(JSON.stringify(doc)).contains('dungnq@itbox4vn.com')
    expect(JSON.stringify(doc)).contains('test/first-key/details')
    expect(JSON.stringify(doc)).contains('test/first-key/contacts')
  })

  it('Backup with query', async () => {
    const queryByName = (collectionRef) =>
      collectionRef.where('name', '==', 'Dale Nguyen').get()
    const users = await backup('users', {
      queryCollection: queryByName,
      refs: ['ref', 'map.first-ref', 'path.invalid'],
    })
    // console.log(JSON.stringify(users))
    expect(Object.keys(users).length).is.equal(1)
  })

  it('Backup with reference key', async () => {
    const users = await backup('users', {
      refs: ['ref', 'map.first-ref', 'map.second-ref', 'path.invalid'],
    })
    // console.log(JSON.stringify(users))
    expect(JSON.stringify(users)).contains('test/first-key')
    expect(JSON.stringify(users)).contains('test/second-key')
    expect(Object.keys(users).length).is.equal(1)
  })

  it('Restore data with document id - without autoParseDates', async () => {
    let status = await restore('test/import-to-firestore.json', {
      dates: ['date', 'schedule.time', 'three.level.time'],
      geos: ['location', 'locations', 'locationNested.geopoints'],
      refs: ['secondRef', 'arrayRef', 'nestedRef.secondRef'],
    })
    expect(status.status).ok

    const result = await backup('test')

    expect(result['test']['first-key'].email).is.equal('dungnq@itbox4vn.com')
    expect(result['test']['first-key'].schedule.time._seconds).equals(
      1534046400
    )
    expect(result['test']['first-key'].three.level.time._seconds).equals(
      1534046400
    )
    expect(typeof result['test']['first-key'].secondRef).is.equal('object')
    // locations
    expect(result['test']['first-key'].location._latitude).equal(49.290683)
    expect(result['test']['first-key'].locations[0]._latitude).equal(50.290683)
    expect(result['test']['first-key'].locations[1]._latitude).equal(51.290683)
    expect(result['test']['first-key'].locationNested.geopoint._latitude).equal(
      49.290683
    )
    expect(
      result['test']['first-key'].subCollection['test/first-key/details'][
        '33J2A10u5902CXagoBP6'
      ].dogName
    ).is.equal('hello')
  })

  it('Restore data with document id - with autoParseDates', async () => {
    let status = await restore('test/import-to-firestore.json', {
      autoParseDates: true,
      geos: ['location', 'locations', 'locationNested.geopoints'],
      refs: [
        'secondRef',
        'arrayRef',
        'arrayNestedRef.refs',
        'arrayNestedRef.nestedRef.refs',
        'arrayNestedRef.nestedNestRef.nestedRef.refs',
        'nestedRef.secondRef',
        'nestedRef.array',
        'nestedNestRef.nestedRef.secondRef',
        'nestedNestRef.nestedRef.array',
        'nestedNestNestRef.nestedNestRef.nestedRef.secondRef',
      ],
    })
    expect(status.status).ok

    const result = await backup('test')

    expect(result['test']['first-key'].email).is.equal('dungnq@itbox4vn.com')
    expect(result['test']['first-key'].schedule.time._seconds).equals(
      1534046400
    )
    expect(result['test']['first-key'].three.level.time._seconds).equals(
      1534046400
    )
    expect(typeof result['test']['first-key'].secondRef).is.equal('object')
    expect(typeof result['test']['third-key'].arrayNestedRef[0].refs).is.equal(
      'object'
    )

    // locations
    expect(result['test']['first-key'].location._latitude).equal(49.290683)
    expect(result['test']['first-key'].locations[0]._latitude).equal(50.290683)
    expect(result['test']['first-key'].locations[1]._latitude).equal(51.290683)
    expect(result['test']['first-key'].locationNested.geopoint._latitude).equal(
      49.290683
    )
    expect(
      result['test']['first-key'].subCollection['test/first-key/details'][
        '33J2A10u5902CXagoBP6'
      ].dogName
    ).is.equal('hello')
  })

  it('Restore data as an array without document id', async () => {
    let status = await restore('test/import-array-to-firestore.json', {
      showLogs: true,
    })
    expect(status.status).ok
  })

  it('Get a colection with sub-collection', async () => {
    try {
      const data = await backup('test')
      const subCol = data['test']['first-key']['subCollection']

      expect(subCol).is.exist
      expect(Object.values(subCol).length).equals(2) // 2 sub collections
    } catch (error) {
      console.log(error)
    }
  })

  it('Export single document from all collections', async () => {
    try {
      const data = await backups(['test'], { docsFromEachCollection: 1 })
      expect(Object.values(data['test']).length).equals(1) // 1 document
    } catch (error) {
      console.log(error)
    }
  })

  it('Test auto parse dates option - simple', async () => {
    const data = {
      date: {
        _seconds: 1534046400,
        _nanoseconds: 0,
      },
    }
    parseAndConvertDates(data)
    expect(data.date).to.be.an.instanceOf(Date)
  })

  it('Test auto parse dates option - nested', async () => {
    const data = {
      date: {
        _seconds: 1534046400,
        _nanoseconds: 0,
      },
      obj: {
        anotherObj: {
          date: {
            _seconds: 1534046400,
            _nanoseconds: 0,
          },
        },
      },
    }
    parseAndConvertDates(data)
    expect(data.date).to.be.an.instanceOf(Date)
    expect(data.obj.anotherObj.date).to.be.an.instanceOf(Date)
  })

  it('Test auto parse dates option - nested arrays', async () => {
    const data = {
      arr: [
        {
          _seconds: 1534046400,
          _nanoseconds: 0,
        },
      ],
    }
    parseAndConvertDates(data)
    expect(data.arr[0]).to.be.an.instanceOf(Date)
  })

  it('Test auto parse dates option - nested array objects', async () => {
    const data = {
      arr: [
        {
          obj: {
            date: {
              _seconds: 1534046400,
              _nanoseconds: 0,
            },
          },
        },
        {
          obj: {
            date: {
              _seconds: 1534046400,
              _nanoseconds: 0,
            },
          },
        },
      ],
    }
    parseAndConvertDates(data)
    expect(data.arr[0].obj.date).to.be.an.instanceOf(Date)
    expect(data.arr[1].obj.date).to.be.an.instanceOf(Date)
  })

  it('Test auto parse geos option - simple', async () => {
    const data = {
      location: {
        _latitude: 35.687498354666516,
        _longitude: 139.44018328905466,
      },
    }
    parseAndConvertGeos(data)
    expect(data.location).to.be.an.instanceOf(firestore.GeoPoint)
  })

  it('Test auto parse geos option - nested', async () => {
    const data = {
      location: {
        _latitude: 35.687498354666516,
        _longitude: 139.44018328905466,
      },
      obj: {
        anotherObj: {
          location: {
            _latitude: 35.687498354666516,
            _longitude: 139.44018328905466,
          },
        },
      },
    }
    parseAndConvertGeos(data)
    expect(data.location).to.be.an.instanceOf(firestore.GeoPoint)
    expect(data.obj.anotherObj.location).to.be.an.instanceOf(firestore.GeoPoint)
  })

  it('Test auto parse geos option - nested arrays', async () => {
    const data = {
      arr: [
        {
          _latitude: 35.687498354666516,
          _longitude: 139.44018328905466,
        },
      ],
    }
    parseAndConvertGeos(data)
    expect(data.arr[0]).to.be.an.instanceOf(firestore.GeoPoint)
  })

  it('Test auto parse geos option - nested array objects', async () => {
    const data = {
      arr: [
        {
          obj: {
            location: {
              _latitude: 35.687498354666516,
              _longitude: 139.44018328905466,
            },
          },
        },
        {
          obj: {
            location: {
              _latitude: 35.687498354666516,
              _longitude: 139.44018328905466,
            },
          },
        },
      ],
    }
    parseAndConvertGeos(data)
    expect(data.arr[0].obj.location).to.be.an.instanceOf(firestore.GeoPoint)
    expect(data.arr[1].obj.location).to.be.an.instanceOf(firestore.GeoPoint)
  })
})
