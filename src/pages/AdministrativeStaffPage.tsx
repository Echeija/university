import { motion } from 'motion/react';
import { UserCircle } from 'lucide-react';

const staff = [
  { name: 'Mr. David Clark', role: 'Head of Admissions' },
  { name: 'Ms. Emily White', role: 'Student Affairs Officer' },
  { name: 'Mr. Robert Green', role: 'IT Director' },
  { name: 'Mrs. Linda Brown', role: 'Chief Librarian' },
];

export default function AdministrativeStaffPage() {
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Administrative Staff</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our dedicated administrative team ensuring smooth operations and student support.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {staff.map((person, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-purple-100 rounded-full mb-6 flex items-center justify-center">
              <UserCircle className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{person.name}</h3>
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">{person.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
