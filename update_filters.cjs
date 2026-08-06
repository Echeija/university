const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/student/FeeReceiptModule.tsx', 'utf8');

// 1. Add Filter icon to imports
code = code.replace(
  "import { FileText, Download, Printer, Search, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';",
  "import { FileText, Download, Printer, Search, CheckCircle2, XCircle, Clock, AlertCircle, Filter, Calendar } from 'lucide-react';"
);

// 2. Add state for new filters
code = code.replace(
  "const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);",
  "const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);\n  const [startDate, setStartDate] = useState('');\n  const [endDate, setEndDate] = useState('');\n  const [categoryFilter, setCategoryFilter] = useState('');\n  const [showFilters, setShowFilters] = useState(false);"
);

// 3. Update filtering logic
const oldFilterLogic = `const filteredPayments = payments.filter(p => 
    (p.purpose && p.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.session && p.session.toLowerCase().includes(searchQuery.toLowerCase()))
  );`;

const newFilterLogic = `const filteredPayments = payments.filter(p => {
    const matchesSearch = (p.purpose && p.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.session && p.session.toLowerCase().includes(searchQuery.toLowerCase()));

    const paymentDateStr = p.date || p.created_at;
    const paymentDate = paymentDateStr ? new Date(paymentDateStr) : new Date();
    
    let matchesStartDate = true;
    if (startDate) {
      matchesStartDate = paymentDate >= new Date(startDate);
    }
    
    let matchesEndDate = true;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesEndDate = paymentDate <= end;
    }

    let matchesCategory = true;
    if (categoryFilter) {
      if (categoryFilter === 'Tuition') {
        matchesCategory = p.purpose?.toLowerCase().includes('tuition') || p.purpose?.toLowerCase().includes('school fee');
      } else if (categoryFilter === 'Hostel') {
        matchesCategory = p.purpose?.toLowerCase().includes('hostel') || p.purpose?.toLowerCase().includes('accommodation');
      } else {
        matchesCategory = p.purpose?.toLowerCase().includes(categoryFilter.toLowerCase());
      }
    }

    return matchesSearch && matchesStartDate && matchesEndDate && matchesCategory;
  });`;

code = code.replace(oldFilterLogic, newFilterLogic);

// 4. Update the UI for filters
const oldHeader = `<div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            Transaction History
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {selectedTransactions.length > 0 && (
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Generate Summary Report ({selectedTransactions.length})
              </button>
            )}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search reference or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>`;

const newHeader = `<div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              Transaction History
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {selectedTransactions.length > 0 && (
                <button
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  Generate Report ({selectedTransactions.length})
                </button>
              )}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={\`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors \${showFilters ? 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'} text-slate-700 dark:text-slate-300\`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Tuition">Tuition / School Fees</option>
                  <option value="Hostel">Hostel / Accommodation</option>
                  <option value="Medical">Medical Fees</option>
                  <option value="Departmental">Departmental Dues</option>
                </select>
              </div>
            </div>
          )}
        </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/pages/dashboards/student/FeeReceiptModule.tsx', code);
console.log("Filters added");
