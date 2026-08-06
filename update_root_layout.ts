import * as fs from 'fs';

let content = fs.readFileSync('src/layouts/RootLayout.tsx', 'utf8');

if (!content.includes('ChevronDown')) {
  content = content.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, ChevronDown } from 'lucide-react';");
}

const oldNavLinks = /const navLinks = \[[^\]]+\];/;
const newNavLinks = `const navLinks = [
    { name: 'Home', path: '/' },
    { 
      name: 'About Us', 
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
  ];`;
content = content.replace(oldNavLinks, newNavLinks);

const desktopNavRegex = /\{navLinks\.map\(\(link\) => \([\s\S]*?<\/Link>\s*\)\)\}/;
const newDesktopNav = `{navLinks.map((link) => (
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
              ))}`;
content = content.replace(desktopNavRegex, newDesktopNav);

const mobileNavRegex = /\{navLinks\.map\(\(link\) => \([\s\S]*?<\/Link>\s*\)\)\}/;
const newMobileNav = `{navLinks.map((link) => (
              <div key={link.name}>
                {link.subLinks ? (
                  <>
                    <div className="px-3 py-2 text-base font-bold text-gray-900 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
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
            ))}`;
content = content.replace(mobileNavRegex, newMobileNav);

fs.writeFileSync('src/layouts/RootLayout.tsx', content);
