import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /if \(existing && \['hod_approved', 'registrar_approved', 'published', 'locked'\]\.includes\(existing\.status\)\) \{/g,
  `if (existing && ['submitted', 'hod_approved', 'registrar_approved', 'published', 'locked'].includes(existing.status)) {`
);

fs.writeFileSync('server.ts', content);
