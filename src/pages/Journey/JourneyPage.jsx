import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiAcademicCap, 
  HiOfficeBuilding, 
  HiLightBulb, 
  HiUserGroup,
  HiCode,
  HiChevronDown,
  HiChevronUp,
  HiLocationMarker,
  HiClock,
  HiFilter,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';
import { FaChurch, FaPray, FaGraduationCap, FaBriefcase, FaHandsHelping } from 'react-icons/fa';

import api from '../../api/client';
import { MarkdownRenderer } from '../../components';
import './JourneyPage.scss';

// Photo gallery for slideshow
const journeyPhotos = [
  { src: '/pics/enoch-a-beautiful-scenic-area.jpg', alt: 'Beautiful scenic area', featured: true },
  { src: '/pics/enoch-ceo-look.jpg', alt: 'Professional portrait', isPortrait: true },
  { src: '/pics/Enoch-on-the-grand-piano.jpg', alt: 'At the grand piano', isPortrait: true },
  { src: '/pics/enoch-sitting-with-holding-his-glasses-on-his-face.jpg', alt: 'Thoughtful moment' },
  { src: '/pics/Enoch-standing.jpg', alt: 'Casual portrait', isPortrait: true },
  { src: '/pics/enoch-standing2.jpg', alt: 'Another portrait', isPortrait: true },
  { src: '/pics/graduation.jpg', alt: 'Graduation day' },
  { src: '/pics/school-performance.jpg', alt: 'School performance' },
  { src: '/pics/school-performance2.jpg', alt: 'Performance moment' },
  { src: '/pics/time-with-friends.jpg', alt: 'Time with friends' },
  { src: '/pics/time-with-friends2.jpg', alt: 'Memorable moments with friends' },
];

