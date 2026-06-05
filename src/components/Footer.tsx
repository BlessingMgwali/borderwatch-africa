import { Link } from 'react-router-dom';

const PRODUCT_LINKS = ['Border Status', 'Fleet Management', 'Freight Marketplace', 'Route Intelligence', 'Analytics', 'Alerts & Notifications'];
const COMPANY_LINKS = ['About Us', 'Careers', 'Press', 'Partners', 'Blog', 'Contact'];
const LEGAL_LINKS = ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'POPIA Compliance'];
const DRIVER_LINKS = [
  { label: 'Driver Program', href: '/driver-info' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Partnership Inquiries', href: '#' },
  { label: 'Data & API', href: '#' },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0A1628' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#E85D24] rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="9" cy="9" r="2" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-lg">
                BorderWatch<span className="text-[#E85D24]">Africa</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Move Freight Smarter. Real-time border intelligence, fleet visibility, and freight opportunities across Southern Africa.
            </p>
            <p className="text-gray-500 text-xs">Engineered for transport operators who move at the speed of trade.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link}>
                  <Link to={link === 'About Us' ? '/about' : '#'} className="text-sm text-gray-400 hover:text-white transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Drivers & Partners */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Drivers & Partners</h4>
            <ul className="space-y-2.5">
              {DRIVER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">Need help?</p>
              <a href="mailto:support@borderwatchafrica.com" className="text-sm text-[#E85D24] hover:text-orange-400 transition-colors font-medium">
                support@borderwatchafrica.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © 2025 BorderWatch Africa (Pty) Ltd. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Proudly South African 🇿🇦
          </p>
        </div>
      </div>
    </footer>
  );
}
