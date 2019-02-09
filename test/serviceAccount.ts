const serviceAccountJson = process.env.TYPE === undefined ? require('./serviceAccountKey.json') : {};

// Windows doesn't recognize source command for setting environment
export const serviceAccount =  process.env.TYPE === undefined ? serviceAccountJson : {
    "type": process.env.TYPE,
    "projectId": process.env.PROJECT_ID,
    "privateKeyId": process.env.PRIVATE_KEY_ID,
    "privateKey": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    "clientEmail": process.env.CLIENT_EMAIL,
    "clientId": process.env.CLIENT_ID,
    "authURI": process.env.AUTH_URI,
    "tokenURI": process.env.TOKEN_URI,
    "authProviderX509CertURL": process.env.AUTH_PROVIDER_X509_CERT_URL,
    "clientX509CertURL": process.env.CLIENT_X509_CERT_URL,
    "databaseURL": process.env.DATABASE_URL
}