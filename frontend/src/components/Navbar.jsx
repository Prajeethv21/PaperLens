import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, Home, User, LogOut, Menu, X } from 'lucide-react';
import CustomButton from './CustomButton';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'HOME', icon: Home },
    { path: '/analyze', label: 'ANALYZE', icon: Brain },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b-4 border-yellow-700/50 shadow-lg"
      style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl font-bold tracking-wide">
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">PaperLens</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`px-5 py-2 flex items-center space-x-2 rounded-lg transition-all duration-300 font-semibold tracking-wide
                      ${isActive
                        ? 'bg-gradient-to-r from-yellow-700 to-orange-700 text-white shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Right side */}
          <div className="hidden md:flex items-center space-x-3">
            <motion.a
              href="#features"
              className="px-4 py-2 text-gray-300 hover:text-yellow-600 font-semibold transition-all duration-300 tracking-wide text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              FEATURES
            </motion.a>
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900 border border-yellow-700/50 rounded-lg">
                  <User className="w-4 h-4 text-yellow-600" />
                  <span className="text-white font-semibold text-sm">{user.name}</span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-900/30 border border-red-600 rounded-lg text-red-400 hover:bg-red-900/50 transition-all duration-300 text-sm font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>LOGOUT</span>
                </motion.button>
              </div>
            ) : (
              <Link to="/login">
                <CustomButton>L O G I N</CustomButton>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-950 border-t border-yellow-700/30 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold tracking-wide transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-yellow-700 to-orange-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
              <a
                href="#features"
                className="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-gray-800 font-semibold tracking-wide transition-all duration-200"
              >
                FEATURES
              </a>
              <div className="pt-2 border-t border-gray-800">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-yellow-700/50 rounded-lg">
                      <User className="w-4 h-4 text-yellow-600" />
                      <span className="text-white font-semibold">{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 bg-red-900/30 border border-red-600 rounded-lg text-red-400 hover:bg-red-900/50 transition-all duration-300 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>LOGOUT</span>
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="block">
                    <CustomButton className="w-full">L O G I N</CustomButton>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
