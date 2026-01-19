const admin = require('firebase-admin');

let serviceAccount;
try {
  // Check in parent directory (backend root)
  serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
  console.warn("⚠️  WARNING: serviceAccountKey.json not found in backend root. Firebase Admin is running in MOCK MODE.");
}

if (serviceAccount) {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized via config/firebase.js");
  }
} else {
  // Mock implementation for development without credentials
  const mockAdmin = {
    auth: () => ({
      verifyIdToken: async (token) => {
        console.log(' [Mock Auth] Verifying mock token:', token);
        if (token === 'invalid') throw new Error('Invalid mock token');
        return {
          uid: 'mock-uid-123',
          email: 'mock@example.com',
          name: 'Mock User',
          picture: 'https://via.placeholder.com/150',
        };
      }
    })
  };

  module.exports = mockAdmin;
}

if (serviceAccount) {
    module.exports = admin;
}
