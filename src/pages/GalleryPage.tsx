import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Image as ImageIcon, Folder, X, Filter } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'photo' | 'video' | 'album';
  title: string;
  url: string;
  thumbnail: string;
  category: string;
  date: string;
  itemCount?: number; // for albums
}

const mockGallery: MediaItem[] = [
  { id: '1', type: 'photo', title: 'Main Library Exterior', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80', category: 'Campus Life', date: '2025-10-12' },
  { id: '2', type: 'photo', title: 'Computer Science Lab', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', category: 'Academics', date: '2025-11-05' },
  { id: '3', type: 'album', title: 'Graduation Class of 2025', url: '', thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80', category: 'Graduation', date: '2025-07-20', itemCount: 120 },
  { id: '4', type: 'video', title: 'Campus Tour', url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80', category: 'Campus Life', date: '2025-09-01' },
  { id: '5', type: 'photo', title: 'Annual Tech Symposium', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80', category: 'Events', date: '2026-03-15' },
  { id: '6', type: 'photo', title: 'Basketball Championship', url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=80', category: 'Sports', date: '2026-02-28' },
  { id: '7', type: 'video', title: "Dean's Welcome Message", url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail: 'https://images.unsplash.com/photo-1555438867-b50a2de0dfd1?auto=format&fit=crop&w=600&q=80', category: 'Academics', date: '2026-01-10' },
  { id: '8', type: 'album', title: 'Cultural Week 2026', url: '', thumbnail: 'https://images.unsplash.com/photo-1533174000276-24ba0cae2ee4?auto=format&fit=crop&w=600&q=80', category: 'Events', date: '2026-04-05', itemCount: 45 },
  { id: '9', type: 'photo', title: 'Research Center Innovation', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', category: 'Research', date: '2026-05-12' },
];

const categories = ['All', 'Campus Life', 'Academics', 'Graduation', 'Events', 'Sports', 'Research'];
const mediaTypes = ['All', 'Photo', 'Video', 'Album'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  const filteredGallery = useMemo(() => {
    return mockGallery.filter(item => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const typeMatch = selectedType === 'All' || item.type.toLowerCase() === selectedType.toLowerCase();
      return categoryMatch && typeMatch;
    });
  }, [selectedCategory, selectedType]);

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-emerald-900 mb-4 tracking-tight">Gallery & Media</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our campus life, academic achievements, events, and memories through our curated collection of photos, videos, and albums.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Filter By</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1 md:justify-end">
            {/* Category Filter */}
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex-1 max-w-xs sm:ml-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Media Type</label>
              <div className="flex flex-wrap gap-2">
                {mediaTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedType === type 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredGallery.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer"
                onClick={() => setLightboxItem(item)}
              >
                {/* Image Container with Native Lazy Loading */}
                <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-100">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  {/* Icons */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                    {item.type === 'photo' && <ImageIcon className="w-5 h-5 text-emerald-600" />}
                    {item.type === 'video' && <Play className="w-5 h-5 text-purple-600 ml-0.5" />}
                    {item.type === 'album' && <Folder className="w-5 h-5 text-blue-600" />}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded">
                      {item.category}
                    </span>
                  </div>

                  {/* Content Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg leading-tight mb-1">{item.title}</h3>
                    <div className="flex items-center justify-between text-emerald-50 text-xs font-medium">
                      <span>{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      {item.type === 'album' && <span>{item.itemCount} Items</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredGallery.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Filter className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg">No media found for the selected filters.</p>
            <button 
              onClick={() => { setSelectedCategory('All'); setSelectedType('All'); }}
              className="mt-4 text-emerald-600 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxItem(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110]"
              onClick={() => setLightboxItem(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div 
              className="relative w-full max-w-5xl max-h-full flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              {lightboxItem.type === 'video' ? (
                <video 
                  controls 
                  autoPlay 
                  className="w-full max-h-[80vh] rounded-xl shadow-2xl bg-black"
                  src={lightboxItem.url}
                >
                  Your browser does not support the video tag.
                </video>
              ) : lightboxItem.type === 'album' ? (
                <div className="bg-white rounded-2xl p-12 text-center max-w-lg w-full">
                  <Folder className="w-20 h-20 text-blue-600 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{lightboxItem.title}</h2>
                  <p className="text-gray-500 mb-8">{lightboxItem.itemCount} Items • {lightboxItem.category}</p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full shadow-lg">
                    View Full Album
                  </button>
                </div>
              ) : (
                <img 
                  src={lightboxItem.url} 
                  alt={lightboxItem.title} 
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                />
              )}
              
              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-bold mb-1">{lightboxItem.title}</h3>
                <p className="text-gray-400 font-medium">
                  {lightboxItem.category} • {new Date(lightboxItem.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
