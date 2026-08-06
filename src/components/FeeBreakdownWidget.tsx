import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

export default function FeeBreakdownWidget() {
  const { token } = useAuth();
  const [balanceInfo, setBalanceInfo] = useState({ totalExpected: 0, totalPaid: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const balanceRes = await fetch('/api/student/balance', { headers: { Authorization: `Bearer ${token}` } });
      if (balanceRes.ok) {
        setBalanceInfo(await balanceRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const data = [
    { name: 'Total Paid', value: balanceInfo.totalPaid, color: '#10b981' }, // emerald-500
    { name: 'Outstanding', value: balanceInfo.balance, color: '#f59e0b' }, // amber-500
  ];

  const formatCurrency = (value: number) => `₦${value.toLocaleString()}`;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5 text-emerald-600" />
        Fee Breakdown
      </h3>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Skeleton className="w-48 h-48 rounded-full" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Total Paid</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(balanceInfo.totalPaid)}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">Outstanding</p>
              <p className="text-lg font-black text-amber-700 dark:text-amber-300">{formatCurrency(balanceInfo.balance)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
