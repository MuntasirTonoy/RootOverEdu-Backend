const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourse,
  getSubject,
  getVideos,
  purchaseSubjects,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/courses", getCourses);
router.get("/courses/:id", getCourse);
router.get("/subjects/:id", getSubject);
router.get("/videos/:subjectId", protect, getVideos);
router.post("/purchase", protect, purchaseSubjects);

module.exports = router;
