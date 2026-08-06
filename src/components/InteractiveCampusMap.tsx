import { useState, ElementType } from 'react';
import { MapPin, Info, Navigation, Building2, BookOpen, Coffee, Dumbbell, Home, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../contexts/NotificationContext';

type LocationType = 'academic' | 'facility' | 'residential' | 'recreation';

interface CampusLocation {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  icon: ElementType;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
}

const locations: CampusLocation[] = [
  {
    id: 'main-hall',
    name: 'Main Administration Hall',
    type: 'academic',
    description: 'Central administrative offices, admissions, and the main auditorium.',
    icon: Building2,
    x: 50,
    y: 50,
    color: 'bg-emerald-500'
  },
  {
    id: 'library',
    name: 'Central Library',
    type: 'facility',
    description: 'Five stories of books, quiet study areas, and digital resource centers.',
    icon: BookOpen,
    x: 30,
    y: 40,
    color: 'bg-blue-500'
  },
  {
    id: 'science-center',
    name: 'Advanced Science Center',
    type: 'academic',
    description: 'State-of-the-art laboratories for physics, chemistry, and biology.',
    icon: Beaker,
    x: 70,
    y: 35,
    color: 'bg-purple-500'
  },
  {
    id: 'student-union',
    name: 'Student Union Building',
    type: 'recreation',
    description: 'Cafeterias, club rooms, lounges, and the campus bookstore.',
    icon: Coffee,
    x: 45,
    y: 70,
    color: 'bg-amber-500'
  },
  {
    id: 'sports-complex',
    name: 'Athletics & Sports Complex',
    type: 'recreation',
    description: 'Indoor stadium, Olympic pool, gym, and outdoor sports fields.',
    icon: Dumbbell,
    x: 80,
    y: 65,
    color: 'bg-rose-500'
  },
  {
    id: 'dorms-north',
    name: 'North Residence Halls',
    type: 'residential',
    description: 'Freshman and sophomore dormitories with common dining halls.',
    icon: Home,
    x: 25,
    y: 65,
    color: 'bg-indigo-500'
  }
];

export default function InteractiveCampusMap() {
  const [activeLocation, setActiveLocation] = useState<CampusLocation | null>(null);
  const { notify } = useNotification();

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="mb-8 shrink-0">
        <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-emerald-600" />
          Interactive Campus Map
        </h3>
        <p className="text-slate-500 mt-2">Explore our facilities and find your way around the campus.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Map Area */}
        <div className="relative flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden min-h-[300px] lg:min-h-[350px]">
          {/* Decorative background grid to look like a map blueprint */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }}></div>
          
          {/* Paths (decorative SVG) */}
          <svg className="absolute inset-0 w-full h-full text-slate-200" preserveAspectRatio="none">
            <path d="M 50% 50% L 30% 40% M 50% 50% L 70% 35% M 50% 50% L 45% 70% M 45% 70% L 25% 65% M 45% 70% L 80% 65%" stroke="currentColor" strokeWidth="4" strokeDasharray="8 8" fill="none" />
          </svg>

          {/* Location Pins */}
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActiveLocation(loc)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            >
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-transform duration-300 ${
                activeLocation?.id === loc.id ? 'scale-110 ring-4 ring-emerald-500/30' : 'hover:scale-110'
              } ${loc.color} text-white`}>
                <loc.icon className="w-6 h-6" />
                
                {/* Ping animation for active location */}
                {activeLocation?.id === loc.id && (
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${loc.color}`}></span>
                )}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-[120px]">
                <span className={`block text-xs font-bold px-2 py-1 rounded shadow-sm text-center transition-opacity ${
                  activeLocation?.id === loc.id ? 'bg-slate-900 text-white opacity-100' : 'bg-white text-slate-700 opacity-0 group-hover:opacity-100'
                }`}>
                  {loc.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Details Panel */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-full min-h-[300px] flex flex-col">
            <AnimatePresence mode="wait">
              {activeLocation ? (
                <motion.div
                  key={activeLocation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col h-full"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md ${activeLocation.color}`}>
                    <activeLocation.icon className="w-7 h-7" />
                  </div>
                  
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700 w-max mb-3">
                    {activeLocation.type}
                  </span>
                  
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{activeLocation.name}</h4>
                  
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {activeLocation.description}
                  </p>
                  
                  <div className="mt-auto space-y-3">
                    <button 
                      onClick={() => notify({ title: 'Navigation Started', message: `Directions to ${activeLocation.name} have been sent to your mobile device.`, type: 'success' })}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Navigation className="w-5 h-5" />
                      Get Directions
                    </button>
                    <button 
                      onClick={() => notify({ title: 'Feature in Development', message: `Detailed floor plans for ${activeLocation.name} will be available soon.`, type: 'info' })}
                      className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Info className="w-5 h-5" />
                      More Details
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center text-slate-400"
                >
                  <MapPin className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium text-lg text-slate-500 mb-2">Select a Location</p>
                  <p className="text-sm">Click on any map pin to view building details and directions.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
