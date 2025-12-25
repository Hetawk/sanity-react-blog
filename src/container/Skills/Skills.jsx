import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import { useHomepageData } from '../../context/HomepageDataContext';
import { ViewAllButton, MarkdownRenderer } from '../../components';
import './Skills.scss';

/**
 * Parse year string to get the starting year for sorting
 * Handles formats like "2022 - 2023", "2022", "2022 - Present"
 */
const parseYearForSort = (yearStr) => {
  if (!yearStr) return 0;
  const match = yearStr.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : 0;
};

// Maximum experiences to show on homepage
const MAX_EXPERIENCES_DISPLAYED = 3;
const MAX_PREVIEW_LENGTH = 250;
const MAX_WORKS_PER_EXPERIENCE = 2;

/**
 * Experience Work Card with expandable description
 */
const ExperienceWorkCard = ({ work, idx }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongDescription = work.desc && work.desc.length > MAX_PREVIEW_LENGTH;

  return (
    <motion.div
      className="exp-card"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="exp-card__badge">
        <span className="exp-card__role">{work.name}</span>
      </div>
      <div className="exp-card__org">{work.company}</div>

      {work.desc && (
        <div className="exp-card__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={isExpanded ? 'expanded' : 'collapsed'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="exp-card__desc"
            >
              <MarkdownRenderer
                content={work.desc}
                maxLength={isExpanded ? null : MAX_PREVIEW_LENGTH}
              />
            </motion.div>
          </AnimatePresence>

          {hasLongDescription && (
            <button
              className="exp-card__toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '← Show less' : 'Read more →'}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

const Skills = () => {
  // Use shared homepage data instead of separate fetch
  const { experiences, skills } = useHomepageData();

  // Sort experiences by year (newest first)
  const sortedExperiences = useMemo(() => {
    return [...(experiences || [])].sort((a, b) => {
      const yearA = parseYearForSort(a.year);
      const yearB = parseYearForSort(b.year);
      return yearB - yearA;
    });
  }, [experiences]);

  // Limit displayed experiences
  const displayedExperiences = sortedExperiences.slice(0, MAX_EXPERIENCES_DISPLAYED);
  const hasMoreExperiences = sortedExperiences.length > MAX_EXPERIENCES_DISPLAYED;

  // Count total works
  const totalWorks = experiences.reduce((acc, exp) => acc + (exp.works?.length || 0), 0);

  return (
    <>
      {/* Skills Section */}
      <div className="skills-section">
        <h2 className="head-text">Technical Skills</h2>
        <p className="section-subtitle">Technologies and tools I work with</p>

        <motion.div
          className="skills-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {skills.map((skill, index) => (
            <motion.div
              className="skill-item"
              key={`${skill.id || index}-${skill.name}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="skill-item__icon">
                <img src={skill.icon} alt={skill.name} />
              </div>
              <span className="skill-item__name">{skill.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Experiences Section */}
      <div className="experiences-section">
        <h2 className="head-text">Experience Highlights</h2>
        <p className="section-subtitle">Leadership, professional, and volunteer experiences</p>

        <div className="experiences-grid">
          {displayedExperiences.map((experience, expIdx) => (
            <React.Fragment key={experience.id || experience.year}>
              {experience.works?.slice(0, MAX_WORKS_PER_EXPERIENCE).map((work, idx) => (
                <div className="experience-item" key={`${work.name}-${idx}`}>
                  <div className="experience-item__year">{experience.year}</div>
                  <ExperienceWorkCard work={work} idx={expIdx * 2 + idx} />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* View All Button */}
        {(hasMoreExperiences || totalWorks > 0) && (
          <div className="experiences-section__cta">
            <ViewAllButton
              to="/experiences"
              label="View All Experiences"
              count={totalWorks}
              variant="secondary"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Skills, 'app__skills'),
  'skills',
  'app__mybg'
);