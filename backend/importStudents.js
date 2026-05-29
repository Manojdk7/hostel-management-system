const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

const students = [
  {
    name: 'Manoj D K',
    mobile: '9113832072',
    email: 'manojdk1825@.com',
    password: 'Manoj@123',
    hostelName: 'Boys Hostel A',
    roomNumber: 'A-101'
  },
  {
    name: 'Priya Sharma',
    mobile: '9876543221',
    email: 'priya@student.com',
    password: 'student@123',
    hostelName: 'Girls Hostel B',
    roomNumber: 'B-101'
  },
  {
    name: 'Amit Patel',
    mobile: '9876543222',
    email: 'amit@student.com',
    password: 'student@123',
    hostelName: 'Boys Hostel A',
    roomNumber: 'A-102'
  },
  {
    name: 'Neha Gupta',
    mobile: '9876543223',
    email: 'neha@student.com',
    password: 'student@123',
    hostelName: 'Girls Hostel B',
    roomNumber: 'B-102'
  }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    try {
      let created = 0;
      let skipped = 0;

      for (const studentData of students) {
        const exists = await Student.findOne({
          $or: [{ mobile: studentData.mobile }, { email: studentData.email }]
        });

        if (exists) {
          console.log(`⏭️  Skipped: ${studentData.name} (already exists)`);
          skipped++;
          continue;
        }

        const student = new Student({
          studentId: `STU${Date.now()}_${created}`,
          ...studentData,
          hostelLatitude: 28.5244,
          hostelLongitude: 77.1855,
          allowedRadius: 2000
        });

        await student.save();
        console.log(`✅ Created: ${studentData.name} (${studentData.mobile})`);
        created++;
      }

      console.log(`\n📊 Summary:`);
      console.log(`   Created: ${created}`);
      console.log(`   Skipped: ${skipped}`);
      console.log(`   Total in DB: ${await Student.countDocuments()}\n`);
      
      mongoose.connection.close();
    } catch (err) {
      console.error('❌ Error:', err.message);
      mongoose.connection.close();
    }
  })
  .catch(err => console.log('❌ DB Error:', err));