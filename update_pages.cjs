const fs = require('fs');

const updateFile = (filePath, oldStr, newStr) => {
    let code = fs.readFileSync(filePath, 'utf8');
    if (code.includes(oldStr)) {
        code = code.replace(oldStr, newStr);
        fs.writeFileSync(filePath, code);
        console.log("Updated " + filePath);
    }
};

// HomePage
updateFile(
    'src/pages/HomePage.tsx',
    `              <motion.p \n                initial={{ opacity: 0, y: 20 }}\n                animate={{ opacity: 1, y: 0 }}\n                transition={{ duration: 0.5, delay: 0.2 }}\n                className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed font-medium"\n              >\n                {displayContent}\n              </motion.p>`,
    `              <motion.div \n                initial={{ opacity: 0, y: 20 }}\n                animate={{ opacity: 1, y: 0 }}\n                transition={{ duration: 0.5, delay: 0.2 }}\n                className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed font-medium prose prose-invert"\n                dangerouslySetInnerHTML={{ __html: displayContent }}\n              />`
);

// AboutPage - Main block
updateFile(
    'src/pages/AboutPage.tsx',
    `              <p className="text-lg text-slate-600 mb-12 leading-relaxed">\n                {displayContent}\n              </p>`,
    `              <div className="text-lg text-slate-600 mb-12 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: displayContent }} />`
);

// AboutPage - Vision
updateFile(
    'src/pages/AboutPage.tsx',
    `                      <p className="text-emerald-800/80 leading-relaxed font-medium">\n                        {visContent}\n                      </p>`,
    `                      <div className="text-emerald-800/80 leading-relaxed font-medium prose prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: visContent }} />`
);

// AboutPage - Mission
updateFile(
    'src/pages/AboutPage.tsx',
    `                      <p className="text-purple-800/80 leading-relaxed font-medium">\n                        {misContent}\n                      </p>`,
    `                      <div className="text-purple-800/80 leading-relaxed font-medium prose prose-purple max-w-none" dangerouslySetInnerHTML={{ __html: misContent }} />`
);

// AdmissionsPage
updateFile(
    'src/pages/AdmissionsPage.tsx',
    `              <p className="text-slate-600 mb-8 leading-relaxed">\n                {displayContent}\n              </p>`,
    `              <div className="text-slate-600 mb-8 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: displayContent }} />`
);

