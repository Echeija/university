import { motion } from 'motion/react';
import { Microscope, Globe2, Lightbulb, MonitorPlay } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResearchPage() {
  const centers = [
    { name: 'Center for Artificial Intelligence', type: 'Tech Hub', icon: <MonitorPlay className="w-6 h-6 text-emerald-600"/> },
    { name: 'Institute of Sustainable Agriculture', type: 'Research Institute', icon: <Globe2 className="w-6 h-6 text-purple-600"/> },
    { name: 'Renewable Energy Lab', type: 'Laboratory', icon: <Lightbulb className="w-6 h-6 text-amber-600"/> },
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-bold w-fit">
          PIONEERING INNOVATION
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Research & Innovation</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Driving impactful research to solve local and global challenges through technology.</p>
      </motion.div>

      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
           <div className="w-full md:w-1/2">
             <div className="aspect-video bg-emerald-50 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-purple-100/50"></div>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-800/20">
                  <Microscope className="w-32 h-32" />
                </div>
             </div>
           </div>
           <div className="w-full md:w-1/2">
             <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Research Focus</h2>
             <p className="text-slate-600 mb-6 leading-relaxed text-lg">
               At SGCT, research is at the core of our academic mission. We focus on applied research that bridges the gap between theory and industry needs.
             </p>
             <ul className="space-y-4">
               {[
                 'Artificial Intelligence and Machine Learning',
                 'Sustainable Energy and Power Systems',
                 'Agricultural Technology and Smart Farming',
                 'Cybersecurity and Data Privacy'
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   {item}
                 </li>
               ))}
             </ul>
           </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Research Centers & Institutes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {centers.map((center, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors"
             >
               <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{center.type}</div>
               <h4 className="text-xl font-bold text-slate-900 mb-2">{center.name}</h4>
               <Link to="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center mt-4">
                 Learn more &rarr;
               </Link>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}

// Added this missing import specifically to fixing a ts error, wait we can just import MonitorPlay up there.
