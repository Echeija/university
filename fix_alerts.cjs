const fs = require('fs');
let code = fs.readFileSync('src/components/PaymentAlertsWidget.tsx', 'utf8');

if (!code.includes('BellRing')) {
    code = code.replace(
        "import { AlertCircle, Calendar, ArrowRight, Wallet } from 'lucide-react';",
        "import { AlertCircle, Calendar, ArrowRight, Wallet, BellRing } from 'lucide-react';"
    );
}

const headerEnd = `          <p className="text-sm text-slate-500 dark:text-slate-400">
            You have {pendingPayments.length} outstanding fee{pendingPayments.length > 1 ? 's' : ''} requiring attention.
          </p>
        </div>`;

const newHeaderEnd = `          <p className="text-sm text-slate-500 dark:text-slate-400">
            You have {pendingPayments.length} outstanding fee{pendingPayments.length > 1 ? 's' : ''} requiring attention.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm whitespace-nowrap border border-slate-200 dark:border-slate-700"
            title="Notification Preferences"
          >
            <BellRing className="w-4 h-4" />
            Alerts
          </Link>`;

if (!code.includes('BellRing className="w-4 h-4"')) {
    code = code.replace(headerEnd, newHeaderEnd);
    // Since we opened a div, we have to close it after the other button
    code = code.replace(
        `          Pay Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>`,
        `          Pay Now
          <ArrowRight className="w-4 h-4" />
        </Link>
        </div>
      </div>`
    );
}

fs.writeFileSync('src/components/PaymentAlertsWidget.tsx', code);
console.log("Updated PaymentAlertsWidget.tsx");
