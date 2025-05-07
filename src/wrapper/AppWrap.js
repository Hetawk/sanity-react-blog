import React from 'react';
import { NavigationDots, SocialMedia } from '../components';
import { images } from '../constants';

const AppWrap = (Component, idName, classNames) => function HOC() {
  return (
    <div id={idName} className={`app__container ${classNames}`}>
      <SocialMedia />
      <div className="app__wrapper app__flex">
        <Component />

        <div className="copyright">
          <p className="p-text" style={{ color: 'coral' }}>&copy; 2022-{new Date().getFullYear()} Copyright<br /> Enoch Kwateh Dongbo</p>
          <p className="p-text" style={{ color: 'coral' }}>All rights reserved</p>

          <div className="powered-by">
            <p className="p-text" style={{ color: 'coral', textAlign: 'right' }}>Powered by</p>
            <div className="company-logo">
              <img src={images.ekddigital} alt="EKD Digital Logo" />
              <span>EKD Digital</span>
            </div>
          </div>
        </div>

      </div>
      <NavigationDots active={idName} />
    </div>
  );
};

export default AppWrap;
