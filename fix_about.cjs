const fs = require('fs');
let code = fs.readFileSync('src/pages/AboutPage.tsx', 'utf8');

const newCode = `import CMSBlockEditor from '../components/cms/CMSBlockEditor';

export default function AboutPage() {
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <CMSBlockEditor 
          section="About" 
          title="About Header" 
          defaultContent="<p>Architecting Digital Excellence in Nigeria since our inception.</p>"
          renderContent={(title, content) => (
            <>
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">{title}</h1>
              <div className="text-lg text-slate-600 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
            </>
          )}
        />
      </div>
      
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10">
          <CMSBlockEditor 
            section="About" 
            title="Our History" 
            defaultContent="<p>Smart Global College of Technology (SGCT), located in Makurdi, Benue State, was established to bridge the gap between theoretical knowledge and practical technological application in Nigeria. We are a world-class ERP-driven campus designed for the next generation of global innovators.</p>"
            renderContent={(title, content) => (
              <>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">{title}</h2>
                <div className="text-lg text-slate-600 mb-12 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
              </>
            )}
          />
          
          <div className="grid md:grid-cols-2 gap-10">
            <CMSBlockEditor 
              section="About" 
              title="Vision" 
              defaultContent="<p>To be a world-class technology institution recognized for excellence in innovation, research, and raising leaders who will transform the African tech landscape.</p>"
              renderContent={(title, content) => (
                <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100 relative h-full">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">👁️</div>
                  <h2 className="text-2xl font-black mb-4 text-emerald-900">{title}</h2>
                  <div className="text-emerald-800/80 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}
            />
            
            <CMSBlockEditor 
              section="About" 
              title="Mission" 
              defaultContent="<p>To provide accessible, high-quality technical education, fostering an environment that encourages creativity, entrepreneurship, and problem-solving.</p>"
              renderContent={(title, content) => (
                <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100 relative h-full">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">🎯</div>
                  <h2 className="text-2xl font-black mb-4 text-purple-900">{title}</h2>
                  <div className="text-purple-800/80 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/AboutPage.tsx', newCode);
console.log('Fixed AboutPage.tsx');
