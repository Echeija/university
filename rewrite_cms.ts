import * as fs from 'fs';

let content = fs.readFileSync('src/services/cmsService.ts', 'utf8');

// Replace all supabase calls with fetch calls to the new Express endpoints.
// We'll write the whole file manually.
const newContent = `export interface ContentBlock {
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

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': \`Bearer \${localStorage.getItem('token')}\`
});

export const cmsService = {
  // --- Content Blocks ---
  
  async getContentBlocksBySection(section: string): Promise<ContentBlock[]> {
    const res = await fetch(\`/api/cms/content_blocks?section=\${encodeURIComponent(section)}\`, { headers: getHeaders() });
    if (!res.ok) throw new Error(\`Failed to fetch content blocks for \${section}\`);
    return res.json();
  },

  async getContentBlockById(id: string | number): Promise<ContentBlock | null> {
    const res = await fetch(\`/api/cms/content_blocks/\${id}\`, { headers: getHeaders() });
    if (!res.ok) throw new Error(\`Failed to fetch content block \${id}\`);
    return res.json();
  },

  async createContentBlock(item: Partial<ContentBlock>): Promise<ContentBlock> {
    const res = await fetch('/api/cms/content_blocks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to create content block');
    return res.json();
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

    const res = await fetch(\`/api/cms/content_blocks/\${id}\`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(\`Failed to update content block \${id}\`);
    return res.json();
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
    const res = await fetch(\`/api/cms/content_blocks/\${id}\`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(\`Failed to delete content block \${id}\`);
  },

  // --- News and Events ---

  async getNewsEventsByType(type: 'news' | 'event', includeFuture: boolean = false): Promise<NewsEvent[]> {
    const res = await fetch(\`/api/cms/news_events?type=\${type}&includeFuture=\${includeFuture}\`, { headers: getHeaders() });
    if (!res.ok) throw new Error(\`Failed to fetch \${type}\`);
    return res.json();
  },

  async getNewsEventById(id: string | number): Promise<NewsEvent | null> {
    const res = await fetch(\`/api/cms/news_events/\${id}\`, { headers: getHeaders() });
    if (!res.ok) throw new Error(\`Failed to fetch news/event \${id}\`);
    return res.json();
  },

  async createNewsEvent(item: Partial<NewsEvent>): Promise<NewsEvent> {
    const res = await fetch('/api/cms/news_events', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to create news/event');
    return res.json();
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

    const res = await fetch(\`/api/cms/news_events/\${id}\`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(\`Failed to update news/event \${id}\`);
    return res.json();
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
    const res = await fetch(\`/api/cms/news_events/\${id}\`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(\`Failed to delete news/event \${id}\`);
  },

  // --- Activity Log ---
  
  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const res = await fetch(\`/api/cms/activity?limit=\${limit}\`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch activity log');
    return res.json();
  },

  // --- Storage ---
  
  async uploadImage(file: File, bucket: string = 'public'): Promise<string> {
    const formData = new FormData();
    formData.append('document', file); // Use 'document' as the field name as expected by the server

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`
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
`;

fs.writeFileSync('src/services/cmsService.ts', newContent);
console.log('Rewrote cmsService.ts');
