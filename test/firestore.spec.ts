import { expect } from 'chai';
import request from 'request-promise';
import * as firestoreService from '../dist';
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

  it('Get a colection with sub-collection', async () => {
    try {
      const data = await firestoreService.backup('test');
      const subCol = data['test']['first-key']['subCollection'];

      expect(subCol).is.exist;
      expect(Object.values(subCol).length).is.greaterThan(0);
    } catch (error) {
      console.log(error);
    }
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

  it('Restore data', async () => {
    let status = await firestoreService.restore(
      'test/import-to-firestore.json',
      ['date', 'schedule.time', 'three.level.time'],
      ['location']
    );
    expect(status.status).ok;

    const result = await firestoreService.backup('test');
    expect(result.test['first-key'].email).is.equal('dungnq@itbox4vn.com');
    expect(result.test['first-key'].schedule.time._seconds).equals(1534046400);
  });

  it('Restore data from API', async () => {
    const backupData = await request(backupAPI);
    const status = await firestoreService.restore(
      JSON.parse(backupData),
      ['date'],
      ['location']
    );
    expect(status.status).ok;
  });

  it('Get one collection', async () => {
    const result = await firestoreService.backup('test');
    expect(Object.keys(result).length).is.equal(1);
  });
});
