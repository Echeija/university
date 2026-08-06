const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/req\.user\.role/g, '(req as any).user.role');
serverCode = serverCode.replace(/req\.user\.id/g, '(req as any).user.id');
serverCode = serverCode.replace(/appRecord\.applicantId/g, 'appRecord.userId');
fs.writeFileSync('server.ts', serverCode);

let profileCode = fs.readFileSync('src/pages/dashboards/UserProfileSettings.tsx', 'utf8');
profileCode = profileCode.replace(/user\?\.id\?\.substring/g, 'user?.id?.toString()?.substring');
fs.writeFileSync('src/pages/dashboards/UserProfileSettings.tsx', profileCode);
