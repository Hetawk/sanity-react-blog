import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsGrid3X3Gap, BsListUl, BsGithub, BsLink45Deg } from 'react-icons/bs';
import { HiSearch } from 'react-icons/hi';

import api from '../../api/client';
import { DetailModal, ItemCard, SectionPage } from '../../components';
import './WorksPage.scss';

const WorksPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  // Get unique tags and sources
  const allTags = works.flatMap(w => w.tags || []);
  const tags = ['All', ...new Set(allTags)];
  const sources = ['All', ...new Set(works.filter(w => w.source).map(w => w.source))];

  // Fetch works ONLY ONCE on mount (not on id change)
  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const response = await api.works.getAll();
        const data = response.data || [];
        setWorks(data);
        setFilteredWorks(data);
      } catch (error) {
        console.error('Error fetching works:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []); // Empty dependency - fetch only once on mount

  // Handle URL id changes SEPARATELY (open modal if id is present)
  useEffect(() => {
    if (id && works.length > 0) {
      const work = works.find(w => w.id === id);
      if (work) {
        setSelectedWork(work);
        setIsModalOpen(true);
      }
    } else if (!id) {
      // URL has no id, close modal if open
      setIsModalOpen(false);
      setSelectedWork(null);
    }
  }, [id, works]);

  // Filter works based on search and filters
  useEffect(() => {
    let result = [...works];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(work =>
        work.title?.toLowerCase().includes(query) ||
        work.description?.toLowerCase().includes(query) ||
        work.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (tagFilter !== 'All') {
      result = result.filter(work => work.tags?.includes(tagFilter));
    }

    // Source filter
    if (sourceFilter !== 'All') {
      result = result.filter(work => work.source === sourceFilter);
    }

    setFilteredWorks(result);
  }, [works, searchQuery, tagFilter, sourceFilter]);

  // Modal handlers
  const openModal = useCallback((work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
    // Use replace to avoid adding to history stack
    navigate(`/works/${work.id}`, { replace: true });
  }, [navigate]);

  const closeModal = useCallback(() => {
    // Close modal immediately without waiting for navigation
    setIsModalOpen(false);
    setSelectedWork(null);
    // Navigate back to works list
    navigate('/works', { replace: true });
  }, [navigate]);

  // Navigation handlers
  const currentIndex = selectedWork
    ? filteredWorks.findIndex(w => w.id === selectedWork.id)
    : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < filteredWorks.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      const prevWork = filteredWorks[currentIndex - 1];
      setSelectedWork(prevWork);
      navigate(`/works/${prevWork.id}`, { replace: true });
    }
  }, [hasPrevious, currentIndex, filteredWorks, navigate]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      const nextWork = filteredWorks[currentIndex + 1];
      setSelectedWork(nextWork);
      navigate(`/works/${nextWork.id}`, { replace: true });
    }
  }, [hasNext, currentIndex, filteredWorks, navigate]);

  // Render filters
  const renderFilters = () => (
    <div className="works-page__filters">
      {/* Search */}
      <div className="works-page__search">
        <HiSearch />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tag filter */}
      {tags.length > 1 && (
        <div className="works-page__filter-group">
          <label>Technology</label>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      )}

      {/* Source filter */}
      {sources.length > 1 && (
        <div className="works-page__filter-group">
          <label>Source</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      )}

      {/* View mode toggle */}
      <div className="works-page__view-toggle">
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
    <div className="works-page__stats">
      <span className="stat">
        <strong>{filteredWorks.length}</strong> Projects
      </span>
    </div>
  );

  return (
    <SectionPage
      title="Portfolio"
      subtitle="A collection of projects showcasing my skills in web development, design, and creative problem-solving."
      filters={renderFilters()}
      headerActions={renderHeaderActions()}
      backgroundClass="app__primarybg"
    >
      {loading ? (
        <div className="section-page__loading">
          <div className="section-page__loading-spinner" />
          <p className="section-page__loading-text">Loading projects...</p>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="section-page__empty">
          <span className="section-page__empty-icon">💼</span>
          <h3 className="section-page__empty-title">No projects found</h3>
          <p className="section-page__empty-text">
            {searchQuery || tagFilter !== 'All' || sourceFilter !== 'All'
              ? 'Try adjusting your filters to see more results.'
              : 'Projects will appear here once added.'}
          </p>
        </div>
      ) : (
        <motion.div
          className={`works-page__${viewMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <div className="section-page__grid">
                {filteredWorks.map((work, index) => (
                  <ItemCard
                    key={work.id}
                    item={work}
                    type="work"
                    index={index}
                    onClick={() => openModal(work)}
                    showDescription={true}
                  />
                ))}
              </div>
            ) : (
              <div className="works-page__list-view">
                {filteredWorks.map((work, index) => (
                  <motion.div
                    key={work.id}
                    className="works-page__list-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openModal(work)}
                  >
                    <div className="works-page__list-item-image">
                      {work.imgUrl ? (
                        <img src={work.imgUrl} alt={work.title} />
                      ) : (
                        <div className="placeholder">💼</div>
                      )}
                    </div>
                    <div className="works-page__list-item-content">
                      <div className="works-page__list-item-header">
                        <div>
                          <h3>{work.title}</h3>
                          {work.source && <span className="source">{work.source}</span>}
                        </div>
                        <div className="links">
                          {work.codeLink && (
                            <a
                              href={work.codeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="View Code"
                            >
                              <BsGithub />
                            </a>
                          )}
                          {work.projectLink && (
                            <a
                              href={work.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="View Project"
                            >
                              <BsLink45Deg />
                            </a>
                          )}
                        </div>
                      </div>
                      {work.description && (
                        <p className="description">{work.description}</p>
                      )}
                      {work.tags && work.tags.length > 0 && (
                        <div className="works-page__list-item-tags">
                          {work.tags.slice(0, 5).map((tag, idx) => (
                            <span key={idx} className="tag">{tag}</span>
                          ))}
                          {work.tags.length > 5 && (
                            <span className="more">+{work.tags.length - 5}</span>
                          )}
                        </div>
                      )}
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
        item={selectedWork}
        type="work"
        onPrevious={goToPrevious}
        onNext={goToNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />
    </SectionPage>
  );
};

export default WorksPage;
