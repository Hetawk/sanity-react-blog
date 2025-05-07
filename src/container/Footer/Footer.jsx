import React, { useState } from 'react';

import { images } from '../../constants';
import { AppWrap, MotionWrap } from '../../wrapper';
import { client } from '../../client';
import './Footer.scss';
import ResumeDownload from '../../components/ResumeDownload/ResumeDownload';


const Footer = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { username, email, message } = formData;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    setLoading(true);

    const contact = {
      _type: 'contact',
      name: formData.username,
      email: formData.email,
      message: formData.message,
    };

    client.create(contact)
      .then(() => {
        setLoading(false);
        setIsFormSubmitted(true);
      })
      .catch((err) => console.log(err));
  };

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
      {!isFormSubmitted ? (
        <>
          <div className="app__footer-form app__flex">
            <div className="app__flex">
              <input className="p-text" type="text" placeholder="Your Name" name="username" value={username} onChange={handleChangeInput} />
            </div>
            <div className="app__flex">
              <input className="p-text" type="email" placeholder="Your Email" name="email" value={email} onChange={handleChangeInput} />
            </div>
            <div>
              <textarea
                className="p-text"
                placeholder="Your Message"
                value={message}
                name="message"
                onChange={handleChangeInput}
              />
            </div>
            <button type="button" className="p-text" onClick={handleSubmit}>{!loading ? 'Send Message' : 'Sending...'}</button>


          </div>

        </>

      ) : (
        <div>
          <h3 className="head-text">
            Thank you for getting in touch!
          </h3>
        </div>
      )}

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
