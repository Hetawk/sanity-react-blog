import React from 'react';
import { Footer } from '../../container';
import { Navbar } from '../../components';
import { motion } from 'framer-motion';
import './Contact.scss';

const Contact = () => {
    return (
        <div className="app">
            <Navbar />
            <div className="app__contact-page">
                <motion.div
                    whileInView={{ y: [100, 0], opacity: [0, 1] }}
                    transition={{ duration: 0.5 }}
                    className="app__contact-header"
                >

                </motion.div>
                <Footer />
            </div>
        </div>
    );
};

export default Contact;
