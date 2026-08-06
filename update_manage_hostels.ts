import * as fs from 'fs';

const content = `import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Home, Plus, Building2, Users, BedDouble, ChevronLeft, DoorOpen, Save } from 'lucide-react';

export default function ManageHostels() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', capacity: '', gender: 'Mixed', description: '' });

  // Room Management State
  const [selectedHostel, setSelectedHostel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomFormData, setRoomFormData] = useState({ roomNumber: '', capacity: '' });

  useEffect(() => {
    fetchHostels();
  }, [token]);

  const fetchHostels = () => {
    fetch('/api/hostels', {
      headers: { Authorization: \`Bearer \${token}\` }
    })
    .then(res => res.json())
    .then(data => {
      setHostels(Array.isArray(data) ? data : []);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  const fetchRooms = (hostelId: string) => {
    setIsRoomsLoading(true);
    fetch(\`/api/hostels/\${hostelId}/rooms\`, {
      headers: { Authorization: \`Bearer \${token}\` }
    })
    .then(res => res.json())
    .then(data => {
      setRooms(Array.isArray(data) ? data : []);
      setIsRoomsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsRoomsLoading(false);
    });
  };

  const handleSelectHostel = (hostel: any) => {
    setSelectedHostel(hostel);
    fetchRooms(hostel.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hostels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity)
        })
      });
      
      if (res.ok) {
        const newHostel = await res.json();
        setHostels(prev => [...prev, newHostel]);
        setShowForm(false);
        setFormData({ name: '', capacity: '', gender: 'Mixed', description: '' });
        notify({ title: 'Success', message: 'Hostel created successfully', type: 'success' });
      } else {
        const err = await res.json();
        notify({ title: 'Error', message: err.error || 'Failed to create hostel', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHostel) return;
    try {
      const res = await fetch(\`/api/hostels/\${selectedHostel.id}/rooms\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({
          roomNumber: roomFormData.roomNumber,
          capacity: parseInt(roomFormData.capacity)
        })
      });
      
      if (res.ok) {
        const newRoom = await res.json();
        setRooms(prev => [...prev, newRoom]);
        setShowRoomForm(false);
        setRoomFormData({ roomNumber: '', capacity: '' });
        notify({ title: 'Success', message: 'Room added successfully', type: 'success' });
      } else {
        const err = await res.json();
        notify({ title: 'Error', message: err.error || 'Failed to add room', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    }
  };

  if (selectedHostel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedHostel(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <DoorOpen className="w-8 h-8 text-indigo-600" />
              Rooms in {selectedHostel.name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage rooms and capacities for this block.</p>
          </div>
          <div className="ml-auto">
            <button 
              onClick={() => setShowRoomForm(!showRoomForm)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" /> Add Room
            </button>
          </div>
        </div>

        {showRoomForm && (
          <form onSubmit={handleAddRoom} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Add New Room</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
                <input 
                  type="text" required 
                  value={roomFormData.roomNumber} onChange={e => setRoomFormData({...roomFormData, roomNumber: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  placeholder="e.g. 101"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                <input 
                  type="number" required min="1"
                  value={roomFormData.capacity} onChange={e => setRoomFormData({...roomFormData, capacity: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  placeholder="Number of beds"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowRoomForm(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Room
              </button>
            </div>
          </form>
        )}

        {isRoomsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="bg-white dark:bg-slate-800 h-32 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">No Rooms Found</h4>
            <p className="text-slate-500 dark:text-slate-400">Add rooms to this hostel block to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map(room => (
              <div key={room.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white">Room {room.roomNumber}</h4>
                  <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase \${
                    room.occupancy >= room.capacity 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }\`}>
                    {room.occupancy >= room.capacity ? 'Full' : 'Available'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-2">
                  <Users className="w-4 h-4" /> 
                  <span className="font-medium">{room.occupancy}</span> / {room.capacity} occupied
                </div>
                <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={\`h-full \${room.occupancy >= room.capacity ? 'bg-red-500' : 'bg-emerald-500'}\`} 
                    style={{ width: \`\${Math.min(100, (room.occupancy / room.capacity) * 100)}%\` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-600" />
            Manage Hostels
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure and monitor campus accommodation blocks.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" /> Add Hostel
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Add New Hostel Block</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input 
                type="text" required 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="e.g. Block A"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
              <input 
                type="number" required 
                value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="Total bed spaces"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select 
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input 
                type="text" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Save Hostel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-slate-800 h-40 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => (
            <div key={hostel.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{hostel.name}</h3>
                <span className={\`px-2 py-1 rounded text-xs font-bold \${
                  hostel.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                  hostel.status === 'Full' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }\`}>
                  {hostel.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">{hostel.description || 'No description provided.'}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users className="w-4 h-4" /> {hostel.gender}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <BedDouble className="w-4 h-4" /> {hostel.capacity} beds
                </div>
              </div>
              
              <button 
                onClick={() => handleSelectHostel(hostel)}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2"
              >
                <DoorOpen className="w-4 h-4" /> Manage Rooms
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/dashboards/admin/ManageHostels.tsx', content);
console.log('Updated ManageHostels.tsx');
