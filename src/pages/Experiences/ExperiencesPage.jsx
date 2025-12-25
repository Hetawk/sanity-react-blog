import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsGrid3X3Gap, BsListUl } from 'react-icons/bs';
import { HiSearch } from 'react-icons/hi';

import api from '../../api/client';
import { DetailModal, ItemCard, SectionPage, MarkdownRenderer } from '../../components';
import './ExperiencesPage.scss';

/**
 * Parse year string to get the starting year for sorting
 * Handles formats like "2022 - 2023", "2022", "2022 - Present"
 */
const parseYearForSort = (yearStr) => {
  if (!yearStr) return 0;
  // Extract the first 4-digit number (starting year)
  const match = yearStr.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : 0;
};

const ExperiencesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state - default to list view for better readability
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Get unique types
  const types = useMemo(() =>
    ['All', ...new Set(experiences.filter(e => e.type).map(e => e.type))],
    [experiences]
  );

  // Fetch experiences ONLY ONCE on mount (not on id change)
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        // Fetch ALL experiences (not just featured) for the full page
        const response = await api.experiences.getAll();
        const data = response.data || [];

        // Flatten the experiences - each experience has a year and multiple works
        const flattenedExperiences = [];
        data.forEach(exp => {
          if (exp.works && Array.isArray(exp.works)) {
            exp.works.forEach((work, idx) => {
              flattenedExperiences.push({
                id: work.id || `${exp.id}-${work.name}-${idx}`,
                title: work.name,
                company: work.company,
                position: work.name,
                role: work.name,
                year: exp.year,
                yearSort: parseYearForSort(exp.year), // For sorting
                description: work.desc,
                summary: work.desc,
                icon: work.icon,
                type: 'Experience',
                imgUrl: work.icon
              });
            });
          }
        });

        // Sort by year (newest first)
        flattenedExperiences.sort((a, b) => b.yearSort - a.yearSort);

        setExperiences(flattenedExperiences);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []); // Empty dependency - fetch only once on mount

  // Handle URL id changes SEPARATELY (open modal if id is present)
  useEffect(() => {
    if (id && experiences.length > 0) {
      const experience = experiences.find(e => e.id === id);
      if (experience) {
        setSelectedExperience(experience);
        setIsModalOpen(true);
      }
    } else if (!id) {
      // URL has no id, close modal if open
      setIsModalOpen(false);
      setSelectedExperience(null);
    }
  }, [id, experiences]);

  // Filter experiences based on search and filters (memoized)
  const filteredExperiences = useMemo(() => {
    let result = [...experiences];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(exp =>
        exp.company?.toLowerCase().includes(query) ||
        exp.role?.toLowerCase().includes(query) ||
        exp.position?.toLowerCase().includes(query) ||
        exp.summary?.toLowerCase().includes(query) ||
        exp.description?.toLowerCase().includes(query) ||
        exp.year?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'All') {
      result = result.filter(exp => exp.type === typeFilter);
    }

    return result;
  }, [experiences, searchQuery, typeFilter]);

  // Modal handlers
  const openModal = useCallback((experience) => {
    setSelectedExperience(experience);
    setIsModalOpen(true);
    // Use replace to avoid adding to history stack
    navigate(`/experiences/${experience.id}`, { replace: true });
  }, [navigate]);

  const closeModal = useCallback(() => {
    // Close modal immediately without waiting for navigation
    setIsModalOpen(false);
    setSelectedExperience(null);
    // Navigate back to experiences list
    navigate('/experiences', { replace: true });
  }, [navigate]);

  // Navigation handlers
  const currentIndex = selectedExperience
    ? filteredExperiences.findIndex(e => e.id === selectedExperience.id)
    : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < filteredExperiences.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      const prevExp = filteredExperiences[currentIndex - 1];
      setSelectedExperience(prevExp);
      navigate(`/experiences/${prevExp.id}`, { replace: true });
    }
  }, [hasPrevious, currentIndex, filteredExperiences, navigate]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      const nextExp = filteredExperiences[currentIndex + 1];
      setSelectedExperience(nextExp);
      navigate(`/experiences/${nextExp.id}`, { replace: true });
    }
  }, [hasNext, currentIndex, filteredExperiences, navigate]);

  // Format date range
  const formatDateRange = (experience) => {
    const start = experience.startDate
      ? new Date(experience.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      : experience.yearStart || '';
    const end = experience.isCurrent
      ? 'Present'
      : experience.endDate
        ? new Date(experience.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        : experience.yearEnd || '';

    if (start && end) return `${start} - ${end}`;
    if (start) return `${start} - Present`;
    return '';
  };

  // Render filters
  const renderFilters = () => (
    <div className="experiences-page__filters">
      {/* Search */}
      <div className="experiences-page__search">
        <HiSearch />
        <input
          type="text"
          placeholder="Search experiences..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Type filter */}
      {types.length > 1 && (
        <div className="experiences-page__filter-group">
          <label>Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      )}

      {/* View mode toggle */}
      <div className="experiences-page__view-toggle">
        <button
          className={viewMode === 'grid' ? 'active' : ''}
          onClick={() => setViewMode('grid')}
          title="Grid View"
        >
          <BsGrid3X3Gap />
        </button>
        <button
          className={viewMode === 'list' ? 'active' : ''}
          onClick={() => setViewMode('list')}
          title="List View"
        >
          <BsListUl />
        </button>
      </div>
    </div>
  );

  // Render header actions
  const renderHeaderActions = () => (
    <div className="experiences-page__stats">
      <span className="stat">
        <strong>{filteredExperiences.length}</strong> Experiences
      </span>
    </div>
  );

  return (
    <SectionPage
      title="Work Experience"
      subtitle="Professional journey and career milestones across various roles and organizations."
      filters={renderFilters()}
      headerActions={renderHeaderActions()}
      backgroundClass="app__primarybg"
    >
      {loading ? (
        <div className="section-page__loading">
          <div className="section-page__loading-spinner" />
          <p className="section-page__loading-text">Loading experiences...</p>
        </div>
      ) : filteredExperiences.length === 0 ? (
        <div className="section-page__empty">
          <span className="section-page__empty-icon">💼</span>
          <h3 className="section-page__empty-title">No experiences found</h3>
          <p className="section-page__empty-text">
            {searchQuery || typeFilter !== 'All'
              ? 'Try adjusting your filters to see more results.'
              : 'Work experiences will appear here once added.'}
          </p>
        </div>
      ) : (
        <motion.div
          className={`experiences-page__${viewMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <div className="section-page__grid">
                {filteredExperiences.map((experience, index) => (
                  <ItemCard
                    key={experience.id}
                    item={experience}
                    type="experience"
                    index={index}
                    onClick={() => openModal(experience)}
                    showDescription={true}
                  />
                ))}
              </div>
            ) : (
              <div className="experiences-page__list-view">
                {filteredExperiences.map((experience, index) => (
                  <motion.div
                    key={experience.id}
                    className="experiences-page__list-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openModal(experience)}
                  >
                    <div className="experiences-page__list-item-logo">
                      {experience.logoUrl || experience.imgUrl ? (
                        <img src={experience.logoUrl || experience.imgUrl} alt={experience.company} />
                      ) : (
                        <div className="placeholder">💼</div>
                      )}
                    </div>
                    <div className="experiences-page__list-item-content">
                      <div className="experiences-page__list-item-header">
                        <div>
                          <h3>{experience.role || experience.position}</h3>
                          <p className="company">{experience.company}</p>
                        </div>
                        <span className="date">{experience.year || formatDateRange(experience)}</span>
                      </div>
                      {(experience.summary || experience.description) && (
                        <div className="description">
                          <MarkdownRenderer
                            content={experience.summary || experience.description}
                            maxLength={200}
                          />
                        </div>
                      )}
                      <div className="experiences-page__list-item-meta">
                        {experience.type && <span className="tag">{experience.type}</span>}
                        {experience.location && <span className="location">📍 {experience.location}</span>}
                        {experience.isCurrent && <span className="current">Current</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detail Modal */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        item={selectedExperience}
        type="experience"
        onPrevious={goToPrevious}
        onNext={goToNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />
    </SectionPage>
  );
};

export default ExperiencesPage;
