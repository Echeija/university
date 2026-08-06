import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Search, FlaskConical, Microscope, Clock, Calendar as CalendarIcon, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';

interface Space {
  id: number;
  name: string;
  capacity: number;
  type: string;
  equipment: string[];
}

interface Booking {
  id: number;
  spaceId: number;
  spaceName?: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  bookedBy?: string;
}

export default function ResearchLabBooking() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  
  const [search, setSearch] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking form state
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSpaces();
      fetchBookings();
    }
  }, [token]);

  const fetchSpaces = async () => {
    try {
      const res = await fetch('/api/academic/spaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Space[] = await res.json();
        setSpaces(data.filter(s => s.type === 'Laboratory'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/academic/space-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Booking[] = await res.json();
        setAllBookings(data);
        if (user) {
          setMyBookings(data.filter(b => b.bookedBy === user.name));
        }
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const filteredSpaces = spaces.filter(space => {
    const searchLower = search.toLowerCase();
    const nameMatch = space.name.toLowerCase().includes(searchLower);
    const equipMatch = space.equipment.some(e => e.toLowerCase().includes(searchLower));
    return nameMatch || equipMatch;
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) return;
    
    setIsSubmitting(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await fetch('/api/academic/space-bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          spaceId: selectedSpace.id,
          purpose,
          date: formattedDate,
          startTime,
          endTime
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Lab booked successfully.', type: 'success' });
        fetchBookings();
        setSelectedSpace(null);
        setPurpose('');
      } else {
        notify({ title: 'Error', message: data.error || 'Failed to book lab', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkAvailability = (spaceId: number, checkDate: Date, start: string, end: string) => {
    const toMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    
    const conflicts = allBookings.filter(b => {
      if (b.spaceId !== spaceId) return false;
      const bDate = new Date(b.date);
      if (!isSameDay(bDate, checkDate)) return false;
      
      const bStartMin = toMinutes(b.startTime);
      const bEndMin = toMinutes(b.endTime);
      
      return (startMin < bEndMin && endMin > bStartMin);
    });
    
    return conflicts.length === 0;
  };
  
  // Date options for booking
  const dateOptions = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading labs...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <FlaskConical className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            Research Lab Booking
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Check equipment availability and reserve time slots for your projects.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <div className="relative mb-6">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by lab name or equipment (e.g. 'Microscope', '3D Printer')..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-4">
              {filteredSpaces.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <Microscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-600 dark:text-slate-400">No labs or equipment found matching your search.</p>
                </div>
              ) : (
                filteredSpaces.map(space => (
                  <div key={space.id} className={`p-4 rounded-xl border transition-colors cursor-pointer ${selectedSpace?.id === space.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`} onClick={() => setSelectedSpace(space)}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{space.name}</h3>
                        <p className="text-sm text-slate-500">Capacity: {space.capacity} students</p>
                      </div>
                      <div className="flex gap-2">
                         <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold">
                           {space.type}
                         </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Equipment</p>
                      <div className="flex flex-wrap gap-2">
                        {space.equipment.length > 0 ? space.equipment.map((eq, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-600">
                            {eq}
                          </span>
                        )) : (
                          <span className="text-sm text-slate-500">No specialized equipment listed.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Booking Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-500" />
              Reserve a Time Slot
            </h2>
            
            {!selectedSpace ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                <ChevronRight className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Select a laboratory from the list to book a slot.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50 mb-4">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Selected: {selectedSpace.name}</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date</label>
                  <select
                    value={format(date, 'yyyy-MM-dd')}
                    onChange={e => setDate(new Date(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    {dateOptions.map(d => (
                      <option key={d.toISOString()} value={format(d, 'yyyy-MM-dd')}>
                        {format(d, 'EEEE, MMM do, yyyy')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Project / Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="e.g. Final Year Project Robotics"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {!checkAvailability(selectedSpace.id, date, startTime, endTime) && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Time slot conflicts with an existing booking.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !checkAvailability(selectedSpace.id, date, startTime, endTime)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            )}
          </div>

          {/* My Bookings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              My Upcoming Bookings
            </h2>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {myBookings.filter(b => new Date(b.date) >= new Date(new Date().setHours(0,0,0,0))).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">You have no upcoming lab bookings.</p>
              ) : (
                myBookings
                  .filter(b => new Date(b.date) >= new Date(new Date().setHours(0,0,0,0)))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(booking => (
                    <div key={booking.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white">{booking.spaceName || 'Laboratory'}</h4>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">"{booking.purpose}"</p>
                      <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {format(new Date(booking.date), 'MMM do, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.startTime} - {booking.endTime}
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
