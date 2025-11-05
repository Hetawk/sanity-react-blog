import React, { useState, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { BsGrid3X3Gap, BsSliders } from 'react-icons/bs'; // Import icons for view toggle
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import api from '../../api/client';
import './Awards.scss';

const Awards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [awards, setAwards] = useState([]);
  const [brands, setBrands] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // Changed default to grid view
  const [visibleItems, setVisibleItems] = useState(6); // For pagination in grid view

  const handleClick = (index) => {
    setCurrentIndex(index);
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
              <img src={awards[currentIndex].imgUrl} alt={awards[currentIndex].name} />
              <div className="app__award-content">
                <span className="award-year">{awards[currentIndex].year}</span>
                <h4 className="bold-text">{awards[currentIndex].title}</h4>
                <h5 className="p-text">{awards[currentIndex].issuer}</h5>
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
                >
                  <div className="award-icon">🏆</div>
                  <div className="award-image-container">
                    <img src={award.imgUrl} alt={award.name} />
                  </div>
                  <div className="award-details">
                    <span className="award-year">{award.year}</span>
                    <h4 className="bold-text">{award.title}</h4>
                    <h5 className="p-text">{award.issuer}</h5>
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
    </>
  );
};

export default AppWrap(
  MotionWrap(Awards, 'app__award'),
  'award',
  'app__primarybg',
);