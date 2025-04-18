import React,
{
  useState,
  useEffect
}

  from 'react';

import {
  motion
}

  from 'framer-motion';

import {
  AppWrap
}

  from '../../wrapper';

import {
  images
}

  from '../../constants';

import {
  ResumeDownload
}

  from '../../components';

import {
  client
}

  from '../../client';
import './Header.scss';

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

const Header = () => {
  const [skills,
    setSkills] = useState([]);
  const [experiences,
    setExperiences] = useState([]);
  const [awards,
    setAwards] = useState([]);

  useEffect(() => {
    const skillsQuery = '*[_type == "skills"]';
    const experiencesQuery = '*[_type == "experiences"] | order(year desc)';
    const awardsQuery = '*[_type == "awards"] | order(year desc)';

    client.fetch(skillsQuery).then((data) => {
      setSkills(data);
    }

    );

    client.fetch(experiencesQuery).then((data) => {
      setExperiences(data);
    }

    );

    client.fetch(awardsQuery).then((data) => {
      setAwards(data);
    }

    );
  }

    , []);

  return (<div className="app__header app__flex"> <motion.div whileInView={
    {
      x: [-100, 0], opacity: [0, 1]
    }
  }

    transition={
      {
        duration: 0.5
      }
    }

    className="app__header-info"

  > <div className="app__header-badge"> <div className="badge-cmp app__flex"> <span> <img src={
    images.hand_wave
  }

    alt="hand wave gif" /> </span> <div style={
      {
        marginLeft: 20
      }
    }

    > <p className="p-text">Hello, I am</p> <h1 className="head-text">Enoch (EKD)</h1> </div> </div> <div className="tag-cmp app__flex"> <p className="p-text">Programmer</p> <p className="p-text">Web Developer</p> <p className="p-text">UI/UX Designer</p> <p className="p-text">Your Humble Servant</p> </div> <div className="resume-badge"> <ResumeDownload skills={
      skills
    }

      experiences={
        experiences
      }

      awards={
        awards
      }

    /> </div> </div> </motion.div> <motion.div whileInView={
      {
        opacity: [0, 1]
      }
    }

      transition={
        {
          duration: 0.5, delayChildren: 0.5
        }
      }

      className="app__header-img"

    > <img src={
      images.profile
    }

      alt="profile_bg" /> <motion.img whileInView={
        {
          scale: [0, 1]
        }
      }

        transition={
          {
            duration: 1, ease: 'easeInOut'
          }
        }

        src={
          images.circle
        }

        alt="profile_circle"
        className="overlay_circle"

      /> </motion.div> <motion.div variants={
        scaleVariants
      }

        whileInView={
          scaleVariants.whileInView
        }

        className="app__header-circles"

      > {
        [images.python, images.android, images.react].map((circle, index) => (<div className="circle-cmp app__flex" key={
          `circle-$ {
              index
            }

            `
        }

        > <img src={
          circle
        }

          alt="profile_bg" /> </div>))
      }

    </motion.div> </div>);
}

  ;

export default AppWrap(Header, 'home');