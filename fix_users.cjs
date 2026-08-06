const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/admin/UserManagement.tsx', 'utf8');

code = code.replace(
  /fetch\('\/api\/admin\/users', \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \}\)\n      \.then\(res => res\.json\(\)\)\n      \.then\(data => \{\n        setUsers\(data\);\n        setIsLoading\(false\);\n      \}\);/,
  `fetch('/api/admin/users', { headers: { Authorization: \`Bearer \${token}\` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        setUsers([]);
        setIsLoading(false);
      });`
);

fs.writeFileSync('src/pages/dashboards/admin/UserManagement.tsx', code);
console.log('Fixed users array check');
