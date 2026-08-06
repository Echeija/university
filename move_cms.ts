import * as fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /(\/\/ --- CMS Endpoints ---[\s\S]*?\}\);)(\s*if \(process\.env\.NODE_ENV !== "production"\) \{)/m;
const match = content.match(regex);

if (match) {
    const endpoints = match[1];
    
    // remove from current position
    content = content.replace(endpoints, '');
    
    // insert right before the 404 catch-all
    content = content.replace(/\/\/ Catch-all for missing API routes/, endpoints + '\n  // Catch-all for missing API routes');
    
    fs.writeFileSync('server.ts', content);
    console.log("Moved CMS endpoints");
} else {
    console.log("Match not found");
}

