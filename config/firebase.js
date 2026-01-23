const admin = require("firebase-admin");

let serviceAccount;

// Try to get service account from Env Var (Production/Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    console.log("Checking FIREBASE_SERVICE_ACCOUNT...");
    console.log(
      `Length of env var: ${process.env.FIREBASE_SERVICE_ACCOUNT.length}`,
    );

    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log(
      "✅ Firebase Admin: Using credentials from FIREBASE_SERVICE_ACCOUNT env var",
    );
  } catch (e) {
    console.error(
      "❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var",
      e.message,
    );
    // Log the first few characters to see if it looks like JSON
    console.error(
      "First 50 chars:",
      process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 50),
    );
  }
}
// Try to get from file (Local)
else {
  try {
    serviceAccount = require("../serviceAccountKey.json");
    console.log(
      "✅ Firebase Admin: Using credentials from local serviceAccountKey.json",
    );
  } catch (error) {
    console.warn(
      "⚠️  WARNING: No Firebase credentials found (missing env var and serviceAccountKey.json).",
    );
  }
}

if (serviceAccount) {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🚀 Firebase Admin initialized successfully.");
  }
  module.exports = admin;
} else {
  // Mock implementation for development without credentials
  console.log(
    "🚨 Firebase Admin: RUNNING IN MOCK MODE. Real authentication will not work.",
  );
  const mockAdmin = {
    auth: () => ({
      verifyIdToken: async (token) => {
        console.log(" [Mock Auth] Verifying mock token:", token);
        if (token === "invalid") throw new Error("Invalid mock token");
        return {
          uid: "mock-uid-123",
          email: "mock@example.com",
          name: "Mock User",
          picture: "https://via.placeholder.com/150",
        };
      },
    }),
  };

  module.exports = mockAdmin;
}
