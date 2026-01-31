const mongoose = require("mongoose");
require("dotenv").config();

const EditLog = require("./models/EditLog");

async function checkEditLog() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const editLogId = "697e19abc9c4f26399c1d41a";
    const editLog = await EditLog.findById(editLogId);

    if (editLog) {
      console.log("EditLog found:");
      console.log(JSON.stringify(editLog, null, 2));
    } else {
      console.log("EditLog not found with ID:", editLogId);

      // Check all EditLogs
      const allEditLogs = await EditLog.find({});
      console.log(`Total EditLogs in collection: ${allEditLogs.length}`);
      if (allEditLogs.length > 0) {
        console.log("Latest EditLog:");
        console.log(
          JSON.stringify(allEditLogs[allEditLogs.length - 1], null, 2),
        );
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkEditLog();
