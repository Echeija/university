const fs = require('fs');
const content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');
const regex = /  useEffect\(\(\) => \{\n    const fetchProfile[\s\S]*?fetchProfile\(\);\n  \}, \[user\?.email, user\?.id\]\);/g;
const newContent = content.replace(regex, `  useEffect(() => {\n    if (user) {\n      setUserProfile(user);\n      setIsLoadingProfile(false);\n    }\n  }, [user]);`);
fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', newContent);
