const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = `import { HelmetProvider } from 'react-helmet-async';\n`;
if (!code.includes('HelmetProvider')) {
    code = code.replace("import { NotificationProvider } from './contexts/NotificationContext';", "import { NotificationProvider } from './contexts/NotificationContext';\n" + importStatement);
}

const oldAppReturn = `  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <TopProgressBar />`;
            
const newAppReturn = `  return (
    <HelmetProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Router>
              <TopProgressBar />`;
code = code.replace(oldAppReturn, newAppReturn);

const oldAppEnd = `          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}`;
const newAppEnd = `            </Router>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}`;
code = code.replace(oldAppEnd, newAppEnd);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx with HelmetProvider");
