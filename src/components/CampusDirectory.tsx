import { useState, useMemo } from 'react';
import { Search, Filter, Mail, Award, BookOpen, Users, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../contexts/NotificationContext';

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  interests: string[];
  email: string;
  office: string;
  phone: string;
}

const mockFaculty: FacultyMember[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'Professor of Computer Science',
    department: 'Computer Science',
    bio: 'Leading researcher in artificial intelligence and machine learning applications in healthcare.',
    interests: ['Artificial Intelligence', 'Machine Learning', 'Healthcare Tech'],
    email: 's.chen@sgct.edu',
    office: 'Science Building, Room 402',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '2',
    name: 'Prof. James Wilson',
    title: 'Head of Engineering',
    department: 'Engineering',
    bio: 'Expert in renewable energy systems and sustainable infrastructure development.',
    interests: ['Renewable Energy', 'Sustainable Systems', 'Power Grids'],
    email: 'j.wilson@sgct.edu',
    office: 'Engineering Block, Room 210',
    phone: '+1 (555) 234-5678'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    title: 'Associate Professor',
    department: 'Mathematics',
    bio: 'Specializes in applied mathematics and complex systems modeling.',
    interests: ['Applied Math', 'Complex Systems', 'Data Analysis'],
    email: 'e.rodriguez@sgct.edu',
    office: 'Math Department, Room 305',
    phone: '+1 (555) 345-6789'
  },
  {
    id: '4',
    name: 'Dr. Michael Chang',
    title: 'Senior Researcher',
    department: 'Computer Science',
    bio: 'Focuses on cybersecurity and cryptographic protocols for decentralized networks.',
    interests: ['Cybersecurity', 'Cryptography', 'Blockchain'],
    email: 'm.chang@sgct.edu',
    office: 'Cybersecurity Lab, Room 101',
    phone: '+1 (555) 456-7890'
  },
  {
    id: '5',
    name: 'Prof. Aisha Johnson',
    title: 'Dean of Sciences',
    department: 'Physics',
    bio: 'Pioneering research in quantum computing and theoretical physics.',
    interests: ['Quantum Computing', 'Theoretical Physics', 'Optics'],
    email: 'a.johnson@sgct.edu',
    office: 'Physics Annex, Room 501',
    phone: '+1 (555) 567-8901'
  },
  {
    id: '6',
    name: 'Dr. Robert Taylor',
    title: 'Assistant Professor',
    department: 'Engineering',
    bio: 'Researching advanced materials for aerospace applications and robotics.',
    interests: ['Aerospace', 'Robotics', 'Materials Science'],
    email: 'r.taylor@sgct.edu',
    office: 'Robotics Center, Room 112',
    phone: '+1 (555) 678-9012'
  }
];

export default function CampusDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const { notify } = useNotification();

  const departments = ['All', ...Array.from(new Set(mockFaculty.map(f => f.department)))].sort();

  const filteredFaculty = useMemo(() => {
    return mockFaculty.filter(faculty => {
      const matchesSearch = 
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.interests.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDept = selectedDept === 'All' || faculty.department === selectedDept;
      
      return matchesSearch && matchesDept;
    });
  }, [searchTerm, selectedDept]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Campus Directory
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Look up lecturer contact information, office locations, and departmental details.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
              placeholder="Search by name or interest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none text-slate-700 dark:text-slate-300 font-medium"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredFaculty.map((faculty) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={faculty.id}
              className="group flex flex-col p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-900/5 transition-all bg-white dark:bg-slate-800"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xl border border-emerald-200 shrink-0 group-hover:scale-105 transition-transform">
                  {faculty.name.split(' ').map(n => n[0]).join('').replace('.', '').substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight mb-1">
                    {faculty.name}
                  </h4>
                  <p className="text-sm font-medium text-emerald-600 mb-1">{faculty.title}</p>
                  <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-md uppercase tracking-wider">
                    {faculty.department}
                  </span>
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                {faculty.bio}
              </p>
              
              <div className="mt-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                  {faculty.interests.map(interest => (
                    <span key={interest} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-emerald-500" />
                      {interest}
                    </span>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{faculty.office}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{faculty.phone}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <a href={`mailto:${faculty.email}`} className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                  <button 
                    onClick={() => notify({ title: 'Profile View', message: `Full academic profile for ${faculty.name} is currently being updated.`, type: 'info' })}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-sm uppercase tracking-wider flex items-center gap-1"
                  >
                    Profile <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredFaculty.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No faculty found</h3>
            <p className="text-slate-500 max-w-sm">
              We couldn't find any faculty members matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
