const fs = require("fs");
const path = require("path");

const keyPath = path.join(__dirname, "../serviceAccountKey.json");

try {
  if (!fs.existsSync(keyPath)) {
    console.error(`Error: Could not find ${keyPath}`);
    process.exit(1);
  }

  const keyContent = fs.readFileSync(keyPath, "utf8");
  // Ensure it's valid JSON first
  JSON.parse(keyContent);

  const base64Key = Buffer.from(keyContent).toString("base64");

  console.log(
    "\n✅ SUCCESS! Here is your Base64 encoded Service Account Key:\n",
  );
  console.log(base64Key);
  console.log("\n📋 INSTRUCTIONS:");
  console.log("1. Copy the long string above.");
  console.log("2. Go to your Vercel Project Settings > Environment Variables.");
  console.log("3. Find FIREBASE_SERVICE_ACCOUNT and edit it.");
  console.log("4. Paste this validation string as the value.");
  console.log("5. Save and Redeploy your backend.");
} catch (error) {
  console.error("Error:", error.message);
}
