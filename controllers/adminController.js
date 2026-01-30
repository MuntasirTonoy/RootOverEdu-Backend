const Course = require("../models/Course");
const Subject = require("../models/Subject");
const Video = require("../models/Video");
const User = require("../models/User");

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalVideos = await Video.countDocuments();
    const purchasedCourseStudent = await User.countDocuments({
      purchasedSubjects: { $exists: true, $not: { $size: 0 } },
    });

    res.json({
      totalUsers,
      totalCourses,
      totalVideos,
      purchasedCourseStudent,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/admin/course
// @access  Private/Admin
const createCourse = async (req, res) => {
  const { title, department, yearLevel, thumbnail, subjects } = req.body;

  if (!title || !department || !yearLevel || !thumbnail) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    // Create the course with embedded subjects
    const course = await Course.create({
      title,
      department,
      yearLevel,
      thumbnail,
      subjects: subjects || [],
    });

    // Update prices in the original Subject collection
    if (subjects && subjects.length > 0) {
      for (const s of subjects) {
        if (
          s.subjectId &&
          s.originalPrice !== undefined &&
          s.originalPrice !== null &&
          s.offerPrice !== undefined &&
          s.offerPrice !== null
        ) {
          await Subject.findByIdAndUpdate(s.subjectId, {
            originalPrice: s.originalPrice,
            offerPrice: s.offerPrice,
          });
        }
      }
    }

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/admin/course/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    console.log(`Updating course ${req.params.id}`);
    const course = await Course.findById(req.params.id);

    if (course) {
      course.title = req.body.title || course.title;
      course.department = req.body.department || course.department;
      course.yearLevel = req.body.yearLevel || course.yearLevel;
      course.thumbnail = req.body.thumbnail || course.thumbnail;

      if (req.body.subjects) {
        console.log("Updating subjects:", req.body.subjects.length);
        course.subjects = req.body.subjects;

        // Update prices in the original Subject collection
        for (const s of req.body.subjects) {
          console.log(`Checking subject ${s.subjectId} for price update...`);
          if (
            s.subjectId &&
            s.originalPrice !== undefined &&
            s.originalPrice !== null &&
            s.offerPrice !== undefined &&
            s.offerPrice !== null
          ) {
            console.log(
              `Updating price for subject ${s.subjectId}: ${s.originalPrice} / ${s.offerPrice}`,
            );
            await Subject.findByIdAndUpdate(s.subjectId, {
              originalPrice: s.originalPrice,
              offerPrice: s.offerPrice,
            });
          } else {
            console.log(
              `Skipping subject ${s.subjectId} - Missing or invalid price data`,
            );
          }
        }
      }

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
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
      res.json({ message: "Course removed" });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new subject
// @route   POST /api/admin/subject
// @access  Private/Admin
const createSubject = async (req, res) => {
  const {
    title,
    code,
    department,
    yearLevel,
    courseId,
    originalPrice,
    offerPrice,
  } = req.body;

  if (
    !title ||
    !courseId ||
    !originalPrice ||
    !offerPrice ||
    !department ||
    !yearLevel
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const subject = await Subject.create({
      title,
      code,
      department,
      yearLevel,
      courseId,
      originalPrice,
      offerPrice,
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private/Admin
const getAllSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Subject.countDocuments();
    const subjects = await Subject.find({})
      .populate("courseId", "title")
      .skip(skip)
      .limit(limit);

    res.json({
      data: subjects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a subject
// @route   PUT /api/admin/subject/:id
// @access  Private/Admin
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      subject.title = req.body.title || subject.title;
      subject.code = req.body.code || subject.code;
      subject.department = req.body.department || subject.department;
      subject.yearLevel = req.body.yearLevel || subject.yearLevel;
      subject.courseId = req.body.courseId || subject.courseId;
      subject.originalPrice = req.body.originalPrice || subject.originalPrice;
      subject.offerPrice = req.body.offerPrice || subject.offerPrice;

      const updatedSubject = await subject.save();
      res.json(updatedSubject);
    } else {
      res.status(404).json({ message: "Subject not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/admin/subject/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      await subject.deleteOne();
      res.json({ message: "Subject removed" });
    } else {
      res.status(404).json({ message: "Subject not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new video
// @route   POST /api/admin/video
// @access  Private/Admin
const createVideo = async (req, res) => {
  const {
    title,
    subjectId,
    partNumber,
    noteLink,
    isFree,
    videoUrl,
    chapterName,
    description,
  } = req.body;

  if (!title || !subjectId || !partNumber || !videoUrl || !chapterName) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const video = await Video.create({
      title,
      videoUrl,
      subjectId,
      partNumber,
      noteLink,
      chapterName,
      description,
      isFree: isFree === "true" || isFree === true, // Handle form-data string or JSON
    });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all videos
// @route   GET /api/admin/videos
// @access  Private/Admin
const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Video.countDocuments();
    const videos = await Video.find({})
      .populate({
        path: "subjectId",
        populate: { path: "courseId" },
      })
      .skip(skip)
      .limit(limit);

    res.json({
      data: videos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllVideos:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
      video.description = req.body.description || video.description;
      if (req.body.isFree !== undefined) {
        video.isFree = req.body.isFree === "true" || req.body.isFree === true;
      }

      const updatedVideo = await video.save();
      res.json(updatedVideo);
    } else {
      res.status(404).json({ message: "Video not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
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
      res.json({ message: "Video removed" });
    } else {
      res.status(404).json({ message: "Video not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit);

    res.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
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
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createCourse,
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
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
