// Make a put request to localhost:3000/api/cms/content_blocks/1
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/cms/content_blocks',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', error => {
  console.error(error);
});

req.end();
