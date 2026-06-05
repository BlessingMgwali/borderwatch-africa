import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import WhatsAppButton from './components/WhatsAppButton';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DriverDashboard from './pages/DriverDashboard';
import CargoOwnerDashboard from './pages/CargoOwnerDashboard';
import AdminPage from './pages/AdminPage';
import MarketplacePage from './pages/MarketplacePage';
import DriverInfoPage from './pages/DriverInfoPage';

const PAGE_TRANSITION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 },
};

function AppLayout() {
  const location = useLocation();
  const path = location.pathname;
  const hideNavFooter =
    path.startsWith('/dashboard') ||
    path.startsWith('/driver') ||
    path.startsWith('/shipper') ||
    path.startsWith('/admin');
  const isAuthPage = path === '/login' || path === '/register';

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavFooter && <Navbar />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...PAGE_TRANSITION} className="min-h-full">
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/driver-info" element={<DriverInfoPage />} />
              <Route path="/dashboard/*" element={<DashboardPage />} />
              <Route path="/driver/*" element={<DriverDashboard />} />
              <Route path="/shipper/*" element={<CargoOwnerDashboard />} />
              <Route path="/admin/*" element={<AdminPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {!hideNavFooter && !isAuthPage && <Footer />}
      {!hideNavFooter && <BackToTop />}
      {!hideNavFooter && <WhatsAppButton />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
