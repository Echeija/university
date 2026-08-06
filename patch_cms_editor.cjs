const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CMSBlockEditor.tsx', 'utf8');

// 1. Roles
code = code.replace(
  /const isAdmin = user\?\.role === 'Admin' \|\| user\?\.role === 'Administrator' \|\| user\?\.role === 'Content Manager';/,
  `const isContentManager = user?.role === 'Content Manager';
  const isSuperAdmin = user?.role === 'Admin' || user?.role === 'Administrator' || user?.role === 'ICT Admin' || user?.role === 'Portal';
  const isAdmin = isContentManager || isSuperAdmin;
  const hasDraft = block?.status === 'Draft' && block?.metadata?.draft;`
);

// 2. FetchBlock Draft Loader
code = code.replace(
  /if \(foundBlock\) \{\n\s*setBlock\(foundBlock\);\n\s*setEditTitle\(foundBlock\.title\);\n\s*setEditContent\(foundBlock\.content \|\| defaultContent\);\n\s*setEditImageUrl\(foundBlock\.image_url \|\| defaultImageUrl\);\n\s*setMetaTitle\(foundBlock\.metadata\?\.meta_title \|\| ''\);\n\s*setMetaDesc\(foundBlock\.metadata\?\.meta_desc \|\| ''\);\n\s*setOgImage\(foundBlock\.metadata\?\.og_image \|\| ''\);\n\s*\}/,
  `if (foundBlock) {
        setBlock(foundBlock);
        const draft = foundBlock.status === 'Draft' && foundBlock.metadata?.draft;
        const source = draft ? draft : foundBlock;
        setEditTitle(source.title || '');
        setEditContent(source.content || defaultContent);
        setEditImageUrl(source.image_url || source.imageUrl || defaultImageUrl);
        setMetaTitle(source.meta_title || foundBlock.metadata?.meta_title || '');
        setMetaDesc(source.meta_desc || foundBlock.metadata?.meta_desc || '');
        setOgImage(source.og_image || foundBlock.metadata?.og_image || '');
      }`
);

// 3. handleSave Logic
code = code.replace(
  /const handleSave = async \(\) => \{\n\s*try \{\n\s*if \(block\?\.id\) \{\n\s*const updated = await cmsService\.updateContentBlock\(block\.id, \{\n\s*title: editTitle,\n\s*content: editContent,\n\s*image_url: editImageUrl,\n\s*metadata: \{\n\s*\.\.\.block\.metadata,\n\s*meta_title: metaTitle,\n\s*meta_desc: metaDesc,\n\s*og_image: ogImage,\n\s*\}\n\s*\}\);\n\s*setBlock\(updated\);\n\s*\} else \{/,
  `const handleSave = async () => {
    try {
      if (block?.id) {
        if (isContentManager) {
          const draftData = {
            title: editTitle,
            content: editContent,
            image_url: editImageUrl,
            meta_title: metaTitle,
            meta_desc: metaDesc,
            og_image: ogImage,
          };
          const updated = await cmsService.updateContentBlock(block.id, {
            status: 'Draft',
            metadata: {
              ...block.metadata,
              draft: draftData
            }
          });
          setBlock(updated);
          notify({ title: 'Draft Saved', message: 'Changes submitted for admin approval.', type: 'success' });
        } else {
          const newMetadata = { ...block.metadata };
          delete newMetadata.draft;
          const updated = await cmsService.updateContentBlock(block.id, {
            title: editTitle,
            content: editContent,
            image_url: editImageUrl,
            status: 'Published',
            metadata: {
              ...newMetadata,
              meta_title: metaTitle,
              meta_desc: metaDesc,
              og_image: ogImage,
            }
          });
          setBlock(updated);
          notify({ title: 'Published', message: 'Changes are now live.', type: 'success' });
        }
      } else {`
);

// 3.5 handleSave Create Logic
code = code.replace(
  /const created = await cmsService\.createContentBlock\(\{\n\s*section,\n\s*title: editTitle,\n\s*content: editContent,\n\s*image_url: editImageUrl,\n\s*status: 'Published',\n\s*metadata: \{\n\s*meta_title: metaTitle,\n\s*meta_desc: metaDesc,\n\s*og_image: ogImage,\n\s*\}\n\s*\}\);\n\s*setBlock\(created\);\n\s*\}/,
  `const created = await cmsService.createContentBlock({
          section,
          title: editTitle,
          content: editContent,
          image_url: editImageUrl,
          status: isContentManager ? 'Draft' : 'Published',
          metadata: isContentManager ? {
            draft: {
              title: editTitle,
              content: editContent,
              image_url: editImageUrl,
              meta_title: metaTitle,
              meta_desc: metaDesc,
              og_image: ogImage,
            }
          } : {
            meta_title: metaTitle,
            meta_desc: metaDesc,
            og_image: ogImage,
          }
        });
        if (isContentManager && created) {
           created.title = '';
           created.content = '';
        }
        setBlock(created);
        notify({ title: isContentManager ? 'Draft Created' : 'Published', message: isContentManager ? 'Submitted for approval.' : 'Content is live.', type: 'success' });
      }`
);

// 4. Banners
code = code.replace(
  /import \{ Edit2, Save, X, Image as ImageIcon, Upload, Settings \} from 'lucide-react';/,
  `import { Edit2, Save, X, Image as ImageIcon, Upload, Settings, AlertTriangle } from 'lucide-react';`
);

code = code.replace(
  /<div className=\{`relative group \$\{className\}`\}>\n\s*\{isAdmin && \(\n\s*<button/,
  `<div className={\`relative group \${className}\`}>
        {hasDraft && isSuperAdmin && (
          <div className="absolute top-4 left-4 p-2 bg-amber-500 text-white rounded-lg shadow-lg z-50 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pending Draft
          </div>
        )}
        {isAdmin && (
          <button`
);

code = code.replace(
  /<div className=\{`relative group \$\{className\}`\}>\n\s*\{isAdmin && \(\n\s*<button/g,
  `<div className={\`relative group \${className}\`}>
      {hasDraft && isSuperAdmin && (
        <div className="absolute top-4 left-4 p-2 bg-amber-500 text-white rounded-lg shadow-lg z-50 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Pending Draft
        </div>
      )}
      {isAdmin && (
        <button`
);

// Add button labels in edit mode for clarity
code = code.replace(
  /<Save className="w-3\.5 h-3\.5" \/> Save\n\s*<\/button>/,
  `<Save className="w-3.5 h-3.5" /> {isContentManager ? 'Submit for Approval' : 'Publish'}
            </button>`
);

fs.writeFileSync('src/components/cms/CMSBlockEditor.tsx', code);
console.log('Patched CMSBlockEditor');
