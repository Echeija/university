import React, { useState, useEffect } from 'react';
import { Search, Book, Library, Clock, CheckCircle2, Bookmark, BookmarkPlus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';

interface BookItem {
  id: number;
  title: string;
  author: string;
  category: string;
  coverColor: string;
  available: boolean;
}

interface HoldItem {
  id: number;
  status: string;
  borrowedDate: string;
  dueDate: string;
  book: BookItem;
}

export default function LibraryBooking() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [myHolds, setMyHolds] = useState<HoldItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState<number | null>(null);
  
  const { token } = useAuth();
  const { notify } = useNotification();

  const fetchBooks = () => {
    fetch('/api/library/books' + (search ? '?search=' + encodeURIComponent(search) : ''), {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBooks(data);
      })
      .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  const fetchMyHolds = () => {
    fetch('/api/library/my-holds', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMyHolds(data);
      })
      .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  useEffect(() => {
    fetchBooks();
    fetchMyHolds();
    setIsLoading(false);
  }, [token, search]);

  const handleReserve = async (bookId: number) => {
    setIsReserving(bookId);
    try {
      const res = await fetch('/api/library/books/' + bookId + '/hold', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Book reserved successfully', type: 'success' });
        fetchBooks();
        fetchMyHolds();
      } else {
        notify({ title: 'Error', message: data.error || 'Failed to reserve book', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    } finally {
      setIsReserving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Library className="w-8 h-8 text-indigo-600" />
          Library Resource Booking
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Search the catalog and place hold requests for library books.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by book title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:text-white"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Book className="w-5 h-5 text-indigo-500" />
                Library Catalog
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
              {books.length === 0 ? (
                <div className="p-12 text-center">
                  <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">No books found</h4>
                  <p className="text-slate-500">Try adjusting your search criteria.</p>
                </div>
              ) : (
                books.map(book => (
                  <div key={book.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`w-16 h-20 rounded-md shadow-sm shrink-0 ${book.coverColor || 'bg-indigo-100'}`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate">{book.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">by {book.author}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {book.category}
                        </span>
                        {book.available ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Available
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleReserve(book.id)}
                        disabled={!book.available || isReserving === book.id}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                      >
                        {isReserving === book.id ? 'Reserving...' : (
                          <>
                            <BookmarkPlus className="w-4 h-4" /> Place Hold
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: My Holds */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-500" />
                My Requests & Holds
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[700px] overflow-y-auto">
              {myHolds.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  You have no active hold requests.
                </div>
              ) : (
                myHolds.map(hold => (
                  <div key={hold.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex gap-4 mb-3">
                      <div className={`w-12 h-16 rounded-md shadow-sm shrink-0 ${hold.book.coverColor || 'bg-indigo-100'}`}></div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">{hold.book.title}</h4>
                        <p className="text-slate-500 text-xs mt-1">by {hold.book.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="font-medium text-slate-500">
                        Due: {new Date(hold.dueDate).toLocaleDateString()}
                      </span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 capitalize">
                        {hold.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
