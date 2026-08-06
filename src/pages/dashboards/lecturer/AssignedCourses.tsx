import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { BookOpen, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssignedCourses() {

  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lecturer/courses', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Loading courses...</div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Assigned Courses</h2>
        <p className="text-slate-500 mt-1">Manage your courses for the current academic session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-1">{course.code}</h3>
            <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{course.title}</p>
            
            <div className="flex items-center gap-4 mb-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-bold">{course.studentsCount}</span> Students
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-bold">{course.credits}</span> Credits
              </div>
            </div>

            <Link 
              to={`/dashboard/grading/${course.id}`}
              className="flex items-center justify-between w-full py-3 px-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl font-bold transition-colors group-hover:border-emerald-200 border border-transparent"
            >
              Manage Grading
              <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
