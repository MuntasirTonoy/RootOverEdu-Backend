const Course = require("../models/Course");
const Subject = require("../models/Subject");
const Video = require("../models/Video");
const User = require("../models/User");

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const rawCourses = await Course.find().populate("subjects.subjectId");

    // Transform to include code from populated subject
    const courses = rawCourses.map((course) => {
      const obj = course.toObject();
      obj.subjects = (obj.subjects || []).map((s) => ({
        ...s,
        code: s.subjectId ? s.subjectId.code : "N/A",
        // If title/price missing in embedded, fallback to subject doc?
        // The embedded is the "override", so we keep it.
        // But if embedded title is empty? We usually require it.
      }));
      return obj;
    });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single course and its subjects
// @route   GET /api/courses/:id
// @access  Public
// @desc    Get single course and its subjects
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "subjects.subjectId",
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let subjects = [];

    // Protocol 1: New "Bundle" Style (Embedded Array)
    if (course.subjects && course.subjects.length > 0) {
      subjects = course.subjects.map((item) => {
        // item is { subjectId: {...full subject doc}, title, originalPrice, offerPrice, _id }
        const subjectDetails = item.subjectId || {}; // content form populated doc
        return {
          _id: subjectDetails._id || item._id, // Use validated ID
          title: item.title || subjectDetails.title,
          code: subjectDetails.code,
          department: subjectDetails.department,
          yearLevel: subjectDetails.yearLevel,
          originalPrice: item.originalPrice ?? subjectDetails.originalPrice,
          offerPrice: item.offerPrice ?? subjectDetails.offerPrice,
          description:
            subjectDetails.description || "Comprehensive subject module",
          courseId: course._id,
        };
      });
    }

    // Protocol 2: Legacy Style (Foreign Key in Subject)
    // If no embedded subjects, check if there are subjects pointing to this course
    if (subjects.length === 0) {
      const legacySubjects = await Subject.find({ courseId: course._id });
      subjects = legacySubjects;
    }

    // Return combined data
    res.status(200).json({
      ...course.toObject(),
      subjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get subject details (including prices)
// @route   GET /api/subjects/:id
// @access  Public
// @desc    Get subject details (including prices)
// @route   GET /api/subjects/:id
// @access  Public
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(subject);
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(404)
        .json({ message: "Subject not found (Invalid ID)" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
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
      return res.status(404).json({ message: "Subject not found" });
    }

    // Get all videos for the subject
    const videos = await Video.find({ subjectId });

    // Filter videos: Allow if isFree OR user purchased the subject
    // Note: req.user is set by 'protect' middleware
    const user = req.user;

    // Check if user has purchased the subject
    // Ensure both are strings for comparison or ObjectIds.
    // user.purchasedSubjects is an array of ObjectIds.
    const hasPurchased = (user.purchasedSubjects || []).some(
      (id) => id.toString() === subjectId,
    );

    console.log(
      `getVideos: User ${user.email} Role: ${user.role} Subject: ${subjectId} Purchased: ${hasPurchased}`,
    );

    if (hasPurchased || user.role === "admin") {
      // Return all videos if purchased
      console.log(`Returning all ${videos.length} videos (Admin/Purchased)`);
      return res.status(200).json(videos);
    }

    // Filter only free videos if not purchased
    const allowedVideos = videos.filter((video) => video.isFree);

    res.status(200).json(allowedVideos);
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(404)
        .json({ message: "Subject not found (Invalid ID)" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Purchase subjects (Test Mode)
// @route   POST /api/purchase
// @access  Private
const purchaseSubjects = async (req, res) => {
  const { subjectIds } = req.body;
  const userId = req.user._id;

  if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
    return res.status(400).json({ message: "No subjects selected" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add unique subject IDs to purchasedSubjects
    // Using $addToSet to prevent duplicates
    await User.updateOne(
      { _id: userId },
      { $addToSet: { purchasedSubjects: { $each: subjectIds } } },
    );

    res.status(200).json({ message: "Purchase successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const toggleSavedVideo = async (req, res) => {
  const { videoId } = req.body;
  const userId = req.user._id;

  if (!videoId) {
    return res.status(400).json({ message: "Video ID is required" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSaved = user.savedVideos.includes(videoId);

    if (isSaved) {
      // Unsave
      await User.updateOne(
        { _id: userId },
        { $pull: { savedVideos: videoId } },
      );
      res
        .status(200)
        .json({ message: "Video removed from saved list", isSaved: false });
    } else {
      // Save
      await User.updateOne(
        { _id: userId },
        { $addToSet: { savedVideos: videoId } },
      );
      res.status(200).json({ message: "Video saved", isSaved: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get saved videos
// @route   GET /api/videos/saved
// @access  Private
const getSavedVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedVideos",
      populate: {
        path: "subjectId",
        select: "title courseId", // select fields needed for link
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.savedVideos);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all free videos
// @route   GET /api/free-videos
// @access  Public
const getFreeVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isFree: true }).populate({
      path: "subjectId",
      select: "title courseId",
    });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getCourses,
  getCourse,
  getSubject,
  getVideos,
  purchaseSubjects,
  toggleSavedVideo,
  getSavedVideos,
  getFreeVideos,
};
