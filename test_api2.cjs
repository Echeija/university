const http = require('http');

async function run() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'lecturer1@university.edu', password: 'password123' })
  });
  const loginData = await loginRes.json();
  
  const res = await fetch('http://localhost:3000/api/lecturer/courses/14/students-results', {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}
run();
