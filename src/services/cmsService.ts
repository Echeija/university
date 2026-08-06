export interface ContentBlock {
  id?: number | string;
  section: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  order_index?: number;
  status: 'Draft' | 'Published';
  created_at?: string;
  updated_at?: string;
  metadata?: any;
}

export interface NewsEvent {
  id?: number | string;
  type: 'news' | 'event';
  title: string;
  content?: string;
  image_url?: string;
  status: 'Draft' | 'Published';
  date?: string; // Date of the event or publish date of news
  publish_date?: string; // Scheduled publish date
  location?: string; // For events
  created_at?: string;
  metadata?: any;
}


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

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const cmsService = {
  // --- Content Blocks ---
  
  async getContentBlocksBySection(section: string): Promise<ContentBlock[]> {
    const res = await fetch(`/api/cms/content_blocks?section=${encodeURIComponent(section)}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch content blocks for ${section}`);
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  async getContentBlockById(id: string | number): Promise<ContentBlock | null> {
    const res = await fetch(`/api/cms/content_blocks/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch content block ${id}`);
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  async createContentBlock(item: Partial<ContentBlock>): Promise<ContentBlock> {
    const res = await fetch('/api/cms/content_blocks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(mapToDb(item))
    });
    if (!res.ok) throw new Error('Failed to create content block');
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  async updateContentBlock(id: string | number, updates: Partial<ContentBlock>): Promise<ContentBlock> {
    const current = await this.getContentBlockById(id);
    if (current) {
      const snapshot = { ...current };
      delete snapshot.metadata;
      
      const existingMetadata = current.metadata || {};
      const previousVersions = existingMetadata.versions || [];
      const newMetadata = updates.metadata || existingMetadata;
      
      updates.metadata = {
        ...newMetadata,
        versions: [
          {
            timestamp: new Date().toISOString(),
            data: snapshot
          },
          ...previousVersions
        ].slice(0, 10)
      };
    }

    const res = await fetch(`/api/cms/content_blocks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(mapToDb(updates))
    });
    if (!res.ok) throw new Error(`Failed to update content block ${id}`);
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  async revertContentBlock(id: string | number): Promise<ContentBlock> {
    const current = await this.getContentBlockById(id);
    if (!current || !current.metadata || !current.metadata.versions || current.metadata.versions.length === 0) {
      throw new Error('No previous versions available to revert to');
    }
    
    const lastVersion = current.metadata.versions[0].data;
    
    const updates: Partial<ContentBlock> = {
      section: lastVersion.section,
      title: lastVersion.title,
      content: lastVersion.content,
      image_url: lastVersion.image_url,
      status: lastVersion.status,
    };
    
    return this.updateContentBlock(id, updates);
  },

  async deleteContentBlock(id: string | number): Promise<void> {
    const res = await fetch(`/api/cms/content_blocks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to delete content block ${id}`);
  },

  // --- News and Events ---

  async getNewsEventsByType(type: 'news' | 'event', includeFuture: boolean = false): Promise<NewsEvent[]> {
    const res = await fetch(`/api/cms/news_events?type=${type}&includeFuture=${includeFuture}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch ${type}`);
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  async getNewsEventById(id: string | number): Promise<NewsEvent | null> {
    const res = await fetch(`/api/cms/news_events/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch news/event ${id}`);
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  async createNewsEvent(item: Partial<NewsEvent>): Promise<NewsEvent> {
    const res = await fetch('/api/cms/news_events', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(mapToDb(item))
    });
    if (!res.ok) throw new Error('Failed to create news/event');
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  async updateNewsEvent(id: string | number, updates: Partial<NewsEvent>): Promise<NewsEvent> {
    const current = await this.getNewsEventById(id);
    if (current) {
      const snapshot = { ...current };
      delete snapshot.metadata;
      
      const existingMetadata = current.metadata || {};
      const previousVersions = existingMetadata.versions || [];
      const newMetadata = updates.metadata || existingMetadata;
      
      updates.metadata = {
        ...newMetadata,
        versions: [
          {
            timestamp: new Date().toISOString(),
            data: snapshot
          },
          ...previousVersions
        ].slice(0, 10)
      };
    }

    const res = await fetch(`/api/cms/news_events/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(mapToDb(updates))
    });
    if (!res.ok) throw new Error(`Failed to update news/event ${id}`);
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  async revertNewsEvent(id: string | number): Promise<NewsEvent> {
    const current = await this.getNewsEventById(id);
    if (!current || !current.metadata || !current.metadata.versions || current.metadata.versions.length === 0) {
      throw new Error('No previous versions available to revert to');
    }
    
    const lastVersion = current.metadata.versions[0].data;
    
    const updates: Partial<NewsEvent> = {
      type: lastVersion.type,
      title: lastVersion.title,
      content: lastVersion.content,
      image_url: lastVersion.image_url,
      status: lastVersion.status,
      date: lastVersion.date,
      publish_date: lastVersion.publish_date,
      location: lastVersion.location,
    };
    
    return this.updateNewsEvent(id, updates);
  },

  async deleteNewsEvent(id: string | number): Promise<void> {
    const res = await fetch(`/api/cms/news_events/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to delete news/event ${id}`);
  },

  // --- Activity Log ---
  
  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const res = await fetch(`/api/cms/activity?limit=${limit}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch activity log');
    return res.json().then(data => Array.isArray(data) ? data.map(mapFromDb) : mapFromDb(data));
  },

  // --- Storage ---
  
  async uploadImage(file: File, bucket: string = 'public'): Promise<string> {
    const formData = new FormData();
    formData.append('document', file); // Use 'document' as the field name as expected by the server

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
};
