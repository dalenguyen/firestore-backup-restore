// import { describe, it, expect } from 'vitest'
import { Firestore } from 'firebase-admin/firestore'
import request from 'request-promise'
import {
  backup,
  backupFromDoc,
  backups,
  initializeFirebaseApp,
  restore,
} from '../dist'
import { serviceAccount } from './serviceAccount'

const firestore = initializeFirebaseApp(serviceAccount)
const firestore2 = initializeFirebaseApp(serviceAccount, 'CUSTOM')

const backupAPI =
  'https://firebasestorage.googleapis.com/v0/b/firbase-function-helper-qa.appspot.com/o/import-to-firestore.json?alt=media&token=a0530902-8983-45a4-90c2-72c345c7a3d5'

describe('initializeApp function test', () => {
  it('Initialize app', () => {
    expect(firestore).to.be.instanceof(Firestore)
  })

  it('Restore data from API', async () => {
    const backupData = await request(backupAPI)
    const status = await restore(firestore, JSON.parse(backupData), {
      dates: ['date'],
      geos: ['location'],
    })
    expect(status.status).ok
  })

  it('Get all collections', async () => {
    try {
      const all = await backups(firestore)
      expect(Object.keys(all).length).is.greaterThan(0)
    } catch (error) {
      console.log(error)
    }
  })

  it('Get an array of collections with default App name', async () => {
    const all = await backups(firestore, ['test', 'users'])
    expect(Object.keys(all).length).is.equal(2)
  })

  it('Get an array of collections with custom App name', async () => {
    const all = await backups(firestore2, ['test', 'users'])
    expect(Object.keys(all).length).is.equal(2)
  })

  it('Backup from document', async () => {
    const doc = await backupFromDoc(firestore, 'test', 'first-key')
    // console.log(JSON.stringify(doc))

    expect(JSON.stringify(doc)).contains('subCollection')
    expect(JSON.stringify(doc)).contains('dungnq@itbox4vn.com')
    expect(JSON.stringify(doc)).contains('test/first-key/details')
    expect(JSON.stringify(doc)).contains('test/first-key/contacts')
  })

  it('Backup with query', async () => {
    const queryByName = (collectionRef) =>
      collectionRef.where('name', '==', 'Dale Nguyen').get()
    const users = await backup(firestore, 'users', {
      queryCollection: queryByName,
      refs: ['ref', 'map.first-ref', 'path.invalid'],
    })
    // console.log(JSON.stringify(users))
    expect(Object.keys(users).length).is.equal(1)
  })

  it('Backup with reference key', async () => {
    const users = await backup(firestore, 'users', {
      refs: ['ref', 'map.first-ref', 'map.second-ref', 'path.invalid'],
    })
    // console.log(JSON.stringify(users))
    expect(JSON.stringify(users)).contains('test/first-key')
    expect(JSON.stringify(users)).contains('test/second-key')
    expect(Object.keys(users).length).is.equal(1)
  })

  it('Restore data with document id - without autoParseDates', async () => {
    let status = await restore(firestore, 'test/import-to-firestore.json', {
      dates: ['date', 'schedule.time', 'three.level.time'],
      geos: ['location', 'locations', 'locationNested.geopoints'],
      refs: ['secondRef', 'arrayRef', 'nestedRef.secondRef'],
    })
    expect(status.status).ok

    const result = await backup(firestore, 'test')

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
    let status = await restore(firestore, 'test/import-to-firestore.json', {
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

    const result = await backup(firestore, 'test')

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
    let status = await restore(
      firestore,
      'test/import-array-to-firestore.json',
      {
        showLogs: true,
      }
    )
    expect(status.status).ok
  })

  it('Get a colection with sub-collection', async () => {
    try {
      const data = await backup(firestore, 'test')
      const subCol = data['test']['first-key']['subCollection']

      expect(subCol).is.exist
      expect(Object.values(subCol).length).equals(2) // 2 sub collections
    } catch (error) {
      console.log(error)
    }
  })

  it('Export single document from all collections', async () => {
    try {
      const data = await backups(firestore, ['test'], {
        docsFromEachCollection: 1,
      })
      expect(Object.values(data['test']).length).equals(1) // 1 document
    } catch (error) {
      console.log(error)
    }
  })
})
