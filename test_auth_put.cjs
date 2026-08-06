const http = require('http');

// Let's first login to get token
const loginData = JSON.stringify({ email: 'admin@smartglobal.edu.ng', password: 'password123' });

const loginReq = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    
    // Now make PUT request
    const putData = JSON.stringify({
      title: 'Test Block',
      content: 'Updated content test',
      metadata: { meta_title: 'Title' }
    });
    
    const putReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/cms/content_blocks/1',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': putData.length
      }
    }, putRes => {
      let putResData = '';
      putRes.on('data', chunk => putResData += chunk);
      putRes.on('end', () => console.log('PUT Response:', putRes.statusCode, putResData));
    });
    putReq.write(putData);
    putReq.end();
  });
});

loginReq.write(loginData);
loginReq.end();
