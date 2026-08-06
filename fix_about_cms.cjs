const fs = require('fs');
let code = fs.readFileSync('src/pages/AboutPage.tsx', 'utf8');

const importStatement = `import CMSBlockEditor from '../components/cms/CMSBlockEditor';\n`;
if (!code.includes('import CMSBlockEditor')) {
    code = importStatement + code;
}

const oldBlock = `      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our History</h2>
          <p className="text-lg text-slate-600 mb-12 leading-relaxed">
            Smart Global College of Technology (SGCT), located in Makurdi, Benue State, was established to bridge the gap between theoretical knowledge and practical technological application in Nigeria. We are a world-class ERP-driven campus designed for the next generation of global innovators.
          </p>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">👁️</div>
              <h2 className="text-2xl font-black mb-4 text-emerald-900">Vision</h2>
              <p className="text-emerald-800/80 leading-relaxed font-medium">
                To be a world-class technology institution recognized for excellence in innovation, research, and raising leaders who will transform the African tech landscape.
              </p>
            </div>
            <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">🎯</div>
              <h2 className="text-2xl font-black mb-4 text-purple-900">Mission</h2>
              <p className="text-purple-800/80 leading-relaxed font-medium">
                To provide accessible, high-quality technical education, fostering an environment that encourages creativity, entrepreneurship, and problem-solving.
              </p>
            </div>
          </div>
        </div>
      </div>`;

const newBlock = `      <CMSBlockEditor
        section="About"
        title="Our History"
        defaultContent="Smart Global College of Technology (SGCT), located in Makurdi, Benue State, was established to bridge the gap between theoretical knowledge and practical technological application in Nigeria. We are a world-class ERP-driven campus designed for the next generation of global innovators."
        renderContent={(displayTitle, displayContent) => (
          <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">{displayTitle || "Our History"}</h2>
              <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                {displayContent}
              </p>
              
              <div className="grid md:grid-cols-2 gap-10">
                <CMSBlockEditor
                  section="Vision"
                  title="Vision"
                  defaultContent="To be a world-class technology institution recognized for excellence in innovation, research, and raising leaders who will transform the African tech landscape."
                  renderContent={(visTitle, visContent) => (
                    <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100 h-full">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">👁️</div>
                      <h2 className="text-2xl font-black mb-4 text-emerald-900">{visTitle || "Vision"}</h2>
                      <p className="text-emerald-800/80 leading-relaxed font-medium">
                        {visContent}
                      </p>
                    </div>
                  )}
                />
                <CMSBlockEditor
                  section="Mission"
                  title="Mission"
                  defaultContent="To provide accessible, high-quality technical education, fostering an environment that encourages creativity, entrepreneurship, and problem-solving."
                  renderContent={(misTitle, misContent) => (
                    <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100 h-full">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">🎯</div>
                      <h2 className="text-2xl font-black mb-4 text-purple-900">{misTitle || "Mission"}</h2>
                      <p className="text-purple-800/80 leading-relaxed font-medium">
                        {misContent}
                      </p>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        )}
      />`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/AboutPage.tsx', code);
console.log("Updated AboutPage with CMSBlockEditor");
