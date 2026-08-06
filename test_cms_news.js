import jwt from 'jsonwebtoken';
const token = jwt.sign({ id: 1, email: 'test@example.com', role: 'Administrator' }, process.env.JWT_SECRET || 'fallback-secret-for-dev', { expiresIn: '1h' });

const testNews = {
  title: 'Test News',
  type: 'news',
  content: 'Test content',
  status: 'Published',
  date: '2026-07-24T12:00:00Z',
  publishDate: '2026-07-24T12:00:00Z'
};

fetch('http://localhost:3000/api/cms/news_events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(testNews)
}).then(async r => {
  console.log('POST status:', r.status);
  const data = await r.json();
  console.log('POST data:', data);
}).catch(console.error);
