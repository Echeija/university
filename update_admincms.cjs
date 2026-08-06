const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

const wysiwygImport = `import WysiwygEditor from './WysiwygEditor';\n`;
code = code.replace("import CMSBlockEditor from './CMSBlockEditor';", wysiwygImport + "import CMSBlockEditor from './CMSBlockEditor';");

const oldTextArea = `<textarea
                    rows={8}
                    value={currentItem.content || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, content: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white"
                    placeholder="Write your content here..."
                  />`;

const newTextArea = `<WysiwygEditor 
                    value={currentItem.content || ''}
                    onChange={(val) => setCurrentItem({ ...currentItem, content: val })}
                  />`;

code = code.replace(oldTextArea, newTextArea);

// Since AdminCMSPanel renders the content using <Markdown>{currentItem.content}</Markdown>,
// we should change it to safely render HTML.
const oldMarkdown = `<div className="prose dark:prose-invert max-w-none">
                  <Markdown>{currentItem.content}</Markdown>
                </div>`;

const newHTML = `<div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: currentItem.content || '' }} />`;

code = code.replace(oldMarkdown, newHTML);

fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log("Updated AdminCMSPanel to use WysiwygEditor");
