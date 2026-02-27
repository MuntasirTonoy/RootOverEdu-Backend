const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Removed password field as Auth is handled by Firebase
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String, // Predefined avatar string/ID selected by user
      default: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix", // Default avatar URL
    },
    institution: { type: String, default: "" },
    mobile: { type: String, default: "" },
    gender: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    purchasedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    savedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
