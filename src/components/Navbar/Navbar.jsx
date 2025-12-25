import React, { useState, useEffect } from 'react';
import { HiMenuAlt4, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

import { images } from '../../constants';
import './Navbar.scss';

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredSection, setHoveredSection] = useState(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'about', label: 'About', icon: '👤' },
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'publications', label: 'Publications', icon: '📚' },
    { id: 'award', label: 'Awards', icon: '🏆' },
    { id: 'journey', label: 'Journey', icon: '🛤️', isPage: true },
    { id: 'contact', label: 'Contact', icon: '✉️' }
  ];

  // Handle scroll effect
  useEffect(() => {
    const sections = ['home', 'about', 'work', 'skills', 'publications', 'award', 'contact'];

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`app__navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-glass-container">
        {/* Logo */}
        <motion.div
          className="app__navbar-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/">
            <img src={images.logo} alt="EKD Digital" />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <ul className="app__navbar-links glass-nav">
          {navItems.map((item, index) => (
            <motion.li
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              key={`link-${item.id}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              onMouseEnter={() => setHoveredSection(item.id)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {item.isPage || item.id === 'contact' ? (
                <Link
                  to={item.id === 'contact' ? '/contact' : `/${item.id}`}
                  className="nav-link"
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ) : (
                <a
                  href={isHomePage ? `#${item.id}` : `/#${item.id}`}
                  className="nav-link"
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </a>
              )}
              {(hoveredSection === item.id || activeSection === item.id) && (
                <motion.div
                  className="nav-indicator"
                  layoutId="navIndicator"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </motion.li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <motion.div
          className="app__navbar-menu"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="menu-button glass-button" onClick={() => setToggle(true)}>
            <HiMenuAlt4 />
          </div>

          <AnimatePresence>
            {toggle && (
              <>
                {/* Overlay */}
                <motion.div
                  className="mobile-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setToggle(false)}
                />

                {/* Mobile Menu */}
                <motion.div
                  className="mobile-menu glass-mobile"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <motion.div
                    className="close-button"
                    onClick={() => setToggle(false)}
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <HiX />
                  </motion.div>

                  <ul className="mobile-nav-list">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.id}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={activeSection === item.id ? 'active' : ''}
                      >
                        {item.isPage || item.id === 'contact' ? (
                          <Link
                            to={item.id === 'contact' ? '/contact' : `/${item.id}`}
                            onClick={() => {
                              setToggle(false);
                              setActiveSection(item.id);
                            }}
                            className="mobile-nav-link"
                          >
                            <span className="mobile-icon">{item.icon}</span>
                            <span className="mobile-label">{item.label}</span>
                          </Link>
                        ) : (
                          <a
                            href={isHomePage ? `#${item.id}` : `/#${item.id}`}
                            onClick={() => {
                              setToggle(false);
                              setActiveSection(item.id);
                            }}
                            className="mobile-nav-link"
                          >
                            <span className="mobile-icon">{item.icon}</span>
                            <span className="mobile-label">{item.label}</span>
                          </a>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
