import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /for \(const res of resultsToCheck\) \{/g,
  \`for (const resultRow of resultsToCheck) {\`
);

content = content.replace(
  /if \(res\.departmentName !== actorDepartment\) \{/g,
  \`if (resultRow.departmentName !== actorDepartment) {\`
);

fs.writeFileSync('server.ts', content);
