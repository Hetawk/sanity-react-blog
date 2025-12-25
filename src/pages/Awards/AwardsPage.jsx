import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsGrid3X3Gap, BsListUl, BsFilter } from 'react-icons/bs';
import { HiSearch } from 'react-icons/hi';

import api from '../../api/client';
import { DetailModal, ItemCard, SectionPage } from '../../components';
import './AwardsPage.scss';

const AwardsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [awards, setAwards] = useState([]);
  const [filteredAwards, setFilteredAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAward, setSelectedAward] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc'); // New sorting state

  // Get unique categories and levels
  const categories = ['All', ...new Set(awards.filter(a => a.category).map(a => a.category))];
  const levels = ['All', ...new Set(awards.filter(a => a.level).map(a => a.level))];

  // Fetch awards ONLY ONCE on mount (not on id change)
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        setLoading(true);
        const response = await api.awards.getAll();
        const data = response.data || [];
        setAwards(data);
        setFilteredAwards(data);
      } catch (error) {
        console.error('Error fetching awards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []); // Empty dependency - fetch only once on mount

  // Handle URL id changes SEPARATELY (open modal if id is present)
  useEffect(() => {
    if (id && awards.length > 0) {
      const award = awards.find(a => a.id === id);
      if (award) {
        setSelectedAward(award);
        setIsModalOpen(true);
      }
    } else if (!id) {
      // URL has no id, close modal if open
      setIsModalOpen(false);
      setSelectedAward(null);
    }
  }, [id, awards]);

  // Filter awards based on search and filters
  useEffect(() => {
    let result = [...awards];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(award =>
        award.title?.toLowerCase().includes(query) ||
        award.issuer?.toLowerCase().includes(query) ||
        award.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(award => award.category === categoryFilter);
    }

    // Level filter
    if (levelFilter !== 'All') {
      result = result.filter(award => award.level === levelFilter);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': {
          // Most recent first
          const dateA = new Date(a.date || a.year || '1900');
          const dateB = new Date(b.date || b.year || '1900');
          return dateB - dateA;
        }
        case 'date-asc': {
          // Oldest first
          const dateA = new Date(a.date || a.year || '1900');
          const dateB = new Date(b.date || b.year || '1900');
          return dateA - dateB;
        }
        case 'title-asc':
          // A to Z
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          // Z to A
          return (b.title || '').localeCompare(a.title || '');
        case 'issuer-asc':
          // Issuer A to Z
          return (a.issuer || '').localeCompare(b.issuer || '');
        case 'issuer-desc':
          // Issuer Z to A
          return (b.issuer || '').localeCompare(a.issuer || '');
        case 'category':
          // Group by category
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

    setFilteredAwards(result);
  }, [awards, searchQuery, categoryFilter, levelFilter, sortBy]);

  // Modal handlers
  const openModal = useCallback((award) => {
    setSelectedAward(award);
    setIsModalOpen(true);
    // Use replace to avoid adding to history stack
    navigate(`/awards/${award.id}`, { replace: true });
  }, [navigate]);

  const closeModal = useCallback(() => {
    // Close modal immediately without waiting for navigation
    setIsModalOpen(false);
    setSelectedAward(null);
    // Navigate back to awards list
    navigate('/awards', { replace: true });
  }, [navigate]);

  // Navigation handlers
  const currentIndex = selectedAward ? filteredAwards.findIndex(a => a.id === selectedAward.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < filteredAwards.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      const prevAward = filteredAwards[currentIndex - 1];
      setSelectedAward(prevAward);
      navigate(`/awards/${prevAward.id}`, { replace: true });
    }
  }, [hasPrevious, currentIndex, filteredAwards, navigate]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      const nextAward = filteredAwards[currentIndex + 1];
      setSelectedAward(nextAward);
      navigate(`/awards/${nextAward.id}`, { replace: true });
    }
  }, [hasNext, currentIndex, filteredAwards, navigate]);

  // Format date
  const formatDate = (award) => {
    if (award.date) {
      try {
        const dateObj = new Date(award.date);
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      } catch {
        return award.year || '';
      }
    }
    return award.year || '';
  };

  // Render filters
  const renderFilters = () => (
    <div className="awards-page__filters">
      {/* Search */}
      <div className="awards-page__search">
        <HiSearch />
        <input
          type="text"
          placeholder="Search awards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Sort By */}
      <div className="awards-page__filter-group">
        <label>Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="issuer-asc">Issuer (A-Z)</option>
          <option value="issuer-desc">Issuer (Z-A)</option>
          <option value="category">Group by Category</option>
        </select>
      </div>

      {/* Category filter */}
      <div className="awards-page__filter-group">
        <label>Category</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Level filter */}
      <div className="awards-page__filter-group">
        <label>Level</label>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          {levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {/* View mode toggle */}
      <div className="awards-page__view-toggle">
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
    <div className="awards-page__stats">
      <span className="stat">
        <strong>{filteredAwards.length}</strong> Awards
      </span>
    </div>
  );

  return (
    <SectionPage
      title="Awards & Certificates"
      subtitle="Recognition and achievements throughout my academic and professional journey."
      filters={renderFilters()}
      headerActions={renderHeaderActions()}
      backgroundClass="app__whitebg"
    >
      {loading ? (
        <div className="section-page__loading">
          <div className="section-page__loading-spinner" />
          <p className="section-page__loading-text">Loading awards...</p>
        </div>
      ) : filteredAwards.length === 0 ? (
        <div className="section-page__empty">
          <span className="section-page__empty-icon">🏆</span>
          <h3 className="section-page__empty-title">No awards found</h3>
          <p className="section-page__empty-text">
            {searchQuery || categoryFilter !== 'All' || levelFilter !== 'All'
              ? 'Try adjusting your filters to see more results.'
              : 'Awards will appear here once added.'}
          </p>
        </div>
      ) : (
        <motion.div
          className={`awards-page__${viewMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <div className="section-page__grid">
                {filteredAwards.map((award, index) => (
                  <ItemCard
                    key={award.id}
                    item={award}
                    type="award"
                    index={index}
                    onClick={() => openModal(award)}
                    showDescription={true}
                  />
                ))}
              </div>
            ) : (
              <div className="awards-page__list-view">
                {filteredAwards.map((award, index) => (
                  <motion.div
                    key={award.id}
                    className="awards-page__list-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openModal(award)}
                  >
                    <div className="awards-page__list-item-image">
                      {award.imgUrl ? (
                        <img src={award.imgUrl} alt={award.title} />
                      ) : (
                        <div className="placeholder">🏆</div>
                      )}
                    </div>
                    <div className="awards-page__list-item-content">
                      <div className="awards-page__list-item-header">
                        <h3>{award.title}</h3>
                        <span className="date">{formatDate(award)}</span>
                      </div>
                      {award.issuer && (
                        <p className="issuer">{award.issuer}</p>
                      )}
                      {award.description && (
                        <p className="description">{award.description}</p>
                      )}
                      <div className="awards-page__list-item-meta">
                        {award.category && <span className="tag">{award.category}</span>}
                        {award.level && <span className="tag level">{award.level}</span>}
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
        item={selectedAward}
        type="award"
        onPrevious={goToPrevious}
        onNext={goToNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />
    </SectionPage>
  );
};

export default AwardsPage;
