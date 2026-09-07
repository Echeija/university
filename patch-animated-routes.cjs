const fs = require('fs');
let code = fs.readFileSync('src/components/AnimatedRoutes.tsx', 'utf8');

const importTarget = `import ProtectedRoute from './ProtectedRoute';`;
const importReplacement = `import ProtectedRoute from './ProtectedRoute';
import VerifyTranscript from '../pages/VerifyTranscript';`;
if (code.includes(importTarget)) code = code.replace(importTarget, importReplacement);

const routeTarget = `          <Route path="/" element={<RootLayout />}>`;
const routeReplacement = `          <Route path="/verify-transcript/:code" element={<VerifyTranscript />} />
          <Route path="/" element={<RootLayout />}>`;
if (code.includes(routeTarget)) code = code.replace(routeTarget, routeReplacement);

fs.writeFileSync('src/components/AnimatedRoutes.tsx', code);
console.log('Successfully patched AnimatedRoutes.tsx');
