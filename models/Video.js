const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    chapterName: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true, // URL from Cloudinary (or S3)
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    partNumber: {
      type: Number,
      required: true,
    },
    noteLink: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    editLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EditLog",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Video", videoSchema);
