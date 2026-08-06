import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
const imports = `import ManagementStaffPage from './pages/ManagementStaffPage';
import AdministrativeStaffPage from './pages/AdministrativeStaffPage';`;
content = content.replace(/(import AboutPage from '\.\/pages\/AboutPage';)/, "$1\n" + imports);

// Add routes
const routes = `                <Route path="management-staff" element={<ManagementStaffPage />} />
                <Route path="administrative-staff" element={<AdministrativeStaffPage />} />`;
content = content.replace(/(<Route path="about" element=\{<AboutPage \/>\} \/>)/, "$1\n" + routes);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx with staff pages');
