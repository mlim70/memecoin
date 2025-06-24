const { updateAllUserBalances } = require('../src/utils/firestoreUser');
const admin = require('firebase-admin');
const serviceAccount = require('../path/to/your/serviceAccountKey.json'); // <-- update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

(async () => {
  await updateAllUserBalances();
  console.log('All user balances updated!');
  process.exit(0);
})(); 