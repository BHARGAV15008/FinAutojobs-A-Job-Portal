import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseApp;

const initializeFirebase = async () => {
  if (!firebaseApp) {
    try {
      // Try to load service account from environment variable (for production)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase initialized with service account from environment');
      } 
      // Try to load from file (for development)
      else if (process.env.NODE_ENV === 'development') {
        try {
          const { createRequire } = await import('module');
          const require = createRequire(import.meta.url);
          const serviceAccount = require('../firebase-service-account.json');
          firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('✅ Firebase initialized with service account file');
        } catch (fileError) {
          console.log('⚠️ Firebase service account file not found. Phone verification will be disabled.');
          console.log('📋 To enable phone verification:');
          console.log('   1. Download service account JSON from Firebase Console');
          console.log('   2. Save as firebase-service-account.json in backend folder');
          console.log('   3. Add to .gitignore for security');
          return null;
        }
      } else {
        console.log('❌ Firebase service account not configured for production');
        return null;
      }
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error.message);
      return null;
    }
  }
  return firebaseApp;
};

// Get Firebase Admin instance
const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

// Verify Firebase ID Token
const verifyIdToken = async (idToken) => {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error('Firebase not initialized. Phone verification unavailable.');
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase ID token: ' + error.message);
  }
};

export {
  initializeFirebase,
  getFirebaseAdmin,
  verifyIdToken
};
