const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

code = code.replace(
  /<motion\.h1[^>]*>[\s\S]*?<\/motion\.h1>/,
  `<CMSBlockEditor 
            section="Home" 
            title="Hero Header" 
            defaultContent="Innovating the Future of <br className=\\"hidden md:block\\"/><span className=\\"text-emerald-400\\">Technology</span>"
            renderContent={(title, content) => (
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          />`
);

code = code.replace(
  /<motion\.p[\s\S]*?className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed"[\s\S]*?>[\s\S]*?<\/motion\.p>/,
  `<CMSBlockEditor 
            section="Home" 
            title="Hero Subtitle" 
            defaultContent="Smart Global College of Technology (SGCT) prepares the next generation of digital leaders with world-class, ERP-driven technical education."
            renderContent={(title, content) => (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          />`
);

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log('Fixed HomePage.tsx');
