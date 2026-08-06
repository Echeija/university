const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CMSBlockEditor.tsx', 'utf8');

const wysiwygImport = `import WysiwygEditor from './WysiwygEditor';\n`;
code = code.replace("import { Edit2, Save, X, Image as ImageIcon, Upload } from 'lucide-react';", "import { Edit2, Save, X, Image as ImageIcon, Upload } from 'lucide-react';\n" + wysiwygImport);

const oldTextArea = `<textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />`;
            
const newTextArea = `<WysiwygEditor value={editContent} onChange={setEditContent} />`;

code = code.replace(oldTextArea, newTextArea);

const oldDisplay = `{displayContent && (
        <div className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
          {displayContent}
        </div>
      )}`;

const newDisplay = `{displayContent && (
        <div 
          className="text-slate-600 dark:text-slate-400 prose prose-sm dark:prose-invert max-w-none" 
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      )}`;

code = code.replace(oldDisplay, newDisplay);

fs.writeFileSync('src/components/cms/CMSBlockEditor.tsx', code);
console.log("Updated CMSBlockEditor to use WysiwygEditor");