// Photo Slideshow Component
const PhotoSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Get non-featured photos for slideshow
  const slideshowPhotos = journeyPhotos.filter(p => !p.featured);
  
  // Auto-advance slideshow
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowPhotos.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, slideshowPhotos.length]);
  
  const goTo = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  
  const goNext = () => goTo((currentIndex + 1) % slideshowPhotos.length);
  const goPrev = () => goTo((currentIndex - 1 + slideshowPhotos.length) % slideshowPhotos.length);
  
  const currentPhoto = slideshowPhotos[currentIndex];
  
  return (
    <div className="photo-slideshow">
      <div className={`slideshow-container ${currentPhoto.isPortrait ? 'portrait-mode' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="slide"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={currentPhoto.src} 
              alt={currentPhoto.alt}
              loading="lazy"
              className={currentPhoto.isPortrait ? 'portrait' : ''}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Arrows */}
        <button className="slide-nav prev" onClick={goPrev}>
          <HiChevronLeft />
        </button>
        <button className="slide-nav next" onClick={goNext}>
          <HiChevronRight />
        </button>
      </div>
      
      {/* Dots Indicator */}
      <div className="slideshow-dots">
        {slideshowPhotos.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

// Map category to icon
const getCategoryIcon = (category) => {
  const iconMap = {
    'Education': HiAcademicCap,
    'Church': FaChurch,
    'Leadership': HiUserGroup,
    'Technical': HiCode,
    'Entrepreneurship': HiBriefcase,
    'Ministry': FaPray,
    'Service': FaHandsHelping,
    'Academic': FaGraduationCap,
  };
  return iconMap[category] || HiLightBulb;
};

// Roman numerals for part numbers
const toRoman = (num) => {
  const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return romanNumerals[num] || num.toString();
};

// Placeholder for HiBriefcase which doesn't exist
const HiBriefcase = FaBriefcase;

const JourneySection = ({ section, isExpanded, onToggle, index }) => {
  const Icon = getCategoryIcon(section.category);
  
  return (
    <motion.div
      className={`journey-section ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Section Header */}
      <div className="section-header" onClick={onToggle}>
        <div className="header-left">
          <div className="part-badge">
            <span className="part-number">Part {toRoman(section.partNumber)}</span>
          </div>
          <div className="icon-container">
            <Icon className="section-icon" />
          </div>
          <div className="header-content">
            <h2 className="section-title">{section.title}</h2>
            {section.subtitle && (
              <p className="section-subtitle">{section.subtitle}</p>
            )}
            <div className="section-meta">
              {section.organization && (
                <span className="meta-item">
                  <HiOfficeBuilding /> {section.organization}
                </span>
              )}
              {section.location && (
                <span className="meta-item">
                  <HiLocationMarker /> {section.location}
                </span>
              )}
              {section.duration && (
                <span className="meta-item">
                  <HiClock /> {section.duration}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="header-right">
          {section.category && (
            <span className="category-tag">{section.category}</span>
          )}
          <motion.div
            className="expand-icon"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <HiChevronDown />
          </motion.div>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="section-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="content-inner">
              {section.summary && (
                <p className="section-summary">{section.summary}</p>
              )}
              {section.content && (
                <div className="markdown-content">
                  <MarkdownRenderer content={section.content} />
                </div>
              )}
              {section.role && (
                <div className="role-badge">
                  <strong>Role:</strong> {section.role}
                </div>
              )}
              {section.websiteUrl && (
                <a 
                  href={section.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const JourneyPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandAll, setExpandAll] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(sections.filter(s => s.category).map(s => s.category))];
    return cats;
  }, [sections]);

  // Filter sections
  const filteredSections = useMemo(() => {
    if (categoryFilter === 'All') return sections;
    return sections.filter(s => s.category === categoryFilter);
  }, [sections, categoryFilter]);

  // Fetch journey sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await api.journey.getAll();
        const data = response.data || [];
        
        // Sort by partNumber then displayOrder
        data.sort((a, b) => {
          if (a.partNumber !== b.partNumber) {
            return a.partNumber - b.partNumber;
          }
          return a.displayOrder - b.displayOrder;
        });
        
        setSections(data);
        
        // Auto-expand first section
        if (data.length > 0) {
          setExpandedSections(new Set([data[0].id]));
        }
      } catch (err) {
        console.error('Error fetching journey sections:', err);
        setError('Failed to load journey content');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const toggleSection = (id) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(filteredSections.map(s => s.id)));
    }
    setExpandAll(!expandAll);
  };

  if (loading) {
    return (
      <div className="journey-page">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p>Loading my journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="journey-page">
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="journey-page">
      {/* Hero Section with Cover Photo */}
      <motion.div 
        className="journey-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-cover">
          <img 
            src="/pics/enoch-a-beautiful-scenic-area.jpg" 
            alt="Enoch at a beautiful scenic area"
            className="cover-image"
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            My Journey
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            A narrative of faith, education, leadership, and technical innovation
          </motion.p>
          <motion.div 
            className="hero-scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span>Scroll to explore</span>
            <HiChevronDown className="scroll-icon" />
          </motion.div>
        </div>
      </motion.div>

      {/* Photo Gallery Slideshow */}
      <motion.div 
        className="gallery-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="gallery-title">Moments Along The Way</h2>
        <PhotoSlideshow />
      </motion.div>

      {/* Filter Controls */}
      <motion.div 
        className="journey-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="filter-section">
          <HiFilter className="filter-icon" />
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <button className="expand-all-btn" onClick={toggleExpandAll}>
          {expandAll ? <HiChevronUp /> : <HiChevronDown />}
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </motion.div>

      {/* Timeline Line */}
      <div className="timeline-container">
        <div className="timeline-line" />
        
        {/* Journey Sections */}
        <div className="sections-container">
          {filteredSections.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>No journey sections found for this category.</p>
            </motion.div>
          ) : (
            filteredSections.map((section, index) => (
              <JourneySection
                key={section.id}
                section={section}
                isExpanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                index={index}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer Quote */}
      <motion.div 
        className="journey-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <blockquote>
          "Every experience, every challenge, and every triumph has shaped who I am today.
          This journey continues..."
        </blockquote>
      </motion.div>
    </div>
  );
};

export default JourneyPage;
