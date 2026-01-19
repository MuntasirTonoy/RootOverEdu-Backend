const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const Subject = require('../models/Subject');
const Course = require('../models/Course');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const subjects = await Subject.find({});
        console.log(`Found ${subjects.length} subjects to check/update.`);

        let updatedCount = 0;

        for (const subject of subjects) {
            if (!subject.courseId) {
                console.warn(`Subject ${subject.title} has no courseId. Skipping.`);
                continue;
            }

            const course = await Course.findById(subject.courseId);
            if (!course) {
                console.warn(`Course not found for subject ${subject.title} (ID: ${subject.courseId}). Skipping.`);
                continue;
            }

            let needsUpdate = false;

            if (!subject.department) {
                subject.department = course.department;
                needsUpdate = true;
            }

            if (!subject.yearLevel) {
                subject.yearLevel = course.yearLevel;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await subject.save();
                console.log(`Updated subject: ${subject.title} -> ${subject.department}, ${subject.yearLevel}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} subjects.`);
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
