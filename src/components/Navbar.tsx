import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Platform', href: '/#platform' },
  { label: 'Borders', href: '/#borders' },
  { label: 'Fleet', href: '/#fleet' },
  { label: 'Marketplace', href: '/#marketplace' },
  { label: 'Customers', href: '/#customers' },
  { label: 'Pricing', href: '/pricing' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#E85D24] rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="9" cy="9" r="2" fill="white"/>
              </svg>
            </div>
            <span className="text-[#0F2044] font-bold text-lg leading-none">
              BorderWatch<span className="text-[#E85D24]">Africa</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-[#0F2044] transition-colors rounded-lg hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-[#0F2044] hover:text-[#E85D24] transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-[#0F2044] text-white px-4 py-2 rounded-lg hover:bg-[#1a3060] transition-colors"
            >
              Start free trial
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[#0F2044] hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block px-3 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#0F2044] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2.5 text-sm font-medium text-[#0F2044] hover:bg-gray-50 rounded-lg"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2.5 text-sm font-semibold bg-[#0F2044] text-white rounded-lg text-center"
                >
                  Start free trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
