import React from 'react';

import {
  motion
}

  from 'framer-motion';

import {
  images
}

  from '../../constants';
import './Header.scss';

import {
  AppWrap
}

  from '../../wrapper';
import ResumeDownload from '../../components/ResumeDownload/ResumeDownload';
import AnimatedName from '../../components/AnimatedName/AnimatedName';

const Header = () => {
  const scaleVariants = {
    whileInView: {

      scale: [0,
        1],
      opacity: [0,
        1],
      transition: {
        duration: 1,
        ease: 'easeInOut',
      }

      ,
    }

    ,
  }

    ;

  return (<div className="app__header app__flex"> {
    /* Animated background orbs */
  }

    <div className="header-orbs"> <motion.div className="orb orb-1"

      animate={
        {
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }
      }

      transition={
        {
          duration: 8, repeat: Infinity, ease: "easeInOut"
        }
      }

    /> <motion.div className="orb orb-2"
      animate={
        {
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }
      }

      transition={
        {
          duration: 10, repeat: Infinity, ease: "easeInOut"
        }
      }

      /> <motion.div className="orb orb-3"
        animate={
          {
            scale: [1.2, 1, 1.2],
            x: [0, 20, 0],
            y: [0, 30, 0],
          }
        }

        transition={
          {
            duration: 7, repeat: Infinity, ease: "easeInOut"
          }
        }

      /> </div> <motion.div whileInView={
        {
          x: [-100, 0], opacity: [0, 1]
        }
      }

        transition={
          {
            duration: 0.8, ease: "easeOut"
          }
        }

        className="app__header-info"

      > <div className="app__header-badge"> {
        /* Compact hero card */
      }

        <motion.div className="hero-card glass-card-compact"

          initial={
            {
              opacity: 0, y: 30
            }
          }

          animate={
            {
              opacity: 1, y: 0
            }
          }

          transition={
            {
              duration: 0.7, delay: 0.2
            }
          }

        > <AnimatedName /> <div className="shine-effect" /> </motion.div> {
          /* Resume download */
        }

        <motion.div className="resume-badge-modern"

          initial={
            {
              opacity: 0, y: 20
            }
          }

          animate={
            {
              opacity: 1, y: 0
            }
          }

          transition={
            {
              delay: 1
            }
          }

        > <ResumeDownload location="home" /> </motion.div> </div> </motion.div> {
      /* Profile image with glassmorphism border */
    }

    <motion.div whileInView={
      {
        opacity: [0, 1], scale: [0.8, 1]
      }
    }

      transition={
        {
          duration: 0.8, delay: 0.3
        }
      }

      className="app__header-img"

    > <div className="profile-glass-wrapper"> <motion.img src={
      images.profile
    }

      alt="Enoch Kwateh Dongbo"

      whileHover={
        {
          scale: 1.05
        }
      }

      transition={
        {
          duration: 0.3
        }
      }

    /> <motion.div className="profile-ring ring-1"
      animate={
        {
          rotate: 360
        }
      }

      transition={
        {
          duration: 20, repeat: Infinity, ease: "linear"
        }
      }

        /> <motion.div className="profile-ring ring-2"
          animate={
            {
              rotate: -360
            }
          }

          transition={
            {
              duration: 15, repeat: Infinity, ease: "linear"
            }
          }

        /> <div className="profile-glow" /> </div> </motion.div> {
      /* Floating tech stack circles */}

    <motion.div
      variants={scaleVariants}
      whileInView={scaleVariants.whileInView}
      className="app__header-circles"
    >
      {[
        { img: images.python, delay: 0, name: 'Python' },
        { img: images.android, delay: 0.2, name: 'Mobile' },
        { img: images.react, delay: 0.4, name: 'React' }
      ].map((item, index) => (
        <motion.div
          className="circle-cmp app__flex glass-circle"
          key={`circle-${index}`}
          whileHover={{
            scale: 1.2,
            rotate: 360,
            boxShadow: "0 15px 40px rgba(255, 76, 41, 0.4)"
          }}
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 3 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
          title={item.name}
        >
          <img src={item.img} alt={item.name} />
          <div className="circle-shimmer" />
        </motion.div>
      ))
      }

    </motion.div> </div>);
}

  ;

export default AppWrap(Header, 'home');