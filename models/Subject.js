const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: false,
  },
  department: {
    type: String,
    required: true,
  },
  yearLevel: {
    type: String, // e.g., "1st Year", "2nd Year"
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  offerPrice: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subject', subjectSchema);
