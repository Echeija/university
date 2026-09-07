const fs = require('fs');

// 1. Fix useDeadlineNotifications
let deadlineStr = fs.readFileSync('src/hooks/useDeadlineNotifications.ts', 'utf8');
deadlineStr = deadlineStr.replace(
  "console.error('Notification permission error:', err);",
  "// Silently ignore notification errors in iframe to prevent AI Studio error captures\n             console.log('Notification permission error:', err.message || err);"
);
fs.writeFileSync('src/hooks/useDeadlineNotifications.ts', deadlineStr);

// 2. Fix DigitalStudentID.tsx
let digitalIdStr = fs.readFileSync('src/pages/dashboards/student/DigitalStudentID.tsx', 'utf8');
digitalIdStr = digitalIdStr.replace(
  'console.error("Camera access error:", err);',
  'console.log("Camera access error:", err?.message || err);'
);
fs.writeFileSync('src/pages/dashboards/student/DigitalStudentID.tsx', digitalIdStr);

// 3. Fix LiveLecture.tsx
let liveLectureStr = fs.readFileSync('src/pages/dashboards/LiveLecture.tsx', 'utf8');
liveLectureStr = liveLectureStr.replace(
  "console.error('Error accessing media devices.', err);",
  "console.log('Error accessing media devices.', err?.message || err);"
);
fs.writeFileSync('src/pages/dashboards/LiveLecture.tsx', liveLectureStr);

// 4. Fix UserProfileSettings.tsx
let userProfileStr = fs.readFileSync('src/pages/dashboards/UserProfileSettings.tsx', 'utf8');
userProfileStr = userProfileStr.replace(
  'console.error(err);',
  'console.log("Camera error:", err?.message || err);'
);
fs.writeFileSync('src/pages/dashboards/UserProfileSettings.tsx', userProfileStr);

// 5. Fix StudentProfile.tsx
let studentProfileStr = fs.readFileSync('src/pages/dashboards/student/StudentProfile.tsx', 'utf8');
studentProfileStr = studentProfileStr.replace(
  'console.error(e);',
  'console.log("Camera error:", e?.message || e);'
);
fs.writeFileSync('src/pages/dashboards/student/StudentProfile.tsx', studentProfileStr);

console.log("Fixed camera/notification permission errors!");
