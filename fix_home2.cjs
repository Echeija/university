const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

code = code.replace(
  'defaultContent="Innovating the Future of <br className=\\"hidden md:block\\"/><span className=\\"text-emerald-400\\">Technology</span>"',
  'defaultContent={\'Innovating the Future of <br className="hidden md:block"/><span className="text-emerald-400">Technology</span>\'}'
);

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log('Fixed HomePage.tsx quotes');
