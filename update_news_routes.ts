import * as fs from 'fs';

// Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const appImports = `import ContactPage from './pages/ContactPage';\nimport NewsPage from './pages/NewsPage';`;
appContent = appContent.replace(/import ContactPage from '\.\/pages\/ContactPage';/, appImports);

const appRoutes = `<Route path="contact" element={<ContactPage />} />\n                <Route path="news" element={<NewsPage />} />`;
appContent = appContent.replace(/<Route path="contact" element=\{<ContactPage \/>\} \/>/, appRoutes);
fs.writeFileSync('src/App.tsx', appContent);

// Update RootLayout.tsx
let rootContent = fs.readFileSync('src/layouts/RootLayout.tsx', 'utf8');
const rootNav = `path: '/gallery' }, { name: 'News', path: '/news' }, { name: 'Contact'`;
rootContent = rootContent.replace(/path: '\/gallery' \}, \{ name: 'Contact'/, rootNav);
fs.writeFileSync('src/layouts/RootLayout.tsx', rootContent);

console.log('Updated routes for News page');
