import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import { AppWrap, MotionWrap } from '../../wrapper';
import api from '../../api/client';
import './Skills.scss';

const Skills = () => {
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [hoveredWork, setHoveredWork] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [experiencesResponse, skillsResponse] = await Promise.all([
          api.experiences.getAll(),
          api.skills.getAll()
        ]);
        setExperiences(experiencesResponse.data || []);
        setSkills(skillsResponse.data || []);
      } catch (error) {
        console.error('Error fetching skills and experiences:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h2 className="head-text">Skills & Experiences</h2>

      <div className="app__skills-container">
        <motion.div className="app__skills-list">
          {skills.map((skill, index) => (
            <motion.div
              className="app__skills-item app__flex"
              key={index + skill}
              onMouseOver={() => setHoveredWork(skill)}
              onMouseOut={() => setHoveredWork(null)}
            >
              <div className="app__flex">
                <img src={skill.icon} alt={skill.name} />
              </div>
              <p className="p-text">{skill.name}</p>
            </motion.div>
          ))}
        </motion.div>
        <div className="app__skills-exp">
          {experiences.map((experience) => (
            <motion.div
              className="app__skills-exp-item"
              key={experience.year}
            >
              <div className="app__skills-exp-year">
                <p className="bold-text">{experience.year}</p>
              </div>
              <motion.div className="app__skills-exp-works">
                {experience.works.map((work) => (
                  <React.Fragment key={work.name}>
                    <motion.div
                      className="app__skills-exp-work"
                      data-tooltip-id="skills-tooltip"
                      data-tooltip-content={work.desc}
                      key={work.name}
                      onMouseOver={() => setHoveredWork(work)}
                      onMouseOut={() => setHoveredWork(null)}
                    >
                      <h4 className="bold-text">{work.name}</h4>
                      <p className="p-text">{work.company}</p>
                    </motion.div>
                    <ReactTooltip
                      id="skills-tooltip"
                      effect="solid"
                      arrowColor="#fff"
                      className="skills-tooltip"
                      place="top"
                    >
                      {/* tooltip content */}
                    </ReactTooltip>
                  </React.Fragment>
                ))}

              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Skills, 'app__skills'),
  'skills',
  'app__mybg',
);