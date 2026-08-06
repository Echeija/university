import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Building, BookOpen, ChevronDown, ChevronRight, Download, UploadCloud } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';

interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  semester: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
  facultyId?: number;
  courses?: Course[];
}

export default function ManageDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<{id: number, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  const [expandedDept, setExpandedDept] = useState<number | null>(null);

  // New Department Form
  const [showNewDeptModal, setShowNewDeptModal] = useState(false);
  const [newDept, setNewDept] = useState<{name: string, description: string, facultyId?: string}>({ name: '', description: '' });
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // New Course Form
    const fileInputRef = useRef<HTMLInputElement>(null);
  const courseFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCourseDeptId, setUploadingCourseDeptId] = useState<number | null>(null);
  const [previewDepts, setPreviewDepts] = useState<{name: string, description: string}[]>([]);
  const [showDeptPreviewModal, setShowDeptPreviewModal] = useState(false);
  const [previewCourses, setPreviewCourses] = useState<{code: string, title: string, credits: number, semester: string, departmentId: number}[]>([]);
  const [showCoursePreviewModal, setShowCoursePreviewModal] = useState(false);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [selectedDeptForCourse, setSelectedDeptForCourse] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState({ code: '', title: '', credits: '', semester: '1st' });
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingCourseDeptId, setEditingCourseDeptId] = useState<number | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchFaculties = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/faculties', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setFaculties(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourses = async (deptId: number) => {
    try {
      const res = await fetch(`/api/departments/${deptId}/courses`);
      if (res.ok) {
        const courses = await res.json();
        setDepartments(depts => depts.map(d => d.id === deptId ? { ...d, courses } : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDept = (deptId: number) => {
    if (expandedDept === deptId) {
      setExpandedDept(null);
    } else {
      setExpandedDept(deptId);
      const dept = departments.find(d => d.id === deptId);
      if (dept && !dept.courses) {
        loadCourses(deptId);
      }
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/departments/${editingDept.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: editingDept.name, description: editingDept.description, facultyId: editingDept.facultyId })
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Department updated successfully', type: 'success' });
        setShowEditDeptModal(false);
        setEditingDept(null);
        fetchDepartments();
      } else {
        notify({ title: 'Error', message: 'Failed to update department', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourseDeptId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editingCourse)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Course updated successfully', type: 'success' });
        setShowEditCourseModal(false);
        setEditingCourse(null);
        loadCourses(editingCourseDeptId);
      } else {
        notify({ title: 'Error', message: 'Failed to update course', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const handleDeleteCourse = async (courseId: number, deptId: number) => {
    // removed confirm
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Course deleted successfully', type: 'success' });
        loadCourses(deptId);
      } else {
        notify({ title: 'Error', message: 'Failed to delete course', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/departments', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        method: 'POST',
        
        body: JSON.stringify(newDept)
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Department created successfully', type: 'success' });
        setShowNewDeptModal(false);
        setNewDept({ name: '', description: '' });
        fetchDepartments();
      } else {
        notify({ title: 'Error', message: 'Failed to create department', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    // removed confirm
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Department deleted', type: 'success' });
        fetchDepartments();
      } else {
        notify({ title: 'Error', message: 'Failed to delete department', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptForCourse) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/courses', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        method: 'POST',
        body: JSON.stringify({ ...newCourse, departmentId: selectedDeptForCourse })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Course added successfully', type: 'success' });
        setShowNewCourseModal(false);
        setNewCourse({ code: '', title: '', credits: '', semester: '1st' });
        loadCourses(selectedDeptForCourse);
      } else {
        notify({ title: 'Error', message: 'Failed to add course', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };


  

  const handleBulkUploadCourses = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingCourseDeptId === null) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        if (lines.length < 2) {
          notify({ title: 'Error', message: 'CSV file is empty or missing headers', type: 'error' });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const codeIdx = headers.findIndex(h => h.includes('code'));
        const titleIdx = headers.findIndex(h => h.includes('title'));
        const creditsIdx = headers.findIndex(h => h.includes('credit'));
        const semesterIdx = headers.findIndex(h => h.includes('semester'));

        if (codeIdx === -1 || titleIdx === -1) {
          notify({ title: 'Error', message: 'CSV must contain Code and Title columns', type: 'error' });
          return;
        }

        const coursesToCreate = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
          let match;
          const cols = [];
          while ((match = regex.exec(line)) !== null) {
            cols.push(match[1] !== undefined ? match[1] : match[2]);
            if (regex.lastIndex === line.length) break;
          }

          if (cols.length > Math.max(codeIdx, titleIdx) && cols[codeIdx] && cols[titleIdx]) {
            coursesToCreate.push({
              code: cols[codeIdx].trim(),
              title: cols[titleIdx].trim(),
              credits: creditsIdx !== -1 && cols.length > creditsIdx ? (parseInt(cols[creditsIdx].trim()) || 3) : 3,
              semester: semesterIdx !== -1 && cols.length > semesterIdx ? cols[semesterIdx].trim() : '1st',
              departmentId: uploadingCourseDeptId
            });
          }
        }

        if (coursesToCreate.length === 0) {
           notify({ title: 'Error', message: 'No valid courses found in CSV', type: 'error' });
           return;
        }
        
        notify({ title: 'Uploading', message: `Uploading ${coursesToCreate.length} courses...`, type: 'info', duration: 2000 });
        
        const token = localStorage.getItem('token');
        const res = await fetch('/api/courses/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ courses: coursesToCreate })
        });
        
        if (res.ok) {
           notify({ title: 'Success', message: `Successfully imported ${coursesToCreate.length} courses`, type: 'success' });
           loadCourses(uploadingCourseDeptId);
        } else {
           notify({ title: 'Error', message: 'Failed to import courses', type: 'error' });
        }
      } catch (error) {
        console.error(error);
        notify({ title: 'Error', message: 'An error occurred while parsing CSV', type: 'error' });
      }
      
      e.target.value = '';
      setUploadingCourseDeptId(null);
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        if (lines.length < 2) {
          notify({ title: 'Error', message: 'CSV file is empty or missing headers', type: 'error' });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const descIdx = headers.findIndex(h => h.includes('description'));

        if (nameIdx === -1) {
          notify({ title: 'Error', message: 'CSV must contain a Name column', type: 'error' });
          return;
        }

        const deptsToCreate = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
          let match;
          const cols = [];
          while ((match = regex.exec(line)) !== null) {
            cols.push(match[1] !== undefined ? match[1] : match[2]);
            if (regex.lastIndex === line.length) break;
          }

          if (cols.length > nameIdx && cols[nameIdx]) {
            deptsToCreate.push({
              name: cols[nameIdx].trim(),
              description: descIdx !== -1 && cols.length > descIdx ? (cols[descIdx] || '').trim() : ''
            });
          }
        }

        if (deptsToCreate.length === 0) {
           notify({ title: 'Error', message: 'No valid departments found in CSV', type: 'error' });
           return;
        }
        
        notify({ title: 'Uploading', message: `Uploading ${deptsToCreate.length} departments...`, type: 'info', duration: 2000 });
        
        const token = localStorage.getItem('token');
        const res = await fetch('/api/departments/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ departments: deptsToCreate })
        });
        
        if (res.ok) {
           notify({ title: 'Success', message: `Successfully imported ${deptsToCreate.length} departments`, type: 'success' });
           fetchDepartments();
        } else {
           notify({ title: 'Error', message: 'Failed to import departments', type: 'error' });
        }
      } catch (error) {
        console.error(error);
        notify({ title: 'Error', message: 'An error occurred while parsing CSV', type: 'error' });
      }
      
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const performDeptBulkUpload = async () => {
    setShowDeptPreviewModal(false);
    notify({ title: 'Uploading', message: `Uploading ${previewDepts.length} departments...`, type: 'info', duration: 2000 });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/departments/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ departments: previewDepts })
      });
      if (res.ok) {
        notify({ title: 'Success', message: `Successfully imported ${previewDepts.length} departments`, type: 'success' });
        fetchDepartments();
      } else {
        notify({ title: 'Error', message: 'Failed to import departments', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred while uploading', type: 'error' });
    }
    setPreviewDepts([]);
  };

  const performCourseBulkUpload = async () => {
    setShowCoursePreviewModal(false);
    notify({ title: 'Uploading', message: `Uploading ${previewCourses.length} courses...`, type: 'info', duration: 2000 });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/courses/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ courses: previewCourses })
      });
      if (res.ok) {
        notify({ title: 'Success', message: `Successfully imported ${previewCourses.length} courses`, type: 'success' });
        if (uploadingCourseDeptId) {
          loadCourses(uploadingCourseDeptId);
        }
      } else {
        notify({ title: 'Error', message: 'Failed to import courses', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred while uploading', type: 'error' });
    }
    setPreviewCourses([]);
    setUploadingCourseDeptId(null);
  };

  const handleExportCSV = async () => {
    notify({ title: 'Exporting', message: 'Generating CSV file...', type: 'info', duration: 2000 });
    try {
      // Fetch courses for all departments
      const deptsWithCourses = await Promise.all(departments.map(async (dept) => {
        if (dept.courses) return dept;
        const res = await fetch(`/api/departments/${dept.id}/courses`);
        if (res.ok) {
          const courses = await res.json();
          return { ...dept, courses };
        }
        return { ...dept, courses: [] };
      }));

      const headers = ['Department Name', 'Description', 'Course Code', 'Course Title', 'Credits', 'Semester'];
      let csvContent = headers.join(',') + '\n';

      deptsWithCourses.forEach(dept => {
        const deptName = `"${dept.name.replace(/"/g, '""')}"`;
        const deptDesc = `"${(dept.description || '').replace(/"/g, '""')}"`;
        
        if (!dept.courses || dept.courses.length === 0) {
          csvContent += `${deptName},${deptDesc},,,,\n`;
        } else {
          dept.courses.forEach(course => {
            const courseCode = `"${course.code.replace(/"/g, '""')}"`;
            const courseTitle = `"${course.title.replace(/"/g, '""')}"`;
            csvContent += `${deptName},${deptDesc},${courseCode},${courseTitle},${course.credits},${course.semester}\n`;
          });
        }
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'departments_and_courses.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      notify({ title: 'Success', message: 'Export completed successfully', type: 'success' });
    } catch (error) {
      console.error(error);
      notify({ title: 'Error', message: 'Failed to export data', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <input type="file" accept=".csv" ref={courseFileInputRef} onChange={handleBulkUploadCourses} className="hidden" />
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manage Departments</h2>
          <p className="text-slate-500 mt-1">Add or remove departments and their courses.</p>
        </div>
        
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <UploadCloud className="w-5 h-5" /> Import CSV
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-5 h-5" /> Export CSV
          </button>
          <button 
            onClick={() => setShowNewDeptModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" /> New Department
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <Building className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-900">No departments found</p>
          <p>Create a department to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleDept(dept.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {dept.name} 
                      {dept.facultyId && faculties.find(f => f.id === dept.facultyId) && (
                        <span className="ml-3 text-xs font-medium px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full align-middle">
                          {faculties.find(f => f.id === dept.facultyId)?.name}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-500">{dept.description || 'No description provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingDept(dept); setShowEditDeptModal(true); }}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit Department"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(dept.id); }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {expandedDept === dept.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                </div>
              </div>
              
              {expandedDept === dept.id && (
                <div className="border-t border-slate-100 bg-slate-50 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" /> Courses
                    </h4>
                    <div className="flex gap-2">
                    <button 
                      onClick={() => { setUploadingCourseDeptId(dept.id); courseFileInputRef.current?.click(); }}
                      className="text-sm font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4" /> Import Courses
                    </button>
                    <button 
                      onClick={() => { setSelectedDeptForCourse(dept.id); setShowNewCourseModal(true); }}
                      className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      + Add Course
                    </button>
                  </div>
                  </div>
                  
                  {!dept.courses ? (
                    <div className="text-center py-4 text-slate-500 text-sm">Loading courses...</div>
                  ) : dept.courses.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                      No courses found in this department.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dept.courses.map(course => (
                        <div key={course.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded mb-2">
                              {course.code}
                            </span>
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-bold text-slate-900 line-clamp-2" title={course.title}>{course.title}</h5>
                              <div className="flex gap-1 shrink-0">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingCourse(course); setEditingCourseDeptId(dept.id); setShowEditCourseModal(true); }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="Edit Course"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id, dept.id); }}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Delete Course"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-slate-500 flex justify-between items-center border-t border-slate-100 pt-3">
                            <span>{course.credits} Credits</span>
                            <span className="capitalize">{course.semester} Semester</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Department Modal */}
      {showNewDeptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">New Department</h3>
              <button onClick={() => setShowNewDeptModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreateDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Department Name</label>
                <input 
                  type="text" 
                  required
                  value={newDept.name}
                  onChange={e => setNewDept({...newDept, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. Computer Science"
                />
              </div>
                            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Faculty</label>
                <select 
                  value={newDept.facultyId || ''}
                  onChange={e => setNewDept({...newDept, facultyId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="">Select a Faculty (Optional)</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={newDept.description}
                  onChange={e => setNewDept({...newDept, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  rows={3}
                  placeholder="Brief description of the department"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewDeptModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Add New Course</h3>
              <button onClick={() => setShowNewCourseModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAddCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Course Code</label>
                <input 
                  type="text" 
                  required
                  value={newCourse.code}
                  onChange={e => setNewCourse({...newCourse, code: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase"
                  placeholder="e.g. CSC101"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Course Title</label>
                <input 
                  type="text" 
                  required
                  value={newCourse.title}
                  onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. Introduction to Programming"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Credits</label>
                  <input 
                    type="number" 
                    min="1"
                    max="6"
                    required
                    value={newCourse.credits}
                    onChange={e => setNewCourse({...newCourse, credits: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                  <select 
                    value={newCourse.semester}
                    onChange={e => setNewCourse({...newCourse, semester: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewCourseModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditDeptModal && editingDept && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Edit Department</h3>
              <button onClick={() => { setShowEditDeptModal(false); setEditingDept(null); }} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleUpdateDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Department Name</label>
                <input 
                  type="text" 
                  required
                  value={editingDept.name}
                  onChange={e => setEditingDept({...editingDept, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Faculty</label>
                <select 
                  value={editingDept.facultyId || ''}
                  onChange={e => setEditingDept({...editingDept, facultyId: parseInt(e.target.value) || undefined})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="">Select a Faculty (Optional)</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  value={editingDept.description || ''}
                  onChange={e => setEditingDept({...editingDept, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  rows={3}
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowEditDeptModal(false); setEditingDept(null); }}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditCourseModal && editingCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Edit Course</h3>
              <button onClick={() => { setShowEditCourseModal(false); setEditingCourse(null); setEditingCourseDeptId(null); }} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleUpdateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Course Code</label>
                <input 
                  type="text" 
                  required
                  value={editingCourse.code}
                  onChange={e => setEditingCourse({...editingCourse, code: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Course Title</label>
                <input 
                  type="text" 
                  required
                  value={editingCourse.title}
                  onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Credits</label>
                  <input 
                    type="number" 
                    min="1"
                    max="6"
                    required
                    value={editingCourse.credits}
                    onChange={e => setEditingCourse({...editingCourse, credits: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                  <select 
                    value={editingCourse.semester}
                    onChange={e => setEditingCourse({...editingCourse, semester: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowEditCourseModal(false); setEditingCourse(null); setEditingCourseDeptId(null); }}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Dept Preview Modal */}
      {showDeptPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Review Departments</h3>
                <p className="text-sm text-slate-500 mt-1">Review {previewDepts.length} departments before importing.</p>
              </div>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {previewDepts.map((d, i) => (
                <div key={i} className="p-4 border rounded-xl bg-slate-50">
                  <div className="font-bold text-slate-900">{d.name}</div>
                  <div className="text-sm text-slate-500 mt-1">{d.description || 'No description'}</div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => { setShowDeptPreviewModal(false); setPreviewDepts([]); }}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={performDeptBulkUpload}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Preview Modal */}
      {showCoursePreviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Review Courses</h3>
                <p className="text-sm text-slate-500 mt-1">Review {previewCourses.length} courses before importing.</p>
              </div>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {previewCourses.map((c, i) => (
                <div key={i} className="p-4 border rounded-xl bg-slate-50">
                  <div className="font-bold text-slate-900">{c.code} - {c.title}</div>
                  <div className="text-sm text-slate-500 mt-1">Credits: {c.credits} | Semester: {c.semester}</div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => { setShowCoursePreviewModal(false); setPreviewCourses([]); setUploadingCourseDeptId(null); }}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={performCourseBulkUpload}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
