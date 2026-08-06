import * as fs from 'fs';

let content = fs.readFileSync('src/services/cmsService.ts', 'utf8');

const mappingFunction = `
function mapFromDb(item: any) {
  if (!item) return item;
  return {
    ...item,
    image_url: item.imageUrl || item.image_url,
    video_url: item.videoUrl || item.video_url,
    order_index: item.orderIndex || item.order_index,
    is_published: item.isPublished !== undefined ? item.isPublished : item.is_published,
    created_at: item.createdAt || item.created_at,
    updated_at: item.updatedAt || item.updated_at,
    publish_date: item.publishDate || item.publish_date,
    author_id: item.authorId || item.author_id,
  };
}

function mapToDb(item: any) {
  if (!item) return item;
  const mapped = { ...item };
  if (mapped.image_url !== undefined) { mapped.imageUrl = mapped.image_url; delete mapped.image_url; }
  if (mapped.video_url !== undefined) { mapped.videoUrl = mapped.video_url; delete mapped.video_url; }
  if (mapped.order_index !== undefined) { mapped.orderIndex = mapped.order_index; delete mapped.order_index; }
  if (mapped.is_published !== undefined) { mapped.isPublished = mapped.is_published; delete mapped.is_published; }
  if (mapped.created_at !== undefined) { mapped.createdAt = mapped.created_at; delete mapped.created_at; }
  if (mapped.updated_at !== undefined) { mapped.updatedAt = mapped.updated_at; delete mapped.updated_at; }
  if (mapped.publish_date !== undefined) { mapped.publishDate = mapped.publish_date; delete mapped.publish_date; }
  if (mapped.author_id !== undefined) { mapped.authorId = mapped.author_id; delete mapped.author_id; }
  return mapped;
}
`;

content = content.replace(/const getHeaders = \(\) => \(\{/g, mappingFunction + '\nconst getHeaders = () => ({');

content = content.replace(/return res.json\(\);/g, 'return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));');
content = content.replace(/body: JSON.stringify\(item\)/g, 'body: JSON.stringify(mapToDb(item))');
content = content.replace(/body: JSON.stringify\(updates\)/g, 'body: JSON.stringify(mapToDb(updates))');

fs.writeFileSync('src/services/cmsService.ts', content);
console.log('Added mapping to cmsService.ts');
