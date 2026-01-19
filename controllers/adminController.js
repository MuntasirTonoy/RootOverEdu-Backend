const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Video = require('../models/Video');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalVideos = await Video.countDocuments();

    res.json({
      totalUsers,
      totalCourses,
      totalVideos,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/admin/course
// @access  Private/Admin
const createCourse = async (req, res) => {
  const { title, department, yearLevel, thumbnail } = req.body;

  if (!title || !department || !yearLevel || !thumbnail) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    const course = await Course.create({
      title,
      department,
      yearLevel,
      thumbnail,
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private/Admin
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/admin/course/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      course.title = req.body.title || course.title;
      course.department = req.body.department || course.department;
      course.yearLevel = req.body.yearLevel || course.yearLevel;
      course.thumbnail = req.body.thumbnail || course.thumbnail;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/admin/course/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new subject
// @route   POST /api/admin/subject
// @access  Private/Admin
const createSubject = async (req, res) => {
  const { title, courseId, originalPrice, offerPrice } = req.body;

  if (!title || !courseId || !originalPrice || !offerPrice) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const subject = await Subject.create({
      title,
      courseId,
      originalPrice,
      offerPrice,
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private/Admin
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({}).populate('courseId', 'title');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new video
// @route   POST /api/admin/video
// @access  Private/Admin
const createVideo = async (req, res) => {
  const { title, subjectId, partNumber, noteLink, isFree, videoUrl, chapterName } = req.body;
  
  if (!title || !subjectId || !partNumber || !videoUrl || !chapterName) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const video = await Video.create({
      title,
      videoUrl,
      subjectId,
      partNumber,
      noteLink,
      chapterName,
      isFree: isFree === 'true' || isFree === true, // Handle form-data string or JSON
    });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all videos
// @route   GET /api/admin/videos
// @access  Private/Admin
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({}).populate('subjectId', 'title');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a video
// @route   PUT /api/admin/video/:id
// @access  Private/Admin
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (video) {
        video.title = req.body.title || video.title;
        video.videoUrl = req.body.videoUrl || video.videoUrl;
        video.subjectId = req.body.subjectId || video.subjectId;
        video.partNumber = req.body.partNumber || video.partNumber;
        video.noteLink = req.body.noteLink || video.noteLink;
        video.chapterName = req.body.chapterName || video.chapterName;
        if(req.body.isFree !== undefined) {
             video.isFree = req.body.isFree === 'true' || req.body.isFree === true;
        }

      const updatedVideo = await video.save();
      res.json(updatedVideo);
    } else {
      res.status(404).json({ message: 'Video not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a video
// @route   DELETE /api/admin/video/:id
// @access  Private/Admin
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (video) {
      await video.deleteOne();
      res.json({ message: 'Video removed' });
    } else {
      res.status(404).json({ message: 'Video not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/user/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = req.body.role;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createCourse,
  createSubject,
  getAllSubjects,
  createVideo,
  getDashboardStats,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getAllVideos,
  updateVideo,
  deleteVideo,
  getAllUsers,
  updateUserRole,
};

