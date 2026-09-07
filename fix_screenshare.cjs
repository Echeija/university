const fs = require('fs');

// Fix LiveClass.tsx
let liveClassStr = fs.readFileSync('src/pages/dashboards/lms/LiveClass.tsx', 'utf8');
liveClassStr = liveClassStr.replace(
  'console.error("Failed to share screen", err);',
  'console.log("Failed to share screen", err?.message || err);'
);
liveClassStr = liveClassStr.replace(
  'console.error("Error accessing camera/mic:", err);',
  'console.log("Error accessing camera/mic:", err?.message || err);'
);
fs.writeFileSync('src/pages/dashboards/lms/LiveClass.tsx', liveClassStr);

// Fix LmsLiveClass.tsx
let lmsLiveClassStr = fs.readFileSync('src/pages/lms/LmsLiveClass.tsx', 'utf8');
lmsLiveClassStr = lmsLiveClassStr.replace(
  "console.log('Camera access denied or not available', err);",
  "console.log('Camera access denied or not available', err?.message || err);"
);
lmsLiveClassStr = lmsLiveClassStr.replace(
  "console.log('Screen sharing cancelled', err);",
  "console.log('Screen sharing cancelled', err?.message || err);"
);
fs.writeFileSync('src/pages/lms/LmsLiveClass.tsx', lmsLiveClassStr);

console.log("Fixed screen share permission errors logging!");
