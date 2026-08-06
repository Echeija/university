const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const importStatement = `import CMSBlockEditor from '../components/cms/CMSBlockEditor';\n`;
if (!code.includes('import CMSBlockEditor')) {
    code = importStatement + code;
}

const oldHero = `      <section className="relative flex flex-col md:flex-row min-h-[700px] overflow-hidden bg-slate-900 border-b border-slate-800 group">
        {/* Interactive Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Graduate students on campus" 
            className="w-full h-full object-cover object-center opacity-70 group-hover:scale-105 group-hover:opacity-80 transition-all duration-1000 ease-in-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        </div>

        {/* Left Content */}
        <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-20 flex flex-col justify-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold w-fit backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            2026/2027 ADMISSION SCREENING IN PROGRESS
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
          >
            Innovating the Future of <br className="hidden md:block"/><span className="text-emerald-400">Technology</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed font-medium"
          >
            Welcome to Smart Global College of Technology, Makurdi. We are dedicated to raising world-class professionals equipped with cutting-edge technical skills.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              to="/admissions" 
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all hover:scale-105 shadow-lg shadow-emerald-900/20"
            >
              Apply Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/programs" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 backdrop-blur-md transition-all hover:scale-105"
            >
              Explore Programs
            </Link>
          </motion.div>
        </div>

        {/* Right Content / Quick Stats */}
        <div className="w-full md:w-2/5 p-8 md:p-12 lg:p-20 flex flex-col justify-center relative z-10 bg-slate-900/40 backdrop-blur-sm border-l border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
              <BookOpen className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-3xl font-black text-white mb-1">45+</h3>
              <p className="text-slate-400 font-medium">Academic Programs</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
              <Users className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-3xl font-black text-white mb-1">5.8k</h3>
              <p className="text-slate-400 font-medium">Active Students</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors sm:col-span-2">
              <Trophy className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-3xl font-black text-white mb-1">Top 10</h3>
              <p className="text-slate-400 font-medium">Tech Institution in North-Central Nigeria</p>
            </div>
          </div>
        </div>
      </section>`;

const newHero = `      <CMSBlockEditor
        section="Home"
        title="Hero Section"
        defaultContent="Welcome to Smart Global College of Technology, Makurdi. We are dedicated to raising world-class professionals equipped with cutting-edge technical skills."
        defaultImageUrl="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        showImage={true}
        renderContent={(displayTitle, displayContent, displayImageUrl) => (
          <section className="relative flex flex-col md:flex-row min-h-[700px] overflow-hidden bg-slate-900 border-b border-slate-800 group">
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={displayImageUrl} 
                alt="Graduate students on campus" 
                className="w-full h-full object-cover object-center opacity-70 group-hover:scale-105 group-hover:opacity-80 transition-all duration-1000 ease-in-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            </div>

            <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-20 flex flex-col justify-center relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold w-fit backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                2026/2027 ADMISSION SCREENING IN PROGRESS
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
              >
                {displayTitle || "Innovating the Future of Technology"}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed font-medium"
              >
                {displayContent}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link 
                  to="/admissions" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all hover:scale-105 shadow-lg shadow-emerald-900/20"
                >
                  Apply Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/programs" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 backdrop-blur-md transition-all hover:scale-105"
                >
                  Explore Programs
                </Link>
              </motion.div>
            </div>

            <div className="w-full md:w-2/5 p-8 md:p-12 lg:p-20 flex flex-col justify-center relative z-10 bg-slate-900/40 backdrop-blur-sm border-l border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                  <BookOpen className="w-8 h-8 text-emerald-400 mb-4" />
                  <h3 className="text-3xl font-black text-white mb-1">45+</h3>
                  <p className="text-slate-400 font-medium">Academic Programs</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                  <Users className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-3xl font-black text-white mb-1">5.8k</h3>
                  <p className="text-slate-400 font-medium">Active Students</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors sm:col-span-2">
                  <Trophy className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-3xl font-black text-white mb-1">Top 10</h3>
                  <p className="text-slate-400 font-medium">Tech Institution in North-Central Nigeria</p>
                </div>
              </div>
            </div>
          </section>
        )}
      />`;

code = code.replace(oldHero, newHero);
fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log("Updated HomePage with CMSBlockEditor for Hero Section");
