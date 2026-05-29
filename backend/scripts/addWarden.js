const mongoose = require('mongoose');
const Warden = require('../models/Warden');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Create sample wardens
      const wardens = [
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

      for (const wardenData of wardens) {
        const existingWarden = await Warden.findOne({ mobile: wardenData.mobile });
        
        if (!existingWarden) {
          const warden = new Warden(wardenData);
          await warden.save();
          console.log(`✅ Warden created: ${wardenData.name} (${wardenData.mobile})`);
        } else {
          console.log(`⚠️ Warden already exists: ${wardenData.name}`);
        }
      }

      console.log('\n📋 Warden Login Credentials:');
      console.log('────────────────────────────');
      console.log('Warden 1:');
      console.log('  Phone: 9876543210');
      console.log('  Password: warden@123');
      console.log('\nWarden 2:');
      console.log('  Phone: 9876543211');
      console.log('  Password: warden@123');

      mongoose.connection.close();
    } catch (err) {
      console.error('Error:', err.message);
      mongoose.connection.close();
    }
  })
  .catch(err => console.log('Database connection error:', err));