import { useState, useMemo } from 'react';
import { Search, UserPlus, Filter, Award, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';

interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  interests: string[];
  matchScore: number;
  availableSpots: number;
}

const mockMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'Professor',
    department: 'Computer Science',
    bio: 'Looking for motivated students interested in artificial intelligence and machine learning applications in healthcare.',
    interests: ['Artificial Intelligence', 'Machine Learning', 'Healthcare Tech'],
    matchScore: 95,
    availableSpots: 2,
  },
  {
    id: '2',
    name: 'Dr. Michael Chang',
    title: 'Senior Researcher',
    department: 'Computer Science',
    bio: 'Mentoring students in cybersecurity, cryptography, and network defense strategies.',
    interests: ['Cybersecurity', 'Cryptography', 'Blockchain'],
    matchScore: 88,
    availableSpots: 1,
  },
  {
    id: '3',
    name: 'Prof. James Wilson',
    title: 'Head of Engineering',
    department: 'Engineering',
    bio: 'Interested in guiding students on renewable energy systems and sustainable infrastructure projects.',
    interests: ['Renewable Energy', 'Sustainable Systems', 'Power Grids'],
    matchScore: 75,
    availableSpots: 0,
  },
  {
    id: '4',
    name: 'Dr. Emily Rodriguez',
    title: 'Associate Professor',
    department: 'Mathematics',
    bio: 'Happy to mentor students applying complex systems modeling to real-world problems.',
    interests: ['Applied Math', 'Complex Systems', 'Data Analysis'],
    matchScore: 60,
    availableSpots: 3,
  }
];

export default function MentorshipMatching() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [requestedMentors, setRequestedMentors] = useState<Set<string>>(new Set());
  const { notify } = useNotification();

  const departments = ['All', ...Array.from(new Set(mockMentors.map(m => m.department)))].sort();

  const filteredMentors = useMemo(() => {
    return mockMentors.filter(mentor => {
      const matchesSearch = 
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.interests.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDept = selectedDept === 'All' || mentor.department === selectedDept;
      
      return matchesSearch && matchesDept;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [searchTerm, selectedDept]);

  const handleRequest = (mentor: Mentor) => {
    if (requestedMentors.has(mentor.id)) return;
    
    setRequestedMentors(prev => new Set(prev).add(mentor.id));
    notify({
      title: 'Mentorship Request Sent',
      message: `Your request has been sent to ${mentor.name}.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Mentorship Matching
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Find and connect with faculty mentors aligned with your academic interests.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
              placeholder="Search by name or research interest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative min-w-[200px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              className="block w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none text-slate-700 dark:text-slate-300 font-medium"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMentors.map((mentor) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={mentor.id}
              className="group flex flex-col p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm hover:shadow-lg hover:shadow-emerald-900/5 transition-all bg-white dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xl border border-emerald-200 dark:border-emerald-800/50 shrink-0 group-hover:scale-105 transition-transform">
                    {mentor.name.split(' ').map(n => n[0]).join('').replace('.', '').substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight mb-1">
                      {mentor.name}
                    </h4>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">{mentor.title}</p>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-md uppercase tracking-wider">
                      {mentor.department}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                    {mentor.matchScore}%
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Match</span>
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-1">
                {mentor.bio}
              </p>
              
              <div className="mt-auto">
                <div className="flex flex-wrap gap-2 mb-6">
                  {mentor.interests.map(interest => (
                    <span key={interest} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-emerald-500" />
                      {interest}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      {mentor.availableSpots > 0 ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      )}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {mentor.availableSpots > 0 ? `${mentor.availableSpots} Spots Available` : 'Currently Full'}
                    </span>
                  </div>
                  
                  {requestedMentors.has(mentor.id) ? (
                    <button disabled className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg font-medium text-sm flex items-center gap-2 cursor-not-allowed">
                      <CheckCircle2 className="w-4 h-4" />
                      Requested
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleRequest(mentor)}
                      disabled={mentor.availableSpots === 0}
                      className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                        mentor.availableSpots === 0 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      Request Mentor
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredMentors.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No mentors found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              We couldn't find any mentors matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
