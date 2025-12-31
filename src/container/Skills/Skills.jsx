import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import { useHomepageData } from '../../context/HomepageDataContext';
import { ViewAllButton, MarkdownRenderer } from '../../components';
import './Skills.scss';

/**
 * Format date range for display
 */
const formatDateRange = (startDate, endDate, isCurrent) => {
  if (!startDate) return '';
  const start = new Date(startDate);
  const startYear = start.getFullYear();

  if (isCurrent) return `${startYear} - Present`;
  if (!endDate) return `${startYear}`;

  const end = new Date(endDate);
  const endYear = end.getFullYear();

  return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`;
};

/**
 * Get type badge label and color
 */
const getTypeBadge = (type) => {
  switch (type) {
    case 'work':
      return { label: 'Work', className: 'badge--work' };
    case 'volunteer':
      return { label: 'Volunteer', className: 'badge--volunteer' };
    case 'leadership':
    default:
      return { label: 'Leadership', className: 'badge--leadership' };
  }
};

// Maximum experiences to show on homepage
const MAX_LEADERSHIP_DISPLAYED = 6;
const MAX_PREVIEW_LENGTH = 250;

/**
 * Leadership Card with expandable description
 */
const LeadershipCard = ({ item, idx }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongDescription = item.description && item.description.length > MAX_PREVIEW_LENGTH;
  const typeBadge = getTypeBadge(item.type);
  const dateRange = formatDateRange(item.startDate, item.endDate, item.isCurrent);

  return (
    <motion.div
      className="exp-card"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="exp-card__header">
        <span className={`exp-card__type-badge ${typeBadge.className}`}>
          {typeBadge.label}
        </span>
        {dateRange && <span className="exp-card__date">{dateRange}</span>}
      </div>
      <div className="exp-card__badge">
        <span className="exp-card__role">{item.title}</span>
      </div>
      <div className="exp-card__org">{item.organization}</div>

      {item.description && (
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
                content={item.description}
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
  const { leadership, skills } = useHomepageData();

  // Sort leadership by start date (newest first)
  const sortedLeadership = useMemo(() => {
    return [...(leadership || [])].sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
      const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
      return dateB - dateA;
    });
  }, [leadership]);

  // Limit displayed leadership
  const displayedLeadership = sortedLeadership.slice(0, MAX_LEADERSHIP_DISPLAYED);
  const hasMoreLeadership = sortedLeadership.length > MAX_LEADERSHIP_DISPLAYED;
  const totalLeadership = leadership?.length || 0;

  return (
    <>
      {/* Technical Expertise Section */}
      <div className="expertise-section">
        <h2 className="head-text">Technical Expertise</h2>
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

      {/* Leadership & Service Section */}
      <div className="experiences-section">
        <h2 className="head-text">Leadership & Service</h2>
        <p className="section-subtitle">Professional roles, leadership positions, and community service</p>

        <div className="experiences-grid">
          {displayedLeadership.map((item, idx) => (
            <div className="experience-item" key={item.id || idx}>
              <LeadershipCard item={item} idx={idx} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        {(hasMoreLeadership || totalLeadership > 0) && (
          <div className="experiences-section__cta">
            <ViewAllButton
              to="/experiences"
              label="View All Roles"
              count={totalLeadership}
              variant="secondary"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Skills, 'app__expertise'),
  'expertise',
  'app__mybg'
);