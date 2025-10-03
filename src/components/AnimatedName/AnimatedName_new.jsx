import React from 'react';
import { motion } from 'framer-motion';
import TypewriterEffect from '../TypewriterEffect/TypewriterEffect';
import './AnimatedName.scss';

const AnimatedName = () => {
    const roleWords = [
        { text: 'Technology' },
        { text: 'Leader' },
        { text: '•' },
        { text: 'AI/ML' },
        { text: 'Researcher' },
        { text: '•' },
        { text: 'Innovation' },
        { text: 'Driver' }
    ];

    return (
        <div className="animated-name-container">
            <div className="name-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="greeting-section"
                >
                    <span className="greeting-wave">👋</span>
                    <span className="greeting-text">Hi, I'm</span>
                </motion.div>

                <motion.h1
                    className="main-name"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <span className="name-part first">Enoch</span>
                    <span className="name-part middle">Kwateh</span>
                    <span className="name-part last">Dongbo</span>
                </motion.h1>

                <motion.div
                    className="role-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <TypewriterEffect
                        words={roleWords}
                        className="role-typewriter"
                        cursorClassName="role-cursor"
                    />
                </motion.div>

                <motion.div
                    className="credentials"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                >
                    <span className="credential-item">🎓 M.Eng. Student</span>
                    <span className="credential-divider">•</span>
                    <span className="credential-item">📚 Researcher</span>
                    <span className="credential-divider">•</span>
                    <span className="credential-item">🚀 Founder & CEO</span>
                </motion.div>
            </div>
        </div>
    );
};

export default AnimatedName;
