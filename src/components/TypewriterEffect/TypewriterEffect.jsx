import React from 'react';
import { motion } from 'framer-motion';
import './TypewriterEffect.scss';

export const TypewriterEffect = ({
    words,
    className = '',
    cursorClassName = ''
}) => {
    // Split text inside of words into array of characters
    const wordsArray = words.map((word) => {
        return {
            ...word,
            text: word.text.split(''),
        };
    });

    const renderWords = () => {
        return (
            <div className="typewriter-words-container">
                {wordsArray.map((word, idx) => {
                    return (
                        <div key={`word-${idx}`} className="typewriter-word">
                            {word.text.map((char, index) => (
                                <span
                                    key={`char-${index}`}
                                    className={`typewriter-char ${word.className || ''}`}
                                >
                                    {char}
                                </span>
                            ))}
                            &nbsp;
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`typewriter-container ${className}`}>
            <motion.div
                className="typewriter-overflow"
                initial={{
                    width: '0%',
                }}
                animate={{
                    width: 'fit-content',
                }}
                transition={{
                    duration: 2,
                    ease: 'linear',
                    delay: 0.5,
                }}
            >
                <div className="typewriter-content">
                    {renderWords()}
                </div>
            </motion.div>
            <motion.span
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
                className={`typewriter-cursor ${cursorClassName}`}
            />
        </div>
    );
};

export default TypewriterEffect;
