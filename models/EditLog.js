const mongoose = require("mongoose");

const editLogSchema = new mongoose.Schema(
  {
    chapterName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    yearLevel: {
      type: String,
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    videoIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  {
    timestamps: true,
    collection: "editLogsData",
  },
);

module.exports = mongoose.model("EditLog", editLogSchema);
