import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

export default function LMSPeople({ role }: { role: string | undefined }) {
  const people = [
    { id: 1, name: "Dr. Robert Smith", role: "Lecturer", email: "r.smith@university.edu" },
    { id: 2, name: "Jane Doe", role: "Student", email: "j.doe@student.university.edu" },
    { id: 3, name: "John Smith", role: "Student", email: "j.smith@student.university.edu" },
    { id: 4, name: "Alice Johnson", role: "Student", email: "a.johnson@student.university.edu" },
    { id: 5, name: "Michael Brown", role: "Student", email: "m.brown@student.university.edu" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">People</h3>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-sm text-slate-700 dark:text-slate-300">Name</th>
                <th className="px-6 py-4 font-bold text-sm text-slate-700 dark:text-slate-300">Role</th>
                <th className="px-6 py-4 font-bold text-sm text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {people.map(person => (
                <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        {person.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{person.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{person.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      person.role === 'Lecturer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {person.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Send Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
