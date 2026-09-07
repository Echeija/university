const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const app = express();',
  'const app = express();\n\n  // Enable trust proxy so rate limit works behind reverse proxy\n  app.set(\'trust proxy\', 1);\n'
);

fs.writeFileSync('server.ts', code);
