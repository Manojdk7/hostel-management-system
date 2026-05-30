const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const result = await Student.updateMany({}, {
      $set: {
        hostelLatitude: 14.4644,
        hostelLongitude: 75.9217,
        allowedRadius: 20000 // 20km
      }
    });
    console.log(`Updated ${result.modifiedCount} students with new coordinates!`);
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
