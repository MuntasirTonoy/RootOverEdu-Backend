const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
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
  thumbnail: {
    type: String,
    required: true, // URL from Cloudinary
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', courseSchema);
