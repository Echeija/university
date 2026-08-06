const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/student/StudentDashboard.tsx', 'utf8');

// Add import
if (!content.includes('import PaymentAlertsWidget')) {
  content = content.replace(
    "import GradeNotifier from '../../../components/GradeNotifier';",
    "import GradeNotifier from '../../../components/GradeNotifier';\nimport PaymentAlertsWidget from '../../../components/PaymentAlertsWidget';"
  );
}

// Add component
if (!content.includes('<PaymentAlertsWidget />')) {
  content = content.replace(
    "{/* Main Content Area - 2 Columns wide on lg */}\n        <div className=\"lg:col-span-2 space-y-6\">",
    "{/* Main Content Area - 2 Columns wide on lg */}\n        <div className=\"lg:col-span-2 space-y-6\">\n          <PaymentAlertsWidget />"
  );
}

fs.writeFileSync('src/pages/dashboards/student/StudentDashboard.tsx', content);
