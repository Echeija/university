import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 1, email: 'test@example.com', role: 'Administrator' }, process.env.JWT_SECRET || 'fallback-secret-for-dev', { expiresIn: '1h' });

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

const testBlock = {
  section: 'Home',
  title: 'Test Block',
  content: 'Test content',
  status: 'Published'
};

fetch('http://localhost:3000/api/cms/content_blocks', {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify(testBlock)
}).then(async r => {
  console.log('POST status:', r.status);
  const data = await r.json();
  console.log('POST data:', data);
  return data;
}).catch(console.error);
