const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

// Add import
if (!content.includes('import FeeReceiptModule')) {
  content = content.replace(
    "import Payments from './student/Payments';",
    "import Payments from './student/Payments';\nimport FeeReceiptModule from './student/FeeReceiptModule';"
  );
}

// Add route
if (!content.includes('<Route path="/fee-receipts"')) {
  content = content.replace(
    "<Route path=\"/payments\" element={<Payments />} />",
    "<Route path=\"/payments\" element={<Payments />} />\n            <Route path=\"/fee-receipts\" element={<FeeReceiptModule />} />"
  );
}

// Add to Sidebar
if (!content.includes('to="/dashboard/fee-receipts"')) {
  const insertIndex = content.indexOf('to="/dashboard/payments"');
  if (insertIndex !== -1) {
    const linkToAdd = `
              <Link to="/dashboard/fee-receipts" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/fee-receipts') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <FileText className="w-5 h-5 opacity-75" />
                Fee Receipts
              </Link>`;
    content = content.replace(
      'Payments\n              </Link>',
      `Payments\n              </Link>${linkToAdd}`
    );
  }
}

// Update getPageTitle
if (!content.includes('/fee-receipts\')')) {
  content = content.replace(
    "if (location.pathname.includes('/payments')) return 'Payments';",
    "if (location.pathname.includes('/payments')) return 'Payments';\n    if (location.pathname.includes('/fee-receipts')) return 'Fee Receipts';"
  );
}

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
