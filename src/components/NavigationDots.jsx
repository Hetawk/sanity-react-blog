/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavigationDots = ({ active }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navItems = ['home', 'about', 'work', 'skills', 'publications', 'award', 'contact'];

  return (
    <div className="app__navigation">
      {navItems.map((item, index) => (
        item === 'contact' ? (
          <Link
            to="/contact"
            key={item + index}
            className="app__navigation-dot"
            style={active === item ? { backgroundColor: '#313BAC' } : {}}
          />
        ) : (
          <a
            href={isHomePage ? `#${item}` : `/#${item}`}
            key={item + index}
            className="app__navigation-dot"
            style={active === item ? { backgroundColor: '#313BAC' } : {}}
          />
        )
      ))}
    </div>
  );
};

export default NavigationDots;
