import React, { useState, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import { urlFor, client } from '../../client';
import './Awards.scss';

const Awards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [awards, setAwards] = useState([]);
  const [brands, setBrands] = useState([]);

  const handleClick = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const query = '*[_type == "awards"] | order(year desc)';
    const brandsQuery = '*[_type == "brands"] | order(year desc)';

    client.fetch(query).then((data) => {
      setAwards(data);
    });

    client.fetch(brandsQuery).then((data) => {
      setBrands(data);
    });
  }, []);

  return (
    <>
      {awards.length && (
        <>
          <div className='app__award-title app__flex'>
            <h1 className="h1-text">Awards and Certificates</h1>
          </div>
          <div className="app__award-item app__flex">
            <img src={urlFor(awards[currentIndex].imgurl)} alt={awards[currentIndex].name} />
            <div className="app__award-content">
              <p className="p-text">{awards[currentIndex].year}</p>
              <div>
                <h4 className="bold-text app__flex">{awards[currentIndex].name}</h4>
                <h5 className="p-text app__flex">{awards[currentIndex].company}</h5>
              </div>
            </div>
          </div>

          <div className="app__award-btns app__flex">
            <div className="app__flex" onClick={() => handleClick(currentIndex === 0 ? awards.length - 1 : currentIndex - 1)}>
              <HiChevronLeft />
            </div>

            <div className="app__flex" onClick={() => handleClick(currentIndex === awards.length - 1 ? 0 : currentIndex + 1)}>
              <HiChevronRight />
            </div>
          </div>
        </>
      )}

      <div className="app__award-brands app__flex">
        {brands.map((brand) => (
          <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, type: 'tween' }}
            key={brand._id}
          >
            <img src={urlFor(brand.imgUrl)} alt={brand.name} />
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
