import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, FileText, Heart, Clock, Book, BookOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';

export default function ResourceLibrary() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'materials' | 'favorites' | 'library'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchMaterials();
    fetchFavorites();
    fetchBooks();
    fetchLoans();
  }, [token]);

  const fetchMaterials = () => {
    fetch('/api/student/documents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setMaterials(Array.isArray(data) ? data : []);
      setIsLoading(false);
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };
  
  const fetchFavorites = () => {
    fetch('/api/student/favorite-documents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setFavorites(Array.isArray(data) ? data : []);
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  const fetchBooks = () => {
    fetch('/api/library/books', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setBooks(Array.isArray(data) ? data : []);
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  const fetchLoans = () => {
    fetch('/api/student/loans', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setLoans(Array.isArray(data) ? data : []);
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  const toggleFavorite = (docId: number) => {
    fetch(`/api/student/favorite-documents/\${docId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        setMaterials(materials.map(m => m.id === docId ? { ...m, isFavorite: data.favorited } : m));
        fetchFavorites();
        notify({ title: 'Success', message: data.favorited ? 'Added to favorites' : 'Removed from favorites', type: 'success' });
      }
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  const handleBorrow = (bookId: number) => {
    fetch(`/api/student/loans/\${bookId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        notify({ title: 'Success', message: 'Book borrowed successfully', type: 'success' });
        fetchBooks();
        fetchLoans();
      } else {
        notify({ title: 'Error', message: data.error || 'Failed to borrow book', type: 'error' });
      }
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  const handleReturn = (loanId: number) => {
    fetch(`/api/student/loans/\${loanId}/return`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        notify({ title: 'Success', message: 'Book returned successfully', type: 'success' });
        fetchBooks();
        fetchLoans();
      } else {
        notify({ title: 'Error', message: data.error || 'Failed to return book', type: 'error' });
      }
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  const displayedList = activeTab === 'materials' ? materials : favorites;
  const filteredList = displayedList.filter(doc => 
    (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doc.courseCode && doc.courseCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))].filter(Boolean);

  const filteredBooks = books.filter(b => {
     const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
     return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 print:space-y-4 print:block print:p-0 print:m-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Resource Library</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Access course materials, saved favorites, and physical library books.</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-max print:hidden">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'materials' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <FileText className="w-4 h-4" /> All Materials
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Heart className="w-4 h-4" /> Favorites
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'library' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Book className="w-4 h-4" /> Library Books
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:rounded-none print:bg-transparent">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4 print:hidden">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'library' ? "Search books..." : "Search materials..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
            />
          </div>
        </div>

        {(activeTab === 'materials' || activeTab === 'favorites') && (
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resource</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {isLoading ? (
                  <tr>
                     <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                       Loading materials...
                     </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                     <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                       No materials found.
                     </td>
                  </tr>
                ) : filteredList.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <a href={doc.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                            {doc.title}
                          </a>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                        {doc.courseCode}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{doc.category}</span>
                    </td>
                    <td className="p-4 print:hidden">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleFavorite(doc.id)}
                          className={`p-2 rounded-full transition-colors ${(activeTab === 'favorites' || doc.isFavorite) ? 'text-red-500 bg-red-50 dark:bg-red-900/30' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                          title="Toggle Favorite"
                        >
                          <Heart className={`w-4 h-4 ${(activeTab === 'favorites' || doc.isFavorite) ? 'fill-current' : ''}`} />
                        </button>
                        <a 
                          href={doc.fileUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="p-6">
            
            {/* Active Loans Section */}
            {loans.filter(l => l.status === 'active' || l.status === 'overdue').length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> My Borrowed Books
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loans.filter(l => l.status === 'active' || l.status === 'overdue').map(loan => {
                    const isOverdue = new Date(loan.dueDate) < new Date();
                    return (
                      <div key={loan.id} className={`p-4 rounded-xl border ${isOverdue ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : 'border-indigo-100 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-900/20'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1" title={loan.bookTitle}>{loan.bookTitle}</h4>
                          {isOverdue && <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">Overdue</span>}
                        </div>
                        <div className="text-xs space-y-1 mb-4 text-slate-600 dark:text-slate-400">
                          <p>Borrowed: {new Date(loan.borrowedDate).toLocaleDateString()}</p>
                          <p className={isOverdue ? "text-red-600 dark:text-red-400 font-semibold" : ""}>
                            Due: {new Date(loan.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleReturn(loan.id)}
                          className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors print:hidden"
                        >
                          Return Book
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Book className="w-5 h-5 text-indigo-500" /> Library Catalog
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === category 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <div key={book.id} className="group border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white dark:bg-slate-800 flex flex-col h-full">
                  <div className={`h-40 ${book.coverColor || 'bg-slate-200'} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                    {book.fileUrl ? <FileText className="w-12 h-12 text-white/50" /> : <Book className="w-12 h-12 text-white/50" />}
                    {book.fileUrl ? (
                       <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/80 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                         E-Book
                       </div>
                    ) : !book.available && (
                       <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                         Borrowed
                       </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 block">
                        {book.category || 'Uncategorized'}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1">
                        {book.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-4">
                        {book.author}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto print:hidden">
                      {book.fileUrl ? (
                        <a 
                          href={book.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors print:hidden"
                        >
                          <Download className="w-4 h-4" /> Download
                        </a>
                      ) : book.available ? (
                        <button 
                          onClick={() => handleBorrow(book.id)}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-lg text-sm font-medium transition-colors print:hidden"
                        >
                          Reserve Book
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed print:hidden"
                        >
                          Currently Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && (
                 <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
                   <Book className="w-12 h-12 opacity-20 mb-3" />
                   <p>No books found matching your criteria.</p>
                 </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
