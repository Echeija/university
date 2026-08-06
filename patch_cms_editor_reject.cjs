const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CMSBlockEditor.tsx', 'utf8');

// Add handleRejectDraft
code = code.replace(
  /const handleSave = async \(\) => \{/,
  `const handleRejectDraft = async () => {
    try {
      if (block?.id) {
        const newMetadata = { ...block.metadata };
        delete newMetadata.draft;
        const updated = await cmsService.updateContentBlock(block.id, {
          status: 'Published', // revert to published
          metadata: newMetadata
        });
        setBlock(updated);
        setIsEditing(false);
        notify({ title: 'Draft Rejected', message: 'The draft has been discarded.', type: 'info' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'Failed to reject draft.', type: 'error' });
    }
  };

  const handleSave = async () => {`
);

// Add Reject button
code = code.replace(
  /<Save className="w-3\.5 h-3\.5" \/> \{isContentManager \? 'Submit for Approval' : 'Publish'\}\n\s*<\/button>/,
  `<Save className="w-3.5 h-3.5" /> {isContentManager ? 'Submit for Approval' : 'Publish'}
            </button>
            {hasDraft && isSuperAdmin && (
              <button
                onClick={handleRejectDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            )}`
);

fs.writeFileSync('src/components/cms/CMSBlockEditor.tsx', code);
console.log('Patched Reject Draft');
