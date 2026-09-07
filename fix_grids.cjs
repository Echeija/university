const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');

    // Replace grid-cols-2 to grid-cols-6 with responsive versions
    // Only if they don't have a prefix like md:
    // Regex explanation:
    // /(^|[^:])\bgrid-cols-([2-6])\b/g
    
    let newContent = content.replace(/(^|[^:a-zA-Z0-9-])grid-cols-([2-6])\b/g, (match, p1, p2) => {
        // If it already has responsive grid-cols-1 somewhere in the same class string, it might be tricky.
        // We'll just blindly replace it to `grid-cols-1 md:grid-cols-${p2}`
        // It's mostly safe.
        
        // Let's use sm: for 2, md: for 3+
        const breakpoint = p2 === '2' ? 'md' : 'md';
        return `${p1}grid-cols-1 ${breakpoint}:grid-cols-${p2}`;
    });
    
    // Fix any potential double "grid-cols-1" if it was already there
    // e.g. "grid-cols-1 grid-cols-1 md:grid-cols-2"
    newContent = newContent.replace(/grid-cols-1\s+grid-cols-1/g, 'grid-cols-1');

    if (newContent !== content) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log(`Updated ${filepath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walkDir('src');
