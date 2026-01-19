const admin = require('../config/firebase');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify Firebase ID Token
      const decodedfToken = await admin.auth().verifyIdToken(token);
      
      // Get user from MongoDB using firebaseUid
      req.user = await User.findOne({ firebaseUid: decodedfToken.uid });

      if (!req.user) {
         // Optional: You might want to create the user here if they don't exist yet, 
         // but usually we want a specific 'sync' or 'register' endpoint to handle initial creation cleanly.
         // For now, fail if not found in our DB.
         return res.status(401).json({ message: 'User not found in database. Please sync/register.' });
      }

      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, verifyAdmin };
