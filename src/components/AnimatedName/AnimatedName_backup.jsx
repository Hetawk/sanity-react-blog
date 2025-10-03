import React,
    {
    useState,
    useEffect
}

from 'react';

import {
    motion,
    AnimatePresence
}

from 'framer-motion';
import './AnimatedName.scss';

const AnimatedName=()=> {
    const [displayText,
    setDisplayText]=useState('');
    const [currentWordIndex,
    setCurrentWordIndex]=useState(0);
    const [isDeleting,
    setIsDeleting]=useState(false);
    const [isPaused,
    setIsPaused]=useState(false);

    const typingSpeed=100;
    const deletingSpeed=50;
    const pauseDuration=2000;

    useEffect(()=> {
            const roles=[ 'Technology Leader',
            'AI/ML Researcher',
            'Full-Stack Developer',
            'Innovation Driver',
            'Tech Entrepreneur'
            ];

            const currentWord=roles[currentWordIndex];

            if (isPaused) {
                const pauseTimeout=setTimeout(()=> {
                        setIsPaused(false);
                        setIsDeleting(true);
                    }

                    , pauseDuration);
                return ()=> clearTimeout(pauseTimeout);
            }

            if ( !isDeleting && displayText===currentWord) {
                setIsPaused(true);
                return;
            }

            if (isDeleting && displayText==='') {
                setIsDeleting(false);
                setCurrentWordIndex((prev)=> (prev + 1) % roles.length);
                return;
            }

            const timeout=setTimeout(()=> {
                    setDisplayText(prev=> {
                            if (isDeleting) {
                                return currentWord.substring(0, prev.length - 1);
                            }

                            else {
                                return currentWord.substring(0, prev.length + 1);
                            }
                        }

                    );
                }

                , isDeleting ? deletingSpeed : typingSpeed);

            return ()=> clearTimeout(timeout);
        }

        , [displayText, isDeleting, currentWordIndex, isPaused]);

    return (<div className="animated-name-container"> <div className="name-wrapper"> <motion.div initial= {
                {
                opacity: 0, y: 20
            }
        }

        animate= {
                {
                opacity: 1, y: 0
            }
        }

        transition= {
                {
                duration: 0.6
            }
        }

        className="greeting-section"
        > <span className="greeting-wave">👋</span> <span className="greeting-text">Hi, I'm</span>
</motion.div> <motion.h1 className="main-name"

        initial= {
                {
                opacity: 0, scale: 0.9
            }
        }

        animate= {
                {
                opacity: 1, scale: 1
            }
        }

        transition= {
                {
                duration: 0.7, delay: 0.2
            }
        }

        > <span className="name-part first">Enoch</span> <span className="name-part middle">Kwateh</span> <span className="name-part last">Dongbo</span> </motion.h1> <motion.div className="role-container"

        initial= {
                {
                opacity: 0
            }
        }

        animate= {
                {
                opacity: 1
            }
        }

        transition= {
                {
                delay: 0.8
            }
        }

        > <span className="role-static">I'm a </span>
<motion.span className="role-dynamic"

        layout > <AnimatePresence mode="wait"> <motion.span key= {
            displayText
        }

        initial= {
                {
                opacity: 0, y: 20, filter: "blur(8px)"
            }
        }

        animate= {
                {
                opacity: 1, y: 0, filter: "blur(0px)"
            }
        }

        exit= {
                {
                opacity: 0, y: -20, filter: "blur(8px)"
            }
        }

        transition= {
                {
                duration: 0.3
            }
        }

        className="typing-text"

        > {
            displayText
        }

        </motion.span> </AnimatePresence> <motion.span className="cursor"

        animate= {
                {
                opacity: [1, 0]
            }
        }

        transition= {
                {
                duration: 0.8, repeat: Infinity, repeatType: "reverse"
            }
        }

        > | </motion.span> </motion.span> </motion.div> <motion.div className="credentials"

        initial= {
                {
                opacity: 0, y: 10
            }
        }

        animate= {
                {
                opacity: 1, y: 0
            }
        }

        transition= {
                {
                delay: 1
            }
        }

        > <span className="credential-item">🎓 M.Eng. Student</span> <span className="credential-divider">•</span> <span className="credential-item">📚 Researcher</span> <span className="credential-divider">•</span> <span className="credential-item">🚀 Founder & CEO</span> </motion.div> </div> </div>);
}

;

export default AnimatedName;