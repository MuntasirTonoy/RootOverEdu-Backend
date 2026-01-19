const admin = require('../config/firebase');
const User = require('../models/User');

// @desc    Sync user from Firebase to MongoDB (Login/Register)
// @route   POST /api/auth/sync
// @access  Protected (Valid Firebase Token required)
const syncUser = async (req, res) => {
  // req.user is set by the 'protect' middleware IF the user already exists in Mongo.
  // HOWEVER, for a new user, 'protect' might fail if we enforce Mongo existence there.
  // STRATEGY: 
  // 1. We can relax 'protect' middleware to NOT fail if user is missing in Mongo, BUT return a specific flag?
  // 2. OR, we can just verify the token MANUALLY in this controller to avoid the circular dependency of "need to be in mongo to hit the endpoint to put me in mongo".
  
  // Let's go with option 2: This endpoint should probably be "Public" in terms of Middleware, but we verify the token manually here.
  
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // User exists, update if needed (e.g. email/name changed in Firebase?)
      // For now, just return the user
      return res.json(user);
    }

    // Check if user exists by email (to avoid duplicate accounts if UID changes or different provider used)
    const userByEmail = await User.findOne({ email: email });

    if (userByEmail) {
      // User exists with this email but different UID (or clean sync).
      
      // checking if we should link the accounts (update firebaseUid)
      if (userByEmail.firebaseUid !== uid) {
            userByEmail.firebaseUid = uid;
            await userByEmail.save();
      }
      
      user = userByEmail;
      res.status(200).json(user);
    } else {
      // Create new user
      user = await User.create({
        name: name || 'New User',
        email: email,
        firebaseUid: uid,
        avatar: picture || 'avatar-1', // Use Firebase picture if available, else default
        role: 'user', // Default role
      });
      res.status(201).json(user);
    }
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // This uses the standard 'protect' middleware which ENSURES the user is in Mongo
    res.status(200).json(req.user);
};

module.exports = {
  syncUser,
  getMe,
};
