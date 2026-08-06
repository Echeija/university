import { User, ShieldCheck, GraduationCap, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PortalsPage() {
  const portals = [
    { name: 'Student Portal', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-500', link: '/login' },
    { name: 'Lecturer Portal', icon: User, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-500', link: '/login' },
    { name: 'Admin Portal', icon: ShieldCheck, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'hover:border-emerald-700', link: '/login' },
    { name: 'ICT / Server', icon: Server, color: 'text-slate-700', bg: 'bg-slate-100', border: 'hover:border-slate-500', link: '/login' },
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">SGCT Portals</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Select your designated portal to securely access the Unified College Information System.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {portals.map((portal) => {
          const Icon = portal.icon;
          return (
            <Link key={portal.name} to={portal.link} className="block group">
              <div className={`bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl ${portal.border} transition-all duration-300 text-center relative overflow-hidden`}>
                <div className={`w-20 h-20 mx-auto rounded-2xl ${portal.bg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <Icon className={`h-10 w-10 ${portal.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{portal.name}</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Secure Access</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-purple-700 transform translate-y-1 group-hover:translate-y-0 transition-transform"></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
