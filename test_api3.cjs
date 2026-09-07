const http = require('http');

async function run() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'lecturer1@university.edu', password: 'password123' })
  });
  const loginData = await loginRes.json();
  
  const res = await fetch('http://localhost:3000/api/lecturer/courses/14/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginData.token}` },
    body: JSON.stringify({
      isSubmit: false,
      students: [
        { studentId: 82, caScore: 20, examScore: 50 }
      ]
    })
  });
  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}
run();
