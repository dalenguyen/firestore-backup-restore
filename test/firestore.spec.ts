import { expect } from 'chai';
import * as firestoreService from '../dist';
import { serviceAccount } from './serviceAccount';

const app = firestoreService.initializeApp(serviceAccount, serviceAccount.databaseUrl);

describe ('initializeApp function test', () => {
    it ('Initialize app', () => {        
        expect(app).to.equal(true);
    });

    it ('Get all collections', async () => {        
        const all = await firestoreService.backups();        
        expect(Object.keys(all).length).is.greaterThan(0);
    });

    it ('Get an array of collections', async () => {        
        const all = await firestoreService.backups(['test', 'users']);        
        expect(Object.keys(all).length).is.equal(2);    
    });   

    it ('Restore data', async () => {        
        await firestoreService.restore('test/import-to-firestore.json', ['date'], ['location']);     
        // const result = await firestoreService.backup('test', 'sub');        
        const result = await firestoreService.backup('test');
        expect(result.test['first-key'].email).is.equal('dungnq@itbox4vn.com');
    });

    it ('Get one collection', async () => {        
        // const result = await firestoreService.backup('test', 'sub');        
        const result = await firestoreService.backup('test'); 
        console.log(JSON.stringify(result));
        expect(Object.keys(result).length).is.equal(1);        
    });

})