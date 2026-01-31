const express = require("express");
const router = express.Router();
const {
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
  createBatchVideos,
  getEditLogById,
  updateEditLog,
} = require("../controllers/adminController");
const { protect, verifyAdmin } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect);
router.use(verifyAdmin);

router.get("/stats", getDashboardStats);

router.post("/course", createCourse);
router.get("/courses", getAllCourses);
router.put("/course/:id", updateCourse);
router.delete("/course/:id", deleteCourse);

// @route   POST /api/admin/subject
router.post("/subject", createSubject);
router.get("/subjects", getAllSubjects);
router.put("/subject/:id", updateSubject);
router.delete("/subject/:id", deleteSubject);

router.post("/video/batch", createBatchVideos);
router.post("/video", createVideo);
router.get("/videos", getAllVideos);
router.put("/video/:id", updateVideo);
router.delete("/video/:id", deleteVideo);

router.get("/edit-log/:id", getEditLogById);
router.put("/edit-log/:id", updateEditLog);

router.get("/users", getAllUsers);
router.put("/user/:id/role", updateUserRole);

const { updateSiteConfig } = require("../controllers/siteConfigController");
router.post("/config", updateSiteConfig);

module.exports = router;
