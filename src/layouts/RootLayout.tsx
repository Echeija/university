import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import AnimatedOutlet from '../components/AnimatedOutlet';

export default function RootLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { 
      name: 'About', 
      path: '/about',
      subLinks: [
        { name: 'About SGCT', path: '/about' },
        { name: 'Management Staff', path: '/management-staff' },
        { name: 'Administrative Staff', path: '/administrative-staff' }
      ]
    },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Faculties', path: '/faculties' },
    { name: 'Research', path: '/research' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Utility Bar */}
      <div className="hidden md:flex h-10 bg-emerald-900 text-white items-center justify-between px-8 text-xs font-medium">
        <div className="flex items-center gap-6">
          <span>📍 Makurdi, Benue State, Nigeria</span>
          <span>📞 08066007914 SMART GLOBAL COLLEGE OF TECHNOLOGY</span>
        </div>
        <div className="flex gap-4">
          <span className="opacity-80">NBTE & NUC Accredited Institutional Portal</span>
          <Link to="/lms" className="bg-purple-700 px-2 py-0.5 rounded hover:bg-purple-600 transition-colors">LMS LIVE</Link>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between py-4 items-center">
            <Link to="/" className="flex items-center gap-3 shrink-0 mr-4 lg:mr-8">
              <img src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" alt="Smart Global Logo" className="w-[120px] h-[120px] object-contain" />
              <div className="flex flex-col">
                <span className="font-extrabold text-[34px] text-emerald-900 leading-none">SMART GLOBAL</span>
                <span className="text-[17px] text-purple-600 tracking-[0.2em] font-bold uppercase mt-1">College of Technology</span>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-8 text-sm font-semibold text-gray-700">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  {link.subLinks ? (
                    <>
                      <div className="flex items-center gap-1 cursor-pointer hover:text-emerald-600 transition-colors py-2">
                        <Link to={link.path} className="hover:text-emerald-600">{link.name}</Link>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div className="absolute top-full left-0 mt-0 w-56 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left scale-95 group-hover:scale-100 z-50 overflow-hidden">
                        <div className="py-2">
                          {link.subLinks.map(subLink => (
                            <Link 
                              key={subLink.name} 
                              to={subLink.path} 
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            >
                              {subLink.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      className="hover:text-emerald-600 transition-colors py-2 block"
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex items-center ml-2">
                <GlobalSearch />
              </div>
              <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
              <Link to="/admissions" className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Apply Now</Link>
              <Link to="/portals" className="px-5 py-2.5 border-2 border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors">Staff Login</Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4">
              <div className="w-8">
                <GlobalSearch />
              </div>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-emerald-900" />
                ) : (
                  <Menu className="h-6 w-6 text-emerald-900" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => (
              <div key={link.name} className="border-b border-gray-50 last:border-0 pb-1 mb-1">
                {link.subLinks ? (
                  <>
                    <div className="px-3 py-2 text-base font-bold text-gray-900 flex justify-between items-center bg-gray-50/50 rounded-md">
                      <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)}>{link.name}</Link>
                    </div>
                    <div className="pl-4 py-1 space-y-1">
                      {link.subLinks.map(subLink => (
                        <Link
                          key={subLink.name}
                          to={subLink.path}
                          className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={link.path}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            <Link to="/admissions" className="block px-3 py-2 mt-4 rounded-md text-base font-semibold text-white bg-emerald-600 text-center" onClick={() => setIsMobileMenuOpen(false)}>Apply Now</Link>
            <Link to="/portals" className="block px-3 py-2 mt-2 rounded-md text-base font-semibold text-purple-700 border-2 border-purple-600 text-center" onClick={() => setIsMobileMenuOpen(false)}>Staff Login</Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full" id="print-area">
        <AnimatedOutlet />
      </main>

      {/* Bottom Feature Bar / Footer */}
      <footer className="bg-emerald-900 flex flex-col mt-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between px-8 py-10 lg:h-32 gap-8 lg:gap-12 border-b border-white/10">
          <div className="flex-1 w-full text-center lg:text-left">
            <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Our Faculties</h4>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <div className="bg-white/10 px-3 py-2 rounded border border-white/5 text-white text-[10px] whitespace-nowrap">Engineering</div>
              <div className="bg-white/10 px-3 py-2 rounded border border-white/5 text-white text-[10px] whitespace-nowrap">Computing</div>
              <div className="bg-white/10 px-3 py-2 rounded border border-white/5 text-white text-[10px] whitespace-nowrap">Health Sciences</div>
              <div className="bg-white/10 px-3 py-2 rounded border border-white/5 text-white text-[10px] whitespace-nowrap">Management</div>
            </div>
          </div>
          
          <div className="hidden lg:block h-16 w-px bg-white/20"></div>
          
          <div className="w-full lg:w-1/3 flex items-center justify-center lg:justify-start gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🛡️</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold">Highly Secure ERP</p>
              <p className="text-emerald-400 text-[10px]">Powered by Laravel 12 & AES-256 Encryption</p>
            </div>
          </div>
          
          <div className="hidden lg:block h-16 w-px bg-white/20"></div>
          
          <div className="w-full lg:w-1/4 text-center lg:text-right">
            <div className="text-white/40 text-[10px] font-bold uppercase mb-1">Academic Calendar</div>
            <div className="text-white text-sm font-medium italic">Rain Semester: July - Oct 2026</div>
          </div>
        </div>
        
        {/* Footer Standard Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4 text-white">
              <img src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" alt="Smart Global Logo" className="w-[120px] h-[120px] object-contain" />
              <div className="flex flex-col">
                <span className="font-extrabold text-[24px] leading-none">SMART GLOBAL</span>
                <span className="text-[13px] text-emerald-400 tracking-[0.15em] font-bold uppercase">College of Technology</span>
              </div>
            </div>
            <p className="text-sm text-emerald-100/70">
              Makurdi, Benue State, Nigeria.<br/>
              Empowering the next generation of global tech leaders.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Quick Links</h3>
            <ul className="space-y-2 text-sm text-emerald-100/70">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/admissions" className="hover:text-white transition-colors">Admissions</Link></li>
              <li><Link to="/portals" className="hover:text-white transition-colors">Student Portal</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Contact</h3>
            <ul className="space-y-2 text-sm text-emerald-100/70">
              <li>info@sgct.com.ng</li>
              <li>08066007914</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Connect</h3>
            <div className="flex space-x-4">
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-600 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-600 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-600 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
        
        <div className="px-4 py-6 border-t border-white/10 text-xs text-center text-emerald-100/50">
          © {new Date().getFullYear()} Smart Global College of Technology. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
