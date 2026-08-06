import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ArrowRight, BookOpen, GraduationCap, Users } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    title: 'Smart Global College Awarded Best Tech Institution 2026',
    date: 'July 15, 2026',
    category: 'Awards',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    summary: 'The college has been recognized for its outstanding contribution to technology education and innovation in the region.'
  },
  {
    id: 2,
    title: 'New AI Research Center Opens on Campus',
    date: 'July 10, 2026',
    category: 'Research',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    summary: 'A state-of-the-art Artificial Intelligence research center has been inaugurated to support student and faculty projects.'
  },
  {
    id: 3,
    title: 'Partnership with Global Tech Giants Announced',
    date: 'July 5, 2026',
    category: 'Partnerships',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    summary: 'We are thrilled to announce new internship and placement partnerships with leading technology companies.'
  }
];

const upcomingEvents = [
  {
    id: 1,
    title: 'Annual Tech Symposium 2026',
    date: 'Aug 15, 2026',
    time: '09:00 AM - 04:00 PM',
    location: 'Main Auditorium',
    type: 'Conference'
  },
  {
    id: 2,
    title: 'Freshers Orientation Week',
    date: 'Sep 05, 2026',
    time: '10:00 AM - 02:00 PM',
    location: 'Campus Grounds',
    type: 'Student Life'
  },
  {
    id: 3,
    title: 'Alumni Networking Mixer',
    date: 'Sep 20, 2026',
    time: '06:00 PM - 09:00 PM',
    location: 'Innovation Hub',
    type: 'Networking'
  }
];

const academicCalendar = [
  {
    id: 1,
    date: 'August 1, 2026',
    title: 'Resumption of Returning Students',
    icon: <Users className="w-5 h-5" />,
    description: 'Hostels open for returning students. Registration commences.'
  },
  {
    id: 2,
    date: 'August 15, 2026',
    title: 'Commencement of Lectures',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'First semester lectures begin for all levels.'
  },
  {
    id: 3,
    date: 'October 10, 2026',
    title: 'Mid-Semester Examinations',
    icon: <Calendar className="w-5 h-5" />,
    description: 'One week of mid-semester assessments.'
  },
  {
    id: 4,
    date: 'December 1, 2026',
    title: 'End of Semester Examinations',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'Final examinations for the first semester begin.'
  }
];

export default function NewsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-emerald-900 mb-4 tracking-tight">News & Events</h1>
          <p className="text-lg text-gray-600">
            Stay updated with the latest happenings, upcoming events, and important academic milestones at Smart Global College.
          </p>
        </div>

        {/* Latest News */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
            <button className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 font-medium">
                    <Calendar className="w-4 h-4" />
                    {item.date}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {item.summary}
                  </p>
                  <div className="text-emerald-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Story <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Two-Column Section: Events & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Upcoming Events */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors flex gap-6"
                >
                  <div className="flex-shrink-0 flex flex-col items-center justify-center bg-emerald-50 text-emerald-700 w-20 h-20 rounded-xl">
                    <span className="text-sm font-bold uppercase">{event.date.split(' ')[0]}</span>
                    <span className="text-2xl font-black leading-none">{event.date.split(' ')[1].replace(',', '')}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">{event.type}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="mt-6 w-full py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
              View Full Calendar <ArrowRight className="w-4 h-4" />
            </button>
          </section>

          {/* Academic Calendar Timeline */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Academic Calendar</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              {/* Vertical Line */}
              <div className="absolute left-12 top-10 bottom-10 w-0.5 bg-gray-100 rounded-full hidden sm:block"></div>
              
              <div className="space-y-8 relative">
                {academicCalendar.map((milestone, index) => (
                  <motion.div 
                    key={milestone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative"
                  >
                    <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center relative z-10 border-4 border-white shadow-sm mt-1">
                      {milestone.icon}
                    </div>
                    <div className="flex-1 bg-slate-50 sm:bg-transparent p-5 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-gray-100">
                      <div className="text-sm font-bold text-emerald-600 mb-1">{milestone.date}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
