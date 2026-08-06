const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

// Add import
if (!code.includes("useAuth")) {
  code = code.replace(
    "import { useNotification }",
    "import { useAuth } from '../../contexts/AuthContext';\nimport { useNotification }"
  );
}

// Add canEdit
if (!code.includes("const canEdit")) {
  code = code.replace(
    "const { notify } = useNotification();",
    "const { notify } = useNotification();\n  const { user } = useAuth();\n  const canEdit = user?.role === 'Admin' || user?.role === 'Administrator' || user?.role === 'Content Manager';"
  );
}

// Hide Add New Button
code = code.replace(
  /<button\s+onClick=\{\(\) => \{\s+setCurrentItem\(\{\}\);\s+setIsEditing\(true\);\s+\}\}\s+className="px-4 py-2 bg-indigo-600/g,
  `{canEdit && <button 
                  onClick={() => {
                    setCurrentItem({});
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-indigo-600`
);

code = code.replace(
  /<Plus className="w-4 h-4" \/> Add New Item\s+<\/button>/g,
  `<Plus className="w-4 h-4" /> Add New Item
                </button>}`
);

// Disable Edit Button logic
code = code.replace(
  /<button\s+onClick=\{\(\) => handleEdit\(item\)\}\s+className="p-1\.5 hover:bg-slate-200/g,
  `{canEdit && <button 
                                  onClick={() => handleEdit(item)}
                                  className="p-1.5 hover:bg-slate-200`
);
code = code.replace(
  /<Edit className="w-4 h-4" \/>\s+<\/button>/g,
  `<Edit className="w-4 h-4" />
                                </button>}`
);

// Delete Button logic
code = code.replace(
  /<button\s+onClick=\{\(\) => handleDelete\(item\.id\)\}\s+className="p-1\.5 text-red-500/g,
  `{canEdit && <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 text-red-500`
);

code = code.replace(
  /<Trash2 className="w-4 h-4" \/>\s+<\/button>/g,
  `<Trash2 className="w-4 h-4" />
                                </button>}`
);

// Empty state Create button
code = code.replace(
  /<button\s+onClick=\{\(\) => \{\s+setCurrentItem\(\{\}\);\s+setIsEditing\(true\);\s+\}\}\s+className="px-6 py-2 bg-indigo-600/g,
  `{canEdit && <button
                      onClick={() => {
                        setCurrentItem({});
                        setIsEditing(true);
                      }}
                      className="px-6 py-2 bg-indigo-600`
);

code = code.replace(
  /Create your first item\s+<\/button>/g,
  `Create your first item
                    </button>}`
);

fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log('Patched AdminCMSPanel.tsx');
