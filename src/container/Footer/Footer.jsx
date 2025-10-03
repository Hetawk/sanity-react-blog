import React from 'react';

import { images } from '../../constants';
import { AppWrap, MotionWrap } from '../../wrapper';
import './Footer.scss';
import ResumeDownload from '../../components/ResumeDownload/ResumeDownload';


const Footer = () => {
  return (
    <>
      <h2 className="head-text">Take a coffee & chat with me</h2>

      <ResumeDownload location="contact" />

      <div className="app__footer-cards">
        <div className="app__footer-card ">
          <img src={images.email} alt="email" />
          <a href="mailto:ekd@ekddigital.com" className="p-text">ekd@ekddigital.com</a>
        </div>
        <div className="app__footer-card">
          <img src={images.mobile} alt="phone" />
          <a href="tel:+86 (185) 0683-2159" className="p-text">+86 (185) 0683-2159</a>
        </div>
      </div>

      <div className="app__footer-contact-redirect">
        <div className="contact-message">
          <p className="p-text">
            For inquiries and collaboration opportunities, please visit our official contact page
          </p>
        </div>
        <a
          href="https://www.ekddigital.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-redirect-btn"
        >
          <span className="btn-icon">🌐</span>
          <span className="btn-text">Visit EKD Digital Contact Page</span>
          <span className="btn-arrow">→</span>
        </a>
        <p className="contact-alternative p-text">
          Or reach out directly via email or phone above
        </p>
      </div>

      <div className="flip-card">
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <img src={images.myprofile} alt="Avatar" style={{ width: "100%", height: "100%" }} />
          </div>
          <div className="flip-card-back">
            <h1 className='card-title'>Enoch Kwateh Dongbo</h1>

            <div className="card-info">
              <div className="info-item">
                <span className="info-label">Nationality:</span>
                <span className="info-value">Liberian</span>
              </div>

              <div className="info-item">
                <span className="info-label">Language:</span>
                <span className="info-value">English</span>
              </div>

              <div className="info-item">
                <span className="info-label">DOB:</span>
                <span className="info-value">June 1, 1997</span>
              </div>

              <div className="info-item highlight">
                <span className="info-label">I am a:</span>
                <span className="info-value">Certified Programmer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Footer, 'app__footer'),
  'contact',
  'app__mybg',
);
