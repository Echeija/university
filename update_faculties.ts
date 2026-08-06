import * as fs from 'fs';

const content = `import { motion } from 'motion/react';
import { BookOpen, MonitorPlay, FlaskConical, Briefcase, Cpu, Network, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultiesPage() {
  const faculties = [
    {
      name: 'Faculty of Engineering',
      icon: <Cpu className="w-8 h-8 text-emerald-600" />,
      description: 'Pioneering hardware, software, and civil solutions for the modern world.',
      color: 'bg-emerald-50',
      border: 'border-emerald-100',
      departments: [
        'Civil Engineering',
        'Mechanical Engineering',
        'Electrical Engineering',
        'Computer Engineering'
      ]
    },
    {
      name: 'Faculty of Computing',
      icon: <MonitorPlay className="w-8 h-8 text-purple-600" />,
      description: 'Advancing artificial intelligence, cybersecurity, and software engineering.',
      color: 'bg-purple-50',
      border: 'border-purple-100',
      departments: [
        'Computer Science',
        'Software Engineering',
        'Cybersecurity',
        'Information Technology'
      ]
    },
    {
      name: 'Faculty of Health Sciences',
      icon: <FlaskConical className="w-8 h-8 text-blue-600" />,
      description: 'Training the next generation of public health and medical technology experts.',
      color: 'bg-blue-50',
      border: 'border-blue-100',
      departments: [
        'Medicine',
        'Nursing',
        'Pharmacy',
        'Public Health'
      ]
    },
    {
      name: 'Faculty of Management',
      icon: <Briefcase className="w-8 h-8 text-amber-600" />,
      description: 'Developing innovative leaders in business, economics, and administration.',
      color: 'bg-amber-50',
      border: 'border-amber-100',
      departments: [
        'Business Administration',
        'Accounting',
        'Economics',
        'Marketing'
      ]
    }
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Our Faculties & Departments</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Explore our diverse range of academic faculties and their respective departments designed to foster innovation, critical thinking, and technical excellence.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {faculties.map((faculty, index) => (
          <motion.div
            key={faculty.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={\`p-8 md:p-10 rounded-3xl border \${faculty.border} bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group flex flex-col h-full\`}
          >
            <div className={\`absolute -right-10 -top-10 w-40 h-40 \${faculty.color} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity\`}></div>
            
            <div className="relative z-10 flex items-start gap-6 mb-8 flex-1">
              <div className={\`w-16 h-16 rounded-2xl \${faculty.color} flex items-center justify-center shrink-0\`}>
                {faculty.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{faculty.name}</h3>
                <p className="text-slate-600 leading-relaxed">{faculty.description}</p>
              </div>
            </div>

            <div className="relative z-10 border-t border-slate-100 pt-6 mt-auto">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Departments</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {faculty.departments.map(dept => (
                  <span 
                    key={dept} 
                    className={\`px-3 py-1.5 \${faculty.color} \${faculty.border} border text-slate-700 text-sm font-medium rounded-lg\`}
                  >
                    {dept}
                  </span>
                ))}
              </div>
              
              <Link to="#" className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider group-hover:gap-2 transition-all">
                View Faculty Details <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
\`;

fs.writeFileSync('src/pages/FacultiesPage.tsx', content);
console.log('Updated FacultiesPage');
