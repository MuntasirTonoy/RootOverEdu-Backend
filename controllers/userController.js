const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Video = require('../models/Video');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single course and its subjects
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get subjects for this course
    const subjects = await Subject.find({ courseId: course._id });

    // Return combined data
    res.status(200).json({
      ...course.toObject(),
      subjects
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get subject details (including prices)
// @route   GET /api/subjects/:id
// @access  Public
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get videos for a subject
// @route   GET /api/videos/:subjectId
// @access  Private
const getVideos = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Get all videos for the subject
    const videos = await Video.find({ subjectId });

    // Filter videos: Allow if isFree OR user purchased the subject
    // Note: req.user is set by 'protect' middleware
    const user = req.user;
    
    // Check if user has purchased the subject
    // Ensure both are strings for comparison or ObjectIds.
    // user.purchasedSubjects is an array of ObjectIds.
    const hasPurchased = user.purchasedSubjects.some(
      (id) => id.toString() === subjectId
    );

    if (hasPurchased) {
      // Return all videos if purchased
      return res.status(200).json(videos);
    } 

    // Filter only free videos if not purchased
    // Actually, the prompt says "Only allow if isFree: true OR if the user has this subjectId...".
    // This implies if I request the list, I should see what I am allowed to see? 
    // Or does it mean the endpoint itself is protected and I can't even see the LIST?
    // "GET /api/videos/:subjectId: Protected (Only allow if isFree: true OR if the user has this subjectId...)"
    // It's ambiguous. Usually you return the list but some URLs might be hidden or blocked. 
    // BUT the requirement says "Protected (Only allow if ...)" suggesting access control mechanism.
    // However, if there are free videos in the subject, a non-purchaser SHOULD be able to see them.
    // So I will return the list of videos BUT filter them based on access?
    // OR does it mean I request a specific video? No, it says /videos/:subjectId (plural), so it matches a list.
    
    // I will return ONLY the videos the user is allowed to see.
    const allowedVideos = videos.filter(video => video.isFree);
    
    // If user has not purchased and there are no free videos, they might get an empty list, 
    // OR we could throw 403 if they strictly want access to the premium ones, but this is a list endpoint.
    // I will return the allowed videos (free ones).
    // If the requirement meant "Access to the page of videos", then if there is at least one free video, they can access the page.
    
    res.status(200).json(allowedVideos);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getCourses,
  getCourse,
  getSubject,
  getVideos,
};
