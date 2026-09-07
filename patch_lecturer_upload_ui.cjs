const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', 'utf8');

// 1. Add gradingRules state
if (!content.includes('const [gradingRules, setGradingRules]')) {
  content = content.replace('const [caRules, setCaRules] = useState<any>({', 'const [gradingRules, setGradingRules] = useState<any[]>([]);\n  const [caRules, setCaRules] = useState<any>({');
}

// 2. Fetch grading rules
if (!content.includes('/api/settings/grading_rules')) {
  // It already fetches ca_rules, let's also fetch grading_rules
  // Oh wait, it already fetches from /api/settings/academic_ca_rules
}
