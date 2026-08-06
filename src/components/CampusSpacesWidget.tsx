import React, { useState, useEffect } from 'react';
import { MapPin, Calendar as CalendarIcon, Users, Plus, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { format, parseISO } from 'date-fns';

export default function CampusSpacesWidget({ searchQuery = '' }: { searchQuery?: string }) {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  
  const [spaces, setSpaces] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  const [spaceForm, setSpaceForm] = useState({ name: '', capacity: '', type: 'Lecture Hall', equipment: [] as string[] });
  const [bookingForm, setBookingForm] = useState({ 
    spaceId: '', 
    purpose: '', 
    date: format(new Date(), 'yyyy-MM-dd'), 
    startTime: '09:00', 
    endTime: '11:00' 
  });

  const canManage = user?.role === 'Administrator' || user?.role === 'Academic Officer';
  const canBook = canManage || user?.role === 'Student';

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [spacesRes, bookingsRes] = await Promise.all([
        fetch('/api/academic/spaces', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/academic/space-bookings', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (spacesRes.ok) setSpaces(await spacesRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academic/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...spaceForm, capacity: parseInt(spaceForm.capacity) })
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Space added', type: 'success' });
        setShowSpaceForm(false);
        setSpaceForm({ name: '', capacity: '', type: 'Lecture Hall', equipment: [] });
        fetchData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to add space', type: 'error' });
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academic/space-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bookingForm)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Booking created', type: 'success' });
        setShowBookingForm(false);
        setBookingForm({ ...bookingForm, purpose: '' });
        fetchData();
      } else {
        const err = await res.json();
        notify({ title: 'Conflict Detected', message: err.error || 'Failed to book space', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    }
  };

  const handleDeleteSpace = async (id: number) => {
    if (!confirm('Delete this space? All associated bookings will be lost.')) return;
    try {
      const res = await fetch(`/api/academic/spaces/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Space deleted', type: 'success' });
        fetchData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete space', type: 'error' });
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await fetch(`/api/academic/space-bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Booking cancelled', type: 'success' });
        fetchData();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to cancel booking', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spaces List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              Campus Spaces
            </h3>
            {canManage && (
              <button onClick={() => setShowSpaceForm(!showSpaceForm)} className="p-1.5 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[500px]">
            {showSpaceForm && canManage && (
              <form onSubmit={handleCreateSpace} className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Space Name</label>
                  <input required type="text" value={spaceForm.name} onChange={e => setSpaceForm({...spaceForm, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" placeholder="e.g. Hall A" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                    <input required type="number" min="1" value={spaceForm.capacity} onChange={e => setSpaceForm({...spaceForm, capacity: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" placeholder="e.g. 150" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select value={spaceForm.type} onChange={e => setSpaceForm({...spaceForm, type: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700">
                      <option value="Lecture Hall">Lecture Hall</option>
                      <option value="Exam Hall">Exam Hall</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Seminar Room">Seminar Room</option>
                      <option value="Study Pod">Study Pod</option>
                    </select>
                  </div>

                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Equipment</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input type="checkbox" checked={spaceForm.equipment.includes('Projector')} onChange={e => {
                        const newEq = e.target.checked ? [...spaceForm.equipment, 'Projector'] : spaceForm.equipment.filter(eq => eq !== 'Projector');
                        setSpaceForm({...spaceForm, equipment: newEq});
                      }} /> Projector
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input type="checkbox" checked={spaceForm.equipment.includes('Whiteboard')} onChange={e => {
                        const newEq = e.target.checked ? [...spaceForm.equipment, 'Whiteboard'] : spaceForm.equipment.filter(eq => eq !== 'Whiteboard');
                        setSpaceForm({...spaceForm, equipment: newEq});
                      }} /> Whiteboard
                    </label>
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700">Add Space</button>
              </form>
            )}

            <div className="space-y-3">
              {spaces.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.type.toLowerCase().includes(searchQuery.toLowerCase())).map(space => (
                <div key={space.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{space.name}</h4>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {space.capacity}</span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{space.type}</span>
                      {space.equipment?.length > 0 && (
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                          {space.equipment.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <button onClick={() => handleDeleteSpace(space.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {spaces.length === 0 && !isLoading && (
                <div className="text-center py-8 text-slate-500">No spaces defined.</div>
              )}
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-500" />
              Room Bookings & Schedule
            </h3>
            {canBook && (
              <button onClick={() => setShowBookingForm(!showBookingForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                <Plus className="w-4 h-4" /> New Booking
              </button>
            )}
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[500px]">
            {showBookingForm && canBook && (
              <form onSubmit={handleCreateBooking} className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Book a Space
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Space</label>
                    <select required value={bookingForm.spaceId} onChange={e => setBookingForm({...bookingForm, spaceId: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700">
                      <option value="">-- Choose Space --</option>
                      {spaces.filter(s => canManage || s.type === 'Study Pod').map(s => <option key={s.id} value={s.id}>{s.name} ({s.capacity})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Purpose / Event Name</label>
                    <input required type="text" value={bookingForm.purpose} onChange={e => setBookingForm({...bookingForm, purpose: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" placeholder="e.g. Final Exam - CSC 101" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input required type="date" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                    <input required type="time" value={bookingForm.startTime} onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                    <input required type="time" value={bookingForm.endTime} onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700">Confirm Booking</button>
              </form>
            )}

            <div className="space-y-4">
              {bookings.filter(b => b.spaceName.toLowerCase().includes(searchQuery.toLowerCase()) || b.purpose.toLowerCase().includes(searchQuery.toLowerCase()) || b.bookedByName.toLowerCase().includes(searchQuery.toLowerCase())).map(booking => (
                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow bg-white dark:bg-slate-800">
                  <div className="flex items-start gap-4 mb-3 sm:mb-0">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg shrink-0">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight">{booking.purpose}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-4 h-4 text-slate-400" /> {booking.spaceName}</span>
                        <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-slate-400" /> {format(parseISO(booking.date), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0 border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 text-right sm:text-left">
                      Booked by<br/>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{booking.bookedBy}</span>
                    </div>
                    {canManage && (
                      <button onClick={() => handleDeleteBooking(booking.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {bookings.length === 0 && !isLoading && (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="bg-slate-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">No upcoming bookings</h3>
                  <p className="mt-1 text-sm text-slate-500">Get started by booking a campus space for an event or exam.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
