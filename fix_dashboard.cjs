const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/student/StudentDashboard.tsx', 'utf8');

if (!code.includes("import FeeBreakdownWidget")) {
    code = code.replace(
        "import StudentFeeWidget from '../../../components/StudentFeeWidget';",
        "import StudentFeeWidget from '../../../components/StudentFeeWidget';\nimport FeeBreakdownWidget from '../../../components/FeeBreakdownWidget';"
    );
}

if (!code.includes("<FeeBreakdownWidget />")) {
    code = code.replace(
        "<StudentFeeWidget />",
        "<StudentFeeWidget />\n          <FeeBreakdownWidget />"
    );
}

fs.writeFileSync('src/pages/dashboards/student/StudentDashboard.tsx', code);
console.log("Updated StudentDashboard.tsx");
