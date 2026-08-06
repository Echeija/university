import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
const imports = `import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
`;
content = content.replace(/(import ResearchPage from '\.\/pages\/ResearchPage';)/, "$1\n" + imports);

// Add routes
const routes = `                <Route path="gallery" element={<GalleryPage />} />
                <Route path="contact" element={<ContactPage />} />`;
content = content.replace(/(<Route path="research" element=\{<ResearchPage \/>\} \/>)/, "$1\n" + routes);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx');
