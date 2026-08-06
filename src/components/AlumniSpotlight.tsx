import React, { useState, useEffect } from 'react';
import { Award, Quote, ChevronRight, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

interface Alumni {
  id: number;
  name: string;
  graduationYear: number;
  degree: string;
  currentRole: string;
  quote: string;
  imageUrl: string;
}

export default function AlumniSpotlight() {
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alumni/spotlight')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAlumniList(data);
        }
      })
      .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 bg-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-200 rounded-full mb-4"></div>
            <div className="h-8 w-64 bg-slate-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-slate-200 rounded mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (alumniList.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Alumni Spotlight</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover how our graduates are shaping the future of technology around the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {alumniList.map((alumni, index) => (
            <motion.div 
              key={alumni.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative group hover:shadow-md transition-all"
            >
              <Quote className="w-12 h-12 text-indigo-50 absolute top-6 right-6 group-hover:text-indigo-100 transition-colors" />
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={alumni.imageUrl} 
                  alt={alumni.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{alumni.name}</h3>
                  <p className="text-sm font-medium text-indigo-600">Class of {alumni.graduationYear}</p>
                </div>
              </div>
              <p className="text-slate-600 italic mb-6 relative z-10 text-sm leading-relaxed">
                "{alumni.quote}"
              </p>
              <div className="pt-6 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-1">{alumni.degree}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" />
                  {alumni.currentRole}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors group">
            View All Alumni Stories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
