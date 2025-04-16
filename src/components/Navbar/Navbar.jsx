import React, { useState } from 'react';
import { HiMenuAlt4, HiX } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

import { images } from '../../constants';
import './Navbar.scss';

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navItems = ['home', 'about', 'work', 'skills', 'publications', 'award', 'contact'];

  return (
    <nav className="app__navbar">
      <div className="app__navbar-logo">
        <Link to="/">
          <img src={images.logo} alt="logo" />
        </Link>
      </div>
      <ul className="app__navbar-links">
        {navItems.map((item) => (
          <li className="app__flex p-text" key={`link-${item}`}>
            <div />
            {item === 'contact' ? (
              <Link to="/contact">{item}</Link>
            ) : (
              <a href={isHomePage ? `#${item}` : `/#${item}`}>{item}</a>
            )}
          </li>
        ))}
      </ul>
      {/* open navigation bar upon onClick */}
      <div className="app__navbar-menu">
        <HiMenuAlt4 onClick={() => setToggle(true)} />

        {toggle && (
          <motion.div
            whileInView={{ x: [300, 0] }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          >
            {/* close navigation bar upon onClick */}
            <HiX onClick={() => setToggle(false)} />
            <ul>
              {navItems.map((item) => (
                <li key={item}>
                  {item === 'contact' ? (
                    <Link to="/contact" onClick={() => setToggle(false)}>
                      {item}
                    </Link>
                  ) : (
                    <a
                      href={isHomePage ? `#${item}` : `/#${item}`}
                      onClick={() => setToggle(false)}
                    >
                      {item}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
