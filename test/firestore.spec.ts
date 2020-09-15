import { expect } from 'chai';
import request from 'request-promise';
import * as firestoreService from '../dist';
import { parseAndConvertDates } from '../src/helper';
import { serviceAccount } from './serviceAccount';

const app = firestoreService.initializeApp(
  serviceAccount,
  serviceAccount.databaseUrl
);
const backupAPI =
  'https://firebasestorage.googleapis.com/v0/b/firbase-function-helper-qa.appspot.com/o/import-to-firestore.json?alt=media&token=a0530902-8983-45a4-90c2-72c345c7a3d5';

describe('initializeApp function test', () => {
  it('Initialize app', () => {
    expect(app).to.equal(true);
  });

  it('Restore data from API', async () => {
    const backupData = await request(backupAPI);
    const status = await firestoreService.restore(JSON.parse(backupData), {
      dates: ['date'],
      geos: ['location'],
    });
    expect(status.status).ok;
  });

  it('Get all collections', async () => {
    try {
      const all = await firestoreService.backups();
      expect(Object.keys(all).length).is.greaterThan(0);
    } catch (error) {
      console.log(error);
    }
  });

  it('Get an array of collections', async () => {
    const all = await firestoreService.backups(['test', 'users']);
    expect(Object.keys(all).length).is.equal(2);
  });

  it('Restore data with document id - without autoParseDates', async () => {
    let status = await firestoreService.restore(
      'test/import-to-firestore.json',
      {
        dates: ['date', 'schedule.time', 'three.level.time'],
        geos: ['location', 'locations', 'locationNested.geopoints'],
        refs: ['secondRef', 'arrayRef', 'nestedRef.secondRef'],
      }
    );
    expect(status.status).ok;

    const result = await firestoreService.backup('test');

    expect(result.test['first-key'].email).is.equal('dungnq@itbox4vn.com');
    expect(result.test['first-key'].schedule.time._seconds).equals(1534046400);
    expect(result.test['first-key'].three.level.time._seconds).equals(
      1534046400
    );
    expect(typeof result.test['first-key'].secondRef).is.equal('object');
    // locations
    expect(result.test['first-key'].location._latitude).equal(49.290683);
    expect(result.test['first-key'].locations[0]._latitude).equal(50.290683);
    expect(result.test['first-key'].locations[1]._latitude).equal(51.290683);
    expect(result.test['first-key'].locationNested.geopoint._latitude).equal(
      49.290683
    );
    expect(
      result.test['first-key'].subCollection['test/first-key/details'][
        '33J2A10u5902CXagoBP6'
      ].dogName
    ).is.equal('hello');
  });

  it('Restore data with document id - with autoParseDates', async () => {
    let status = await firestoreService.restore(
      'test/import-to-firestore.json',
      {
        autoParseDates: true,
        geos: ['location', 'locations', 'locationNested.geopoints'],
        refs: ['secondRef', 'arrayRef', 'nestedRef.secondRef'],
      }
    );
    expect(status.status).ok;

    const result = await firestoreService.backup('test');

    expect(result.test['first-key'].email).is.equal('dungnq@itbox4vn.com');
    expect(result.test['first-key'].schedule.time._seconds).equals(1534046400);
    expect(result.test['first-key'].three.level.time._seconds).equals(
      1534046400
    );
    expect(typeof result.test['first-key'].secondRef).is.equal('object');
    // locations
    expect(result.test['first-key'].location._latitude).equal(49.290683);
    expect(result.test['first-key'].locations[0]._latitude).equal(50.290683);
    expect(result.test['first-key'].locations[1]._latitude).equal(51.290683);
    expect(result.test['first-key'].locationNested.geopoint._latitude).equal(
      49.290683
    );
    expect(
      result.test['first-key'].subCollection['test/first-key/details'][
        '33J2A10u5902CXagoBP6'
      ].dogName
    ).is.equal('hello');
  });

  it('Restore data as an array without document id', async () => {
    let status = await firestoreService.restore(
      'test/import-array-to-firestore.json'
    );
    expect(status.status).ok;
  });

  it('Get a colection with sub-collection', async () => {
    try {
      const data = await firestoreService.backup('test');
      const subCol = data['test']['first-key']['subCollection'];

      expect(subCol).is.exist;
      expect(Object.values(subCol).length).equals(2); // 2 sub collections
    } catch (error) {
      console.log(error);
    }
  });

  it('Export single document from all collections', async () => {
    try {
      const data = await firestoreService.backups(['test'], 1);
      expect(Object.values(data['test']).length).equals(1); // 1 document
    } catch (error) {
      console.log(error);
    }
  });

  it('Test auto parse dates option - simple', async () => {
    const data = {
      date: {
        _seconds: 1534046400,
        _nanoseconds: 0,
      },
    };
    parseAndConvertDates(data);
    expect(data.date).to.be.an.instanceOf(Date);
  });

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
    };
    parseAndConvertDates(data);
    expect(data.date).to.be.an.instanceOf(Date);
    expect(data.obj.anotherObj.date).to.be.an.instanceOf(Date);
  });

  it('Test auto parse dates option - nested arrays', async () => {
    const data = {
      arr: [
        {
          _seconds: 1534046400,
          _nanoseconds: 0,
        },
      ],
    };
    parseAndConvertDates(data);
    expect(data.arr[0]).to.be.an.instanceOf(Date);
  });

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
    };
    parseAndConvertDates(data);
    expect(data.arr[0].obj.date).to.be.an.instanceOf(Date);
    expect(data.arr[1].obj.date).to.be.an.instanceOf(Date);
  });
});
