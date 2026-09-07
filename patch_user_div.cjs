const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/admin/UserManagement.tsx', 'utf8');
content = content.replace(
    /<Users className="w-5 h-5" \/> Add New User\s*<\/button>\s*<\/div>/,
    `<Users className="w-5 h-5" /> Add New User\n        </button>\n      </div>\n      </div>`
);
fs.writeFileSync('src/pages/dashboards/admin/UserManagement.tsx', content);
