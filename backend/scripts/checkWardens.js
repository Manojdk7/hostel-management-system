const mongoose = require('mongoose');
const Warden = require('../models/Warden');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const wardens = await Warden.find();
      
      if (wardens.length === 0) {
        console.log('❌ NO WARDENS FOUND IN DATABASE!');
        console.log('Creating wardens now...\n');
        
        const newWardens = [
          {
            name: 'Mr. Rajesh Kumar',
            mobile: '9876543210',
            email: 'rajesh@hostel.com',
            password: 'warden@123',
            hostelName: 'Boys Hostel A',
            designation: 'Senior Hostel Warden'
          },
          {
            name: 'Mrs. Priya Singh',
            mobile: '9876543211',
            email: 'priya@hostel.com',
            password: 'warden@123',
            hostelName: 'Girls Hostel B',
            designation: 'Hostel Warden'
          }
        ];

        for (const wardenData of newWardens) {
          const warden = new Warden(wardenData);
          await warden.save();
          console.log(`✅ Created: ${wardenData.name}`);
        }
      } else {
        console.log(`✅ Found ${wardens.length} wardens:\n`);
        wardens.forEach((w, i) => {
          console.log(`${i + 1}. Name: ${w.name}`);
          console.log(`   Phone: ${w.mobile}`);
          console.log(`   Email: ${w.email}`);
          console.log(`   Hostel: ${w.hostelName}\n`);
        });
      }

      mongoose.connection.close();
    } catch (err) {
      console.error('Error:', err.message);
      mongoose.connection.close();
    }
  })
  .catch(err => console.log('Database connection error:', err));