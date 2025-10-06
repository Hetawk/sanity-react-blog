import React, { useState, useEffect } from 'react';
import { AiFillEye, AiFillGithub } from 'react-icons/ai';
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import api from '../../api/client';
import './Work.scss';

const Work = () => {
  const [works, setWorks] = useState([]);
  const [filterWork, setFilterWork] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [animateCard, setAnimateCard] = useState({ y: 0, opacity: 1 });
  const [visibleItems, setVisibleItems] = useState(6); // Show 6 initially
  const [showLoadMore, setShowLoadMore] = useState(true);

  // Strip HTML tags and markdown from text
  const stripHtmlAndMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert markdown links to text
      .replace(/[*_~`#]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        console.log('🔍 Fetching works from API...');
        const response = await api.works.getAll();
        console.log('✅ API Response:', response);
        console.log('📊 Number of works:', response.data?.length || 0);
        const data = response.data || [];

        if (data.length > 0) {
          console.log('📝 First work sample:', data[0]);
          console.log('🏷️  Tags format:', typeof data[0].tags, data[0].tags);
        }

        setWorks(data);
        setFilterWork(data);
        setShowLoadMore(data.length > 6);
        console.log('✅ Works state updated with', data.length, 'items');
      } catch (error) {
        console.error('❌ Error fetching works:', error);
      }
    };

    fetchWorks();
  }, []);

  const handleWorkFilter = (item) => {
    setActiveFilter(item);
    setAnimateCard([{ y: 100, opacity: 0 }]);

    setTimeout(() => {
      setAnimateCard([{ y: 0, opacity: 1 }]);

      if (item === 'All') {
        setFilterWork(works);
        setShowLoadMore(works.length > 6);
      } else {
        const filtered = works.filter((work) => work.tags.includes(item));
        setFilterWork(filtered);
        setShowLoadMore(filtered.length > 6);
      }
      setVisibleItems(6); // Reset to 6 when filtering
    }, 500);
  };

  const handleLoadMore = () => {
    setVisibleItems((prev) => {
      const newCount = prev + 6;
      if (newCount >= filterWork.length) {
        setShowLoadMore(false);
      }
      return newCount;
    });
  };

  return (
    <>

      <h2 className="head-text">My Creative <span>Portfolio</span> Section</h2>

      <div className="app__work-filter">
        {['All', 'React', 'TypeScript', 'Next.js', 'Python', 'Testing', 'Documentation', 'Database', 'CI/CD', 'Docker'].map((item, index) => (
          <div
            key={index}
            onClick={() => handleWorkFilter(item)}
            className={`app__work-filter-item app__flex p-text ${activeFilter === item ? 'item-active' : ''}`}
          >
            {item}
          </div>
        ))}
      </div>

      {console.log('🎨 Rendering works. filterWork length:', filterWork.length)}

      {filterWork.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No projects to display. Loading...</p>
        </div>
      )}

      <motion.div
        animate={animateCard}
        transition={{ duration: 0.5, delayChildren: 0.5 }}
        className="app__work-portfolio"
      >
        {filterWork.slice(0, visibleItems).map((work, index) => (
          <div className="app__work-item app__flex" key={index}>
            <div
              className="app__work-img app__flex"
            >
              <img src={work.imgUrl} alt={work.title} />

              <motion.div
                whileHover={{ opacity: [0, 1] }}
                transition={{ duration: 0.25, ease: 'easeInOut', staggerChildren: 0.5 }}
                className="app__work-hover app__flex"
              >
                <a href={work.projectLink} target="_blank" rel="noreferrer">

                  <motion.div
                    whileInView={{ scale: [0, 1] }}
                    whileHover={{ scale: [1, 0.90] }}
                    transition={{ duration: 0.25 }}
                    className="app__flex"
                  >
                    <AiFillEye />
                  </motion.div>
                </a>
                <a href={work.codeLink} target="_blank" rel="noreferrer">
                  <motion.div
                    whileInView={{ scale: [0, 1] }}
                    whileHover={{ scale: [1, 0.90] }}
                    transition={{ duration: 0.25 }}
                    className="app__flex"
                  >
                    <AiFillGithub />
                  </motion.div>
                </a>
              </motion.div>
            </div>

            <div className="app__work-content app__flex">
              <h4 className="bold-text">{work.title}</h4>
              <p className="p-text app__work-description" style={{ marginTop: 10 }}>
                {stripHtmlAndMarkdown(work.description)}
              </p>

              {work.tags && work.tags.length > 0 && (
                <div className="app__work-tag app__flex">
                  <p className="p-text">{Array.isArray(work.tags) ? work.tags[0] : work.tags}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {filterWork.length > 6 && (
        <div className="app__work-loadmore">
          <button
            onClick={handleLoadMore}
            className="p-text load-more-btn"
            disabled={visibleItems >= filterWork.length}
          >
            Load More {visibleItems < filterWork.length ? `(${filterWork.length - visibleItems})` : ''}
          </button>

          <button
            onClick={() => {
              setVisibleItems(6);
              setShowLoadMore(true);
            }}
            className="p-text show-less-btn"
            disabled={visibleItems <= 6}
          >
            Show Less
          </button>

          <button
            onClick={() => {
              setVisibleItems(6);
              setShowLoadMore(true);
              setActiveFilter('All');
              setFilterWork(works);
              window.scrollTo({ top: document.getElementById('work')?.offsetTop || 0, behavior: 'smooth' });
            }}
            className="p-text reset-btn"
            disabled={visibleItems === 6 && activeFilter === 'All'}
          >
            Reset
          </button>
        </div>
      )}
    </>
  );
};

export default AppWrap(
  MotionWrap(Work, 'app__works'),
  'work',
  'app__primarybg',
);
