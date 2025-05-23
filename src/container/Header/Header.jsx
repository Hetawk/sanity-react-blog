import React from 'react';
import { motion } from 'framer-motion';
import { images } from '../../constants';
import './Header.scss';
import { AppWrap } from '../../wrapper';
import ResumeDownload from '../../components/ResumeDownload/ResumeDownload';

const Header = () => {
  // Define scaleVariants for animation
  const scaleVariants = {
    whileInView: {
      scale: [0, 1],
      opacity: [0, 1],
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="app__header app__flex">
      <motion.div
        whileInView={{ x: [-100, 0], opacity: [0, 1] }}
        transition={{ duration: 0.5 }}
        className="app__header-info"
      >
        <div className="app__header-badge">
          <div className="badge-cmp app__flex">
            <span>
              <img src={images.hand_wave} alt="hand wave gif" />
            </span>
            <div style={{ marginLeft: 20 }}>
              <p className="p-text">Hello, I am</p>
              <h1 className="head-text">Enoch (EKD)</h1>
            </div>
          </div>
          <div className="tag-cmp app__flex">
            <p className="p-text">Resercher</p>
            <p className="p-text">Founder & CEO of EKD Digital</p>
            <p className="p-text">Full-Stack Software Developer</p>
          
          </div>
          <div className="resume-badge">
            <ResumeDownload location="home" />
          </div>
        </div>
      </motion.div>

      <motion.div
        whileInView={{ opacity: [0, 1] }}
        transition={{ duration: 0.5, delayChildren: 0.5 }}
        className="app__header-img"
      >
        <img src={images.profile} alt="profile_bg" />
        <motion.img
          whileInView={{ scale: [0, 1] }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          src={images.circle}
          alt="profile_circle"
          className="overlay_circle"
        />
      </motion.div>

      <motion.div
        variants={scaleVariants}
        whileInView={scaleVariants.whileInView}
        className="app__header-circles"
      >
        {[images.python, images.android, images.react].map((circle, index) => (
          <div className="circle-cmp app__flex" key={`circle-${index}`}>
            <img src={circle} alt="technology" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default AppWrap(Header, 'home');