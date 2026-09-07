const fs = require('fs');
const f = 'src/components/AcademicCalendar.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/\{monthEvents \/\* as any\[\] \*\/ as any\[\]\}\.map\(\(event: any, idx: number\) => \(/g, '{(monthEvents as any[]).map((event: any, idx: number) => (');
fs.writeFileSync(f, c);
