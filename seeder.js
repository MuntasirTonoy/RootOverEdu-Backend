require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Course = require('./models/Course');
const Subject = require('./models/Subject');

const nuData = {
  Mathematics: {
    "1st Year": [
      { code: "213701", title: "Fundamentals of Mathematics" },
      { code: "213703", title: "Calculus-I" },
      { code: "213705", title: "Linear Algebra" },
      { code: "213707", title: "Analytic and Vector Geometry" },
    ],
    "2nd Year": [
      { code: "223701", title: "Calculus-II" },
      { code: "223703", title: "Ordinary Differential Equations" },
      { code: "223705", title: "Computer Programming (Fortran)" },
      { code: "223706", title: "Math Lab (Practical)" },
    ],
    "3rd Year": [
      { code: "233701", title: "Abstract Algebra" },
      { code: "233703", title: "Real Analysis" },
      { code: "233705", title: "Numerical Analysis" },
      { code: "233707", title: "Complex Analysis" },
      { code: "233709", title: "Differential Geometry" },
      { code: "233711", title: "Mechanics" },
      { code: "233713", title: "Linear Programming" },
      { code: "233714", title: "Math Lab (Practical)" },
    ],
    "4th Year": [
      { code: "243701", title: "Theory of Numbers" },
      { code: "243703", title: "Topology & Functional Analysis" },
      { code: "243705", title: "Methods of Applied Mathematics" },
      { code: "243707", title: "Tensor Analysis" },
      { code: "243709", title: "Partial Differential Equations" },
      { code: "243711", title: "Hydrodynamics" },
      { code: "243713", title: "Discrete Mathematics" },
      { code: "243715", title: "Astronomy" },
      { code: "243717", title: "Mathematical Modeling in Biology" },
    ],
  },
  Physics: {
    "1st Year": [
      { code: "212701", title: "Mechanics" },
      { code: "212703", title: "Properties of Matter, Waves & Oscillations" },
      { code: "212705", title: "Heat, Thermodynamics and Radiation" },
      { code: "212706", title: "Physics Practical-I" },
    ],
    "2nd Year": [
      { code: "222701", title: "Electricity & Magnetism" },
      { code: "222703", title: "Geometrical & Physical Optics" },
      { code: "222705", title: "Classical Mechanics" },
      { code: "222706", title: "Physics Practical-II" },
    ],
    "3rd Year": [
      { code: "232701", title: "Atomic & Molecular Physics" },
      { code: "232703", title: "Quantum Mechanics-I" },
      { code: "232705", title: "Computer Fundamentals and Numerical Analysis" },
      { code: "232707", title: "Electronics-I" },
      { code: "232709", title: "Nuclear Physics-I" },
      { code: "232711", title: "Solid State Physics-I" },
      { code: "232713", title: "Mathematical Physics" },
      { code: "232714", title: "Physics Practical-III" },
    ],
    "4th Year": [
      { code: "242701", title: "Nuclear Physics-II" },
      { code: "242703", title: "Solid State Physics-II" },
      { code: "242705", title: "Quantum Mechanics-II" },
      { code: "242707", title: "Electronics-II" },
      { code: "242709", title: "Classical Electrodynamics" },
      { code: "242711", title: "Statistical Mechanics" },
      { code: "242713", title: "Computer Application and Programming" },
      { code: "242715", title: "Theory of Relativity and Cosmology" },
      { code: "242716", title: "Physics Practical-IV" },
    ],
  },
};

const seedData = async () => {
    try {
        await connectDB();

        for (const [department, years] of Object.entries(nuData)) {
            for (const [yearLevel, subjects] of Object.entries(years)) {
                
                // Create or Find Course
                const courseTitle = `${department} ${yearLevel}`;
                let course = await Course.findOne({ title: courseTitle });

                if (!course) {
                    course = await Course.create({
                        title: courseTitle,
                        department: department,
                        yearLevel: yearLevel,
                        thumbnail: 'https://via.placeholder.com/300?text=' + encodeURIComponent(courseTitle), // Placeholder
                    });
                    console.log(`Created Course: ${courseTitle}`);
                } else {
                    console.log(`Course exists: ${courseTitle}`);
                }

                // Create Subjects
                for (const sub of subjects) {
                    const subjectExists = await Subject.findOne({ code: sub.code, courseId: course._id });

                    if (!subjectExists) {
                        await Subject.create({
                            title: sub.title,
                            code: sub.code,
                            courseId: course._id,
                            originalPrice: 1000, // Default
                            offerPrice: 500, // Default
                        });
                        console.log(`  Added Subject: [${sub.code}] ${sub.title}`);
                    } else {
                        console.log(`  Subject exists: [${sub.code}] ${sub.title}`);
                    }
                }
            }
        }

        console.log('Seeding Complete');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
