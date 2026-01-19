const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    default: 'avatar-1', // Default avatar
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  purchasedSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
