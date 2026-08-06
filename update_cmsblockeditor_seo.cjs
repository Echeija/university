const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CMSBlockEditor.tsx', 'utf8');

// Add icons for SEO panel
code = code.replace("import { Edit2, Save, X, Image as ImageIcon, Upload } from 'lucide-react';", "import { Edit2, Save, X, Image as ImageIcon, Upload, Settings } from 'lucide-react';");

// Add Helmet import
const helmetImport = `import { Helmet } from 'react-helmet-async';\n`;
code = helmetImport + code;

// Add SEO states
const seoStates = `  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
`;
code = code.replace("  const [isUploadingImage, setIsUploadingImage] = useState(false);", "  const [isUploadingImage, setIsUploadingImage] = useState(false);\n" + seoStates);

// Update fetchBlock to set SEO states
const fetchBlockMatch = `      if (foundBlock) {
        setBlock(foundBlock);
        setEditTitle(foundBlock.title);
        setEditContent(foundBlock.content || defaultContent);
        setEditImageUrl(foundBlock.image_url || defaultImageUrl);
      } else {`;
const fetchBlockReplacement = `      if (foundBlock) {
        setBlock(foundBlock);
        setEditTitle(foundBlock.title);
        setEditContent(foundBlock.content || defaultContent);
        setEditImageUrl(foundBlock.image_url || defaultImageUrl);
        setMetaTitle(foundBlock.metadata?.meta_title || '');
        setMetaDesc(foundBlock.metadata?.meta_desc || '');
        setOgImage(foundBlock.metadata?.og_image || '');
      } else {`;
code = code.replace(fetchBlockMatch, fetchBlockReplacement);

// Update handleSave to include metadata
const saveUpdateMatch = `        const updated = await cmsService.updateContentBlock(block.id, {
          title: editTitle,
          content: editContent,
          image_url: editImageUrl,
        });`;
const saveUpdateReplacement = `        const updated = await cmsService.updateContentBlock(block.id, {
          title: editTitle,
          content: editContent,
          image_url: editImageUrl,
          metadata: {
            ...block.metadata,
            meta_title: metaTitle,
            meta_desc: metaDesc,
            og_image: ogImage,
          }
        });`;
code = code.replace(saveUpdateMatch, saveUpdateReplacement);

const saveCreateMatch = `        const created = await cmsService.createContentBlock({
          section,
          title: editTitle,
          content: editContent,
          image_url: editImageUrl,
          status: 'Published'
        });`;
const saveCreateReplacement = `        const created = await cmsService.createContentBlock({
          section,
          title: editTitle,
          content: editContent,
          image_url: editImageUrl,
          status: 'Published',
          metadata: {
            meta_title: metaTitle,
            meta_desc: metaDesc,
            og_image: ogImage,
          }
        });`;
code = code.replace(saveCreateMatch, saveCreateReplacement);

// Add Helmet render and SEO configuration panel in edit mode
const editorUiMatch = `        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Heading</label>`;
            
const editorUiReplacement = `        <div className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
            <button
              type="button"
              onClick={() => setShowSeoPanel(!showSeoPanel)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
              SEO Settings {showSeoPanel ? '(Hide)' : '(Show)'}
            </button>
          </div>
          
          {showSeoPanel && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  placeholder="e.g. Home | SGCT"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  placeholder="Brief description of the page for search engines..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Open Graph Image URL</label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Heading</label>`;

code = code.replace(editorUiMatch, editorUiReplacement);

// Render Helmet component if there is a block and it has metadata
// We can wrap the return in a fragment and add Helmet before the div.

// The main return statements are:
// 1. if (renderContent && !isEditing) { return (<div ...>...</div>); }
// 2. return (<div ...>...</div>);

const renderHelmet = `
  const renderSeoTags = () => {
    if (!block?.metadata) return null;
    const { meta_title, meta_desc, og_image } = block.metadata;
    if (!meta_title && !meta_desc && !og_image) return null;
    
    return (
      <Helmet>
        {meta_title && <title>{meta_title}</title>}
        {meta_desc && <meta name="description" content={meta_desc} />}
        {meta_title && <meta property="og:title" content={meta_title} />}
        {meta_desc && <meta property="og:description" content={meta_desc} />}
        {og_image && <meta property="og:image" content={og_image} />}
      </Helmet>
    );
  };
`;

code = code.replace("  if (isLoading) {", renderHelmet + "\n  if (isLoading) {");

code = code.replace(
  "    return (\n      <div className={`relative group ${className}`}>",
  "    return (\n      <>\n      {renderSeoTags()}\n      <div className={`relative group ${className}`}>"
);
code = code.replace(
  "        {renderContent(displayTitle, displayContent, displayImageUrl)}\n      </div>\n    );\n  }",
  "        {renderContent(displayTitle, displayContent, displayImageUrl)}\n      </div>\n      </>\n    );\n  }"
);

code = code.replace(
  "  return (\n    <div className={`relative group ${className}`}>",
  "  return (\n    <>\n    {renderSeoTags()}\n    <div className={`relative group ${className}`}>"
);
code = code.replace(
  "      )}\n    </div>\n  );\n}",
  "      )}\n    </div>\n    </>\n  );\n}"
);

fs.writeFileSync('src/components/cms/CMSBlockEditor.tsx', code);
console.log("Updated CMSBlockEditor.tsx with SEO settings and Helmet");
