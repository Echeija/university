import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 1, email: 'test@example.com', role: 'Administrator' }, process.env.JWT_SECRET || 'fallback-secret-for-dev', { expiresIn: '1h' });

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

const updates = {
  title: 'Test Block Updated',
  content: 'Test content updated',
  status: 'Published'
};

fetch('http://localhost:3000/api/cms/content_blocks/1', {
  method: 'PUT',
  headers: getHeaders(),
  body: JSON.stringify(updates)
}).then(async r => {
  console.log('PUT status:', r.status);
  const data = await r.json();
  console.log('PUT data:', data);
  return data;
}).catch(console.error);
