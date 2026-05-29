const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const wardenSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  hostelName: String,
  designation: String,
  isActive: { type: Boolean, default: true }
});

wardenSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Warden = mongoose.model('Warden', wardenSchema);

async function createWardens() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hostel-management');
    console.log('✅ Connected to MongoDB\n');

    // Delete old wardens
    const deleted = await Warden.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} old wardens\n`);

    // Create wardens
    const warden1 = new Warden({
      name: 'Mr. Rajesh Kumar',
      mobile: '9876543210',
      email: 'rajesh@hostel.com',
      password: 'warden@123',
      hostelName: 'Boys Hostel A',
      designation: 'Senior Hostel Warden',
      isActive: true
    });
    await warden1.save();
    console.log('✅ Warden 1 created:');
    console.log('   📱 Phone: 9876543210');
    console.log('   🔐 Password: warden@123\n');

    const warden2 = new Warden({
      name: 'Mrs. Priya Singh',
      mobile: '9876543211',
      email: 'priya@hostel.com',
      password: 'warden@123',
      hostelName: 'Girls Hostel B',
      designation: 'Hostel Warden',
      isActive: true
    });
    await warden2.save();
    console.log('✅ Warden 2 created:');
    console.log('   📱 Phone: 9876543211');
    console.log('   🔐 Password: warden@123\n');

    // Verify
    const count = await Warden.countDocuments();
    console.log(`📊 Total Wardens in DB: ${count}\n`);

    await mongoose.connection.close();
    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await mongoose.connection.close();
  }
}

createWardens();