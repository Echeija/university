// Test the media endpoint
const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/cms/media',
  method: 'GET',
  headers: {
    // You normally need auth, but let's test if it returns 401 or works
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
});
req.end();
