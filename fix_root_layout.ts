import * as fs from 'fs';
let content = fs.readFileSync('src/layouts/RootLayout.tsx', 'utf8');
content = content.replace(
  /const navLinks = \[([\s\S]*?)\];/,
  `const navLinks = [$1, { name: 'Gallery', path: '/gallery' }, { name: 'Contact', path: '/contact' }];`
);
fs.writeFileSync('src/layouts/RootLayout.tsx', content);
console.log('Fixed RootLayout.tsx');
