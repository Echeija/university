import CMSBlockEditor from '../components/cms/CMSBlockEditor';
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, Laptop, Globe, Clock, ChevronRight, Library } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import NewsTicker from '../components/NewsTicker';
import AcademicCalendar from '../components/AcademicCalendar';
import Testimonials from '../components/Testimonials';
import UniversityNews from '../components/UniversityNews';

export default function HomePage() {
  return (
    <div className="bg-slate-50">
      <NewsTicker />
      
      {/* Hero Section */}
      <CMSBlockEditor
        section="Home"
        title="Hero Section"
        defaultContent={'<span className="text-emerald-400">Education</span> without Barriers'}
        defaultImageUrl="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        showImage={true}
        className="w-full"
        renderContent={(title, content, imageUrl) => (
          <section className="relative flex flex-col min-h-[600px] overflow-hidden bg-emerald-900 group">
            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={imageUrl}
                alt="University Campus"
                className="w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-emerald-900/80 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col justify-center relative z-10 flex-grow">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-emerald-300 rounded-full text-xs font-bold w-fit backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                OPEN AND DISTANCE LEARNING
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 max-w-3xl"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-emerald-50 mb-10 max-w-2xl leading-relaxed"
              >
                Providing highly accessible and enhanced quality education tailored to your pace and lifestyle, empowering you to reach your full potential.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/admissions" className="px-8 py-4 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-400 transition-colors shadow-lg flex items-center gap-2">
                  Apply for Admission <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/portals" className="px-8 py-4 bg-white text-emerald-900 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
                  Student Portal
                </Link>
              </motion.div>
            </div>
          </section>
        )}
      />

      {/* Quick Links / Services */}
      <section className="relative z-20 -mt-16 mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/lms" className="bg-white rounded-xl p-8 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 border border-slate-100 group flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
              <Laptop className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">e-Learn Portal</h3>
            <p className="text-slate-500 mb-6 flex-grow">Access your study materials, assignments, and virtual classrooms from anywhere.</p>
            <span className="text-emerald-600 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Login to Portal <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          <Link to="/dashboard/digital-library" className="bg-white rounded-xl p-8 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 border border-slate-100 group flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
              <Library className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">e-Courseware</h3>
            <p className="text-slate-500 mb-6 flex-grow">Download digital course materials and resources for your academic program.</p>
            <span className="text-purple-600 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Browse Materials <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          <Link to="/about" className="bg-white rounded-xl p-8 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 border border-slate-100 group flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Study Centres</h3>
            <p className="text-slate-500 mb-6 flex-grow">Find a study centre near you for administrative support and physical interactions.</p>
            <span className="text-blue-600 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              View Locations <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
            <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <Globe className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Learn Anywhere</h3>
              <p className="text-slate-600 text-sm">Study from the comfort of your home, office, or on the go with our robust online platforms.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-3">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Flexible Pacing</h3>
              <p className="text-slate-600 text-sm">Design your study schedule around your work and family commitments seamlessly.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Quality Materials</h3>
              <p className="text-slate-600 text-sm">Access comprehensive, self-instructional course materials developed by experts.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-3">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Vast Community</h3>
              <p className="text-slate-600 text-sm">Join a diverse network of learners and alumni across the nation and globally.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-emerald-800">
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">120k+</span>
              <span className="text-xs md:text-sm text-emerald-100 uppercase font-bold tracking-widest">Active Students</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">100+</span>
              <span className="text-xs md:text-sm text-emerald-100 uppercase font-bold tracking-widest">Study Centres</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">8</span>
              <span className="text-xs md:text-sm text-emerald-100 uppercase font-bold tracking-widest">Faculties</span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">100+</span>
              <span className="text-xs md:text-sm text-emerald-100 uppercase font-bold tracking-widest">Academic Programs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* News Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-500 pl-4">Latest News & Updates</h2>
            </div>
            <UniversityNews />
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-500 pl-4">Upcoming Events</h2>
            </div>
            <AcademicCalendar />
          </div>
        </div>
      </div>

      <Testimonials />
    </div>
  );
}
