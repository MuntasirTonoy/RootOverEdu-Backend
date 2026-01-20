const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Subject = require("../models/Subject");

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const seedSubjects = async () => {
  try {
    // 1. Read Courses to map IDs
    const coursesPath = path.join(
      __dirname,
      "../../jsondata/edtech-lms.courses.json",
    );
    if (!fs.existsSync(coursesPath)) {
      throw new Error("Courses file not found at: " + coursesPath);
    }
    const coursesRaw = JSON.parse(fs.readFileSync(coursesPath, "utf-8"));

    // Create a map: "Department-Year" -> CourseID
    const courseMap = {};
    coursesRaw.forEach((c) => {
      const cId = c._id?.$oid || c._id;
      const key = `${c.department}-${c.yearLevel}`;
      courseMap[key] = cId;
    });

    console.log("Course Map Created:", courseMap);

    // 2. Read Deepseek Subjects (Source)
    // We favor the file that has no IDs, to act as a fresh data source, mapped to real course IDs.
    const subjectsPath = path.join(
      __dirname,
      "../../jsondata/deepseek_json_20260120_7e1ba6.json",
    );
    if (!fs.existsSync(subjectsPath)) {
      throw new Error("Subjects file not found: " + subjectsPath);
    }
    const subjectsRaw = JSON.parse(fs.readFileSync(subjectsPath, "utf-8"));

    // 3. Transform and Map
    const subjectsToSeed = subjectsRaw
      .map((sub) => {
        // Normalize department name if needed
        const dept = sub.department;
        const year = sub.yearLevel;
        const key = `${dept}-${year}`;
        const courseId = courseMap[key];

        if (!courseId) {
          console.warn(
            `Warning: No course found for subject: ${sub.title} (${key})`,
          );
          return null; // Skip this subject if we can't link it to a course
        }

        return {
          ...sub,
          courseId: courseId, // Assign mapped course ID
          // Ensure fields match schema
          originalPrice: Number(sub.originalPrice),
          offerPrice: Number(sub.offerPrice),
        };
      })
      .filter(Boolean);

    console.log(
      `Prepared ${subjectsToSeed.length} ${subjectsRaw.length} subjects for seeding.`,
    );

    // 4. Seed
    const ops = subjectsToSeed.map((sub) => ({
      updateOne: {
        filter: { code: sub.code }, // Use Code as unique identifier to update/upsert
        update: { $set: sub },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      const result = await Subject.bulkWrite(ops);
      console.log("Bulk write result:", result);
    } else {
      console.log("No subjects matched to courses, nothing to seed.");
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding subjects:", error);
    process.exit(1);
  }
};

seedSubjects();
