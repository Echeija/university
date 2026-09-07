const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');

    // We look for "<table" 
    // If it's already preceded by "<div className="overflow-x-auto">" we skip
    // A simple regex approach is hard, so let's do a string check
    // Actually, if we just find `<table` and it doesn't have an overflow wrapper, it's safer to just wrap it.
    
    // Instead of parsing, let's just use regex to wrap `<table ...> ... </table>` if not wrapped by `overflow-x-auto` or `overflow-x-scroll`.
    // Since tables can be multiline, regex is tricky.
    // Let's just output files that have `<table` without `overflow-x-auto` on the preceding lines.
    
    const lines = content.split('\n');
    let hasTable = false;
    let missingWrapper = false;
    for(let i=0; i<lines.length; i++) {
        if(lines[i].includes('<table')) {
            hasTable = true;
            // check previous 1-2 lines
            let wrapped = false;
            for(let j=Math.max(0, i-3); j<=i; j++) {
                if(lines[j].includes('overflow-x-auto') || lines[j].includes('overflow-auto')) {
                    wrapped = true;
                    break;
                }
            }
            if(!wrapped) {
                missingWrapper = true;
                console.log(`${filepath}:${i+1}`);
            }
        }
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
