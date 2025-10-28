const fs = require('fs');
const path = require('path');

// Read the base64 file
const base64Data = fs.readFileSync('./public/models/video_plane.base64', 'utf8');

// Extract the binary data
const base64Content = base64Data.split('base64,')[1];

// Convert base64 to binary
const binaryData = Buffer.from(base64Content, 'base64');

// Write the GLB file
fs.writeFileSync('./public/models/video_plane.glb', binaryData);

console.log('Video plane GLB file created successfully!');