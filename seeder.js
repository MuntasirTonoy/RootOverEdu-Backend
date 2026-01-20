const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const fs = require("fs");
const connectDB = require("./config/db");
const Course = require("./models/Course");
const Subject = require("./models/Subject");

const seedData = async () => {
  try {
    await connectDB();

    const jsonPath = path.join(
      __dirname,
      "../jsondata/deepseek_json_20260120_7e1ba6.json",
    );
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const subjectsData = JSON.parse(rawData);

    console.log(`Loaded ${subjectsData.length} subjects from JSON.`);

    // Cache for courses to avoid repeated lookups
    const courseCache = new Map();

    for (const sub of subjectsData) {
      const { department, yearLevel, title, code, originalPrice, offerPrice } =
        sub;
      const courseTitle = `${department} ${yearLevel}`;

      let courseId = courseCache.get(courseTitle);

      if (!courseId) {
        let course = await Course.findOne({ title: courseTitle });
        if (!course) {
          course = await Course.create({
            title: courseTitle,
            department: department,
            yearLevel: yearLevel,
            thumbnail:
              "https://via.placeholder.com/300?text=" +
              encodeURIComponent(courseTitle),
          });
          console.log(`Created Course: ${courseTitle}`);
        }
        courseId = course._id;
        courseCache.set(courseTitle, courseId);
      }

      const subjectExists = await Subject.findOne({
        code: code,
        courseId: courseId,
      });

      if (!subjectExists) {
        await Subject.create({
          title: title,
          code: code,
          courseId: courseId,
          originalPrice: originalPrice || 1000,
          offerPrice: offerPrice || 500,
          department: department, // Added based on schema
          yearLevel: yearLevel, // Added based on schema
        });
        console.log(`  Added Subject: [${code}] ${title}`);
      } else {
        console.log(`  Subject exists: [${code}] ${title}`);
      }
    }

    console.log("Seeding Complete");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
