const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

const oldTextarea = `<textarea 
                        rows={12}
                        value={currentItem?.content || ''}
                        onChange={e => setCurrentItem({...currentItem, content: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                        placeholder="Write your markdown content here..."
                      ></textarea>`;
const newWysiwyg = `<WysiwygEditor value={currentItem?.content || ''} onChange={(val) => setCurrentItem({...currentItem, content: val})} />`;
code = code.replace(oldTextarea, newWysiwyg);

const oldMarkdown = `<Markdown>{currentItem.content}</Markdown>`;
const newHtml = `<div dangerouslySetInnerHTML={{ __html: currentItem.content }} />`;
code = code.replace(oldMarkdown, newHtml);

fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log('Fixed AdminCMSPanel');
