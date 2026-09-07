const fs = require('fs');
const map = JSON.parse(fs.readFileSync('dist/server.cjs.map', 'utf8'));
const idx = map.sources.indexOf('server.ts');
if (idx !== -1) {
  fs.writeFileSync('server.ts.recovered', map.sourcesContent[idx]);
  console.log('Recovered!');
} else {
  console.log('Not found in sourcemap!');
}
