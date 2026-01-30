const mongoose = require("mongoose");

const SiteConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // e.g., 'homepage_banner', 'about_page'
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SiteConfig", SiteConfigSchema);
