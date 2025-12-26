import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { AppWrap, MotionWrap } from '../../wrapper';
import { useHomepageData } from '../../context/HomepageDataContext';
import './About.scss';

const About = () => {
  // Use shared homepage data instead of separate fetch
  const { abouts, loading, error } = useHomepageData();

  if (loading) {
    return (
      <div className="app__loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="app__loading-spinner"
        >
          ⚡
        </motion.div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app__error">
        <p>⚠️ Error loading content: {error}</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="app__about-header"
      > <h2 className="head-text"> <span>Technology Leader</span> & <span>Innovation Driver</span> </h2> <motion.p className="p-text about-subtitle"

        initial={
          {
            opacity: 0
          }
        }

        animate={
          {
            opacity: 1
          }
        }

        transition={
          {
            delay: 0.3, duration: 0.6
          }
        }

      > Combining advanced academic research with comprehensive technical expertise to architect innovative solutions that deliver measurable impact across global markets. </motion.p> </motion.div> <div className="app__profiles"> {
        abouts.map((about, index) => (<motion.div whileInView={
          {
            opacity: 1, y: 0, rotateY: 0
          }
        }

          initial={
            {
              opacity: 0, y: 80, rotateY: -10
            }
          }

          whileHover={
            {
              scale: 1.02,
              y: -15,
              rotateY: 2,
              boxShadow: "0 25px 50px rgba(255, 76, 41, 0.2)"
            }
          }

          transition={
            {
              duration: 0.7,
              type: 'spring',
              stiffness: 80,
              delay: index * 0.15
            }
          }

          viewport={
            {
              once: true, amount: 0.25
            }
          }

          className="app__profile-item"

          key={
            about.id
          }

        > {
            /* Icon/Number Badge */
          }

          <motion.div className="profile-badge"

            initial={
              {
                scale: 0, rotate: -180
              }
            }

            whileInView={
              {
                scale: 1, rotate: 0
              }
            }

            transition={
              {
                delay: 0.2 + index * 0.15,
                type: 'spring',
                stiffness: 200
              }
            }

            viewport={
              {
                once: true
              }
            }

          > <span> {
            index + 1
          }

            </span> </motion.div> <motion.div className="profile-image-wrapper"

              whileHover={
                {
                  scale: 1.08, rotate: 2
                }
              }

              transition={
                {
                  duration: 0.4, type: 'spring', stiffness: 300
                }
              }

            > {
              about.imgUrl && (<> <img src={
                about.imgUrl
              }

                alt={
                  about.title
                }

              /> <motion.div className="image-overlay"
                initial={
                  {
                    opacity: 0
                  }
                }

                whileHover={
                  {
                    opacity: 1
                  }
                }

                transition={
                  {
                    duration: 0.3
                  }
                }

                /> </>)
            }

          </motion.div> <motion.div className="profile-content"

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
                delay: 0.3 + index * 0.1
              }
            }

          > <h2 className="bold-text"> {
            about.title
          }

            </h2> <motion.div className="title-underline"

              initial={
                {
                  width: 0, opacity: 0
                }
              }

              whileInView={
                {
                  width: "60px", opacity: 1
                }
              }

              transition={
                {
                  delay: 0.4 + index * 0.1, duration: 0.6
                }
              }

              viewport={
                {
                  once: true
                }
              }

            /> <motion.p className="p-text"
              initial={
                {
                  opacity: 0
                }
              }

              animate={
                {
                  opacity: 1
                }
              }

              transition={
                {
                  delay: 0.5 + index * 0.1
                }
              }

            > {
                about.description
              }

            </motion.p> {
              /* Decorative corner accent */
            }

            <motion.div className="card-accent"

              initial={
                {
                  scale: 0
                }
              }

              whileInView={
                {
                  scale: 1
                }
              }

              transition={
                {
                  delay: 0.6 + index * 0.1, type: 'spring'
                }
              }

              viewport={
                {
                  once: true
                }
              }

            /> </motion.div> </motion.div>))
      }

      </div> <motion.div className="about-cta"

        initial={
          {
            opacity: 0, y: 30
          }
        }

        whileInView={
          {
            opacity: 1, y: 0
          }
        }

        viewport={
          {
            once: true
          }
        }

        transition={
          {
            delay: 0.8, duration: 0.6
          }
        }

      > <p className="p-text" style={
        {
          fontStyle: 'italic', color: '#6b7280', marginTop: 40
        }
      }

      > "I envision EKD Digital as more than a technology company—we are KINGDOM citizens
          exercising dominion in the digital space."
        </p>
        
        <Link to="/journey" className="about-journey-link">
          <motion.button
            className="journey-btn"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 76, 41, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span>Explore My Journey</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </motion.button>
        </Link>
      </motion.div> </>);
}

  ;

export default AppWrap(MotionWrap(About, 'app__about'),
  'about',
  'app__whitebg',
);