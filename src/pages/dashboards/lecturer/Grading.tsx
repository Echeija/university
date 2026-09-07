import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { publishGradeNotification } from '../../../services/gradeNotificationService';

export default function Grading() {

  const { token, user } = useAuth();
  const { notify } = useNotification();
  const { courseId } = useParams();
  const [students, setStudents] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lecturer/grading/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.course && data.students) {
          setCourse(data.course);
          setStudents(data.students);
        } else if (Array.isArray(data)) {
          // Fallback if old API format is received somehow
          setStudents(data);
        }
        setIsLoading(false);
      });
  }, [courseId, token]);

  const handleScoreChange = (studentId: number, score: string) => {
    const numScore = parseInt(score);
    let grade = '';
    
    if (!isNaN(numScore)) {
      if (numScore >= 70) grade = 'A';
      else if (numScore >= 60) grade = 'B';
      else if (numScore >= 50) grade = 'C';
      else if (numScore >= 45) grade = 'D';
      else if (numScore >= 40) grade = 'E';
      else grade = 'F';
    }

    setStudents(students.map(s => 
      s.studentId === studentId 
        ? { ...s, score: isNaN(numScore) ? null : numScore, grade: isNaN(numScore) ? null : grade }
        : s
    ));
  };

  const handleSaveGrades = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lecturer/grading/${courseId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ grades: students })
      });

      if (res.ok) {
        // Publish real-time grade alerts to Firestore for affected students
        for (const student of students) {
          if (student.score !== null && student.score !== undefined && student.grade) {
            const isUpdate = Boolean(student.resultId);
            const actionType = isUpdate ? 'UPDATE_GRADE' : 'NEW_GRADE';
            const verb = isUpdate ? 'updated' : 'posted';
            const courseCode = course?.code || `CSC ${courseId || '301'}`;
            const courseTitle = course?.title || 'Course Module';

            await publishGradeNotification({
              studentId: student.studentId,
              courseId: course ? course.id : parseInt(courseId || '1'),
              courseCode,
              courseTitle,
              lecturerName: user?.name || 'Lecturer',
              score: student.score,
              grade: student.grade,
              actionType,
              message: `${user?.name || 'Your lecturer'} ${verb} your grade for ${courseCode} (${courseTitle}): Score ${student.score}% (Grade ${student.grade})`
            });
          }
        }

        notify({ 
          title: 'Grades Published & Real-time Alerts Sent', 
          message: 'Saved grades and published real-time Firestore notifications to student portals.', 
          type: 'success' 
        });
      } else {
        notify({ title: 'Error', message: 'Failed to save grades.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An error occurred while saving grades.', type: 'error' });
    }
    setIsLoading(false);
  };

  if (isLoading) return <div>Loading students...</div>;

  return (
    <div>
      <div className="mb-6">
        <Link to="/dashboard/assigned-courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Grading: {course ? course.code : 'Loading...'}
            </h2>
            <p className="text-slate-500 mt-1">
              {course ? course.title : '...'} • {students.length} Students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm text-sm">
              <FileSpreadsheet className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={handleSaveGrades} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 text-sm">
              <Save className="w-4 h-4" /> Save Grades
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Matric No.</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4 w-32">Score (100%)</th>
                <th className="px-6 py-4 w-24 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => (
                <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 font-mono text-sm">{student.matricNo}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{student.studentName}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={student.score || ''}
                      onChange={(e) => handleScoreChange(student.studentId, e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-center"
                      placeholder="--"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {student.grade ? (
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                        student.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                        student.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        student.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                        student.grade === 'D' || student.grade === 'E' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.grade}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {student.score !== null ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                    )}
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
