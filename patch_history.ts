import fs from 'fs';

let content = fs.readFileSync('src/pages/dashboards/student/AcademicHistory.tsx', 'utf8');

content = content.replace(
  /import \{ BookOpen \} from 'lucide-react';/,
  `import { BookOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';`
);

content = content.replace(
  /export default function AcademicHistory\(\) \{/,
  `export default function AcademicHistory() {
  const { token } = useAuth();`
);

content = content.replace(
  /localStorage\.getItem\('token'\)/,
  `token`
);

content = content.replace(
  /\}, \[\]\);/,
  `}, [token]);`
);

fs.writeFileSync('src/pages/dashboards/student/AcademicHistory.tsx', content);
