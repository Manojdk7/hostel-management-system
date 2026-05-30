const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'authController.js');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('hostelLatitude: 28.5244', 'hostelLatitude: 14.4644');
content = content.replace('hostelLongitude: 77.1855', 'hostelLongitude: 75.9217');

fs.writeFileSync(filePath, content);
console.log('Updated authController.js');
