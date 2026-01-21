const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourse,
  getSubject,
  getVideos,
  purchaseSubjects,
  toggleSavedVideo,
  getSavedVideos,
  getFreeVideos,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/free-videos", getFreeVideos);
router.get("/courses", getCourses);
router.get("/courses/:id", getCourse);
router.get("/subjects/:id", getSubject);
router.get("/videos/:subjectId", protect, getVideos);
router.post("/purchase", protect, purchaseSubjects);
router.post("/save-video", protect, toggleSavedVideo);
router.get("/saved-videos", protect, getSavedVideos);

module.exports = router;
