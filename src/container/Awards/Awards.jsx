import React, { useState, useEffect, useCallback } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { BsGrid3X3Gap, BsSliders } from 'react-icons/bs';
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import api from '../../api/client';
import { ViewAllButton, DetailModal } from '../../components';
import './Awards.scss';

const Awards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [awards, setAwards] = useState([]);
  const [brands, setBrands] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [visibleItems, setVisibleItems] = useState(6);
  
  // Modal state
  const [selectedAward, setSelectedAward] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (index) => {
    setCurrentIndex(index);
  };

  // Open modal to show award detail
  const openAwardModal = useCallback((award) => {
    setSelectedAward(award);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAward(null);
  }, []);

  // Navigation within modal
  const currentModalIndex = selectedAward ? awards.findIndex(a => a.id === selectedAward.id) : -1;
  const hasPrevious = currentModalIndex > 0;
  const hasNext = currentModalIndex < awards.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setSelectedAward(awards[currentModalIndex - 1]);
    }
  }, [hasPrevious, currentModalIndex, awards]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setSelectedAward(awards[currentModalIndex + 1]);
    }
  }, [hasNext, currentModalIndex, awards]);

  // Format date for display
  const formatAwardDate = (award) => {
    if (award.date) {
      try {
        // Handle both "YYYY-MM" and full date strings
        const dateStr = award.date.includes('-') ? award.date : `${award.date}-01`;
        const dateObj = new Date(dateStr);
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      } catch (error) {
        console.error('Error formatting date:', award.date, error);
        return award.year || '';
      }
    }
    return award.year || '';
  };

  const toggleViewMode = (mode) => {
    if (mode !== viewMode) {
      setViewMode(mode);
      setVisibleItems(6); // Reset visible items when changing view mode
    }
  };

  // Pagination handlers
  const handleShowMore = () => {
    setVisibleItems(prevVisible => prevVisible + 6);
  };

  const handleShowLess = () => {
    setVisibleItems(prevVisible => Math.max(6, prevVisible - 6));
  };

  const handleReset = () => {
    setVisibleItems(6);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [awardsResponse, brandsResponse] = await Promise.all([
          api.awards.getAll(),
          api.brands.getAll()
        ]);
        setAwards(awardsResponse.data || []);
        setBrands(brandsResponse.data || []);
      } catch (error) {
        console.error('Error fetching awards and brands:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h2 className="head-text">Awards and <span>Certificates</span></h2>

      {awards.length > 0 && (
        <div className="app__award-controls">
          <div className="app__award-viewtoggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => toggleViewMode('grid')}
            >
              <BsGrid3X3Gap />
              <span>Grid View</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'carousel' ? 'active' : ''}`}
              onClick={() => toggleViewMode('carousel')}
            >
              <BsSliders />
              <span>Carousel</span>
            </button>
          </div>
        </div>
      )}

      {awards.length > 0 && (
        viewMode === 'carousel' ? (
          <div className="app__award-carousel">
            <div className="app__award-item app__flex">
              <img src={awards[currentIndex].imgUrl} alt={awards[currentIndex].title} />
              <div className="app__award-content">
                {(awards[currentIndex].date || awards[currentIndex].year) && (
                  <span className="award-year">{formatAwardDate(awards[currentIndex])}</span>
                )}
                <h4 className="bold-text">{awards[currentIndex].title}</h4>
                {awards[currentIndex].issuer && <h5 className="p-text">{awards[currentIndex].issuer}</h5>}
              </div>
            </div>

            <div className="app__award-indicators">
              {awards.map((item, index) => (
                <div
                  key={`indicator-${index}`}
                  className={`indicator ${currentIndex === index ? 'active' : ''}`}
                  onClick={() => handleClick(index)}
                />
              ))}
            </div>

            <div className="app__award-btns app__flex">
              <div className="app__flex" onClick={() => handleClick(currentIndex === 0 ? awards.length - 1 : currentIndex - 1)}>
                <HiChevronLeft />
              </div>
              <div className="app__flex" onClick={() => handleClick(currentIndex === awards.length - 1 ? 0 : currentIndex + 1)}>
                <HiChevronRight />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="app__award-grid">
              {awards.slice(0, visibleItems).map((award, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="app__award-grid-item"
                  key={`award-${index}`}
                  onClick={() => openAwardModal(award)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="award-image-container">
                    <img src={award.imgUrl} alt={award.title} />
                    <div className="award-overlay">
                      <span>Click to view</span>
                    </div>
                  </div>
                  <div className="award-details">
                    {(award.date || award.year) && (
                      <span className="award-year">{formatAwardDate(award)}</span>
                    )}
                    <h4 className="bold-text">{award.title}</h4>
                    {award.issuer && <h5 className="p-text">{award.issuer}</h5>}
                  </div>
                </motion.div>
              ))}
            </div>

            {awards.length > 6 && (
              <div className="app__award-show-more">
                {awards.length > visibleItems && (
                  <button
                    type="button"
                    onClick={handleShowMore}
                    className="show-more-btn"
                  >
                    Show More
                  </button>
                )}
                {visibleItems > 6 && (
                  <button
                    type="button"
                    onClick={handleShowLess}
                    className="show-less-btn"
                  >
                    Show Less
                  </button>
                )}
                {visibleItems > 6 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="reset-btn"
                  >
                    Reset View
                  </button>
                )}
              </div>
            )}
          </>
        )
      )}

      <div className="app__award-brands app__flex">
        {brands.map((brand) => (
          <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, type: 'tween' }}
            key={brand.id}
          >
            <img src={brand.imgUrl} alt={brand.name} />
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      {awards.length > 0 && (
        <div className="app__award-view-all">
          <ViewAllButton
            to="/awards"
            label="View All Awards"
            count={awards.length}
            variant="primary"
          />
        </div>
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
    </>
  );
};

export default AppWrap(
  MotionWrap(Awards, 'app__award'),
  'award',
  'app__primarybg',
);