import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, GraduationCap, Clock, Building, Users, Filter, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  semester: string;
  prerequisites: string | null;
  department: string | null;
  instructors: string[];
}

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedInstructor, setSelectedInstructor] = useState('All');

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/course-catalog');
      if (!res.ok) throw new Error('Failed to load courses');
      const data = await res.json();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching course catalog');
    } finally {
      setIsLoading(false);
    }
  };

  const departments = useMemo(() => {
    const deps = new Set(courses.map(c => c.department).filter(Boolean));
    return ['All', ...Array.from(deps)] as string[];
  }, [courses]);

  const semesters = useMemo(() => {
    const sems = new Set(courses.map(c => c.semester).filter(Boolean));
    return ['All', ...Array.from(sems)] as string[];
  }, [courses]);

  const instructors = useMemo(() => {
    const insts = new Set(courses.flatMap(c => c.instructors).filter(Boolean));
    return ['All', ...Array.from(insts)] as string[];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'All' || course.department === selectedDepartment;
      const matchesSemester = selectedSemester === 'All' || course.semester === selectedSemester;
      const matchesInstructor = selectedInstructor === 'All' || course.instructors.includes(selectedInstructor);

      return matchesSearch && matchesDepartment && matchesSemester && matchesInstructor;
    });
  }, [courses, searchQuery, selectedDepartment, selectedSemester, selectedInstructor]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All');
    setSelectedSemester('All');
    setSelectedInstructor('All');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Helmet>
        <title>Course Catalog - Smart Global College of Technology</title>
        <meta name="description" content="Browse and search the comprehensive course catalog for Smart Global College of Technology." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-emerald-900 text-white pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-700/50 text-emerald-300 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" /> Academic Excellence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Course Catalog</h1>
          <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
            Explore our comprehensive range of courses designed to empower the next generation of global tech leaders. 
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-8">
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by course code or title..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <button 
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" /> Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" /> Department
              </label>
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Semester
              </label>
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Instructor
              </label>
              <select 
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {instructors.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100">
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query to find what you're looking for.</p>
            <button 
              onClick={clearFilters}
              className="mt-6 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <p className="text-slate-500 font-medium mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all group flex flex-col h-full"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-sm tracking-wide">
                        {course.code}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-sm font-medium">
                        <GraduationCap className="w-4 h-4" /> {course.credits} Credits
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <div className="space-y-2 mt-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{course.department || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{course.semester} Semester</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Info className="w-4 h-4" /> View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedCourse(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-emerald-900 px-6 py-8 text-white relative shrink-0">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex px-3 py-1 rounded-md bg-emerald-800/80 border border-emerald-700 font-bold text-sm tracking-wide mb-3">
                  {selectedCourse.code}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">{selectedCourse.title}</h2>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" /> Credits
                    </p>
                    <p className="text-lg font-bold text-slate-900">{selectedCourse.credits}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" /> Semester
                    </p>
                    <p className="text-lg font-bold text-slate-900">{selectedCourse.semester}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600" /> Department
                    </p>
                    <p className="text-lg font-bold text-slate-900">{selectedCourse.department || 'Not assigned'}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" /> Instructors
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {selectedCourse.instructors && selectedCourse.instructors.length > 0 
                        ? selectedCourse.instructors.join(', ') 
                        : 'TBA'}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" /> Prerequisites
                  </h3>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900">
                    {selectedCourse.prerequisites ? (
                      <p className="font-medium">{selectedCourse.prerequisites}</p>
                    ) : (
                      <p className="text-amber-700/80">No prerequisites required for this course.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Course Description</h3>
                  <p className="text-slate-600 leading-relaxed">
                    This is a comprehensive study of {selectedCourse.title.toLowerCase()}. Students will gain deep insights into the theoretical foundations and practical applications associated with {selectedCourse.department ? selectedCourse.department.toLowerCase() : 'this discipline'}. The curriculum is designed to challenge students and foster critical thinking, problem-solving, and hands-on experience relevant to modern industry standards.
                  </p>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto shrink-0 flex justify-end">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
