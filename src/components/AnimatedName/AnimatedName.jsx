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
    const [displayedText,
    setDisplayedText]=useState('');
    const [currentRoleIndex,
    setCurrentRoleIndex]=useState(0);
    const [isDeleting,
    setIsDeleting]=useState(false);

    useEffect(()=> {
            const roles=[ 'Technology Leader',
            'AI/ML Researcher',
            'Full-Stack Developer',
            'Innovation Driver',
            'Tech Entrepreneur'
            ];

            const currentRole=roles[currentRoleIndex];
            const typingSpeed=isDeleting ? 50 : 100;

            if ( !isDeleting && displayedText===currentRole) {
                // Pause before deleting
                setTimeout(()=> setIsDeleting(true), 2000);
                return;
            }

            if (isDeleting && displayedText==='') {
                setIsDeleting(false);
                setCurrentRoleIndex((prev)=> (prev + 1) % roles.length);
                return;
            }

            const timeout=setTimeout(()=> {
                    setDisplayedText(isDeleting ? currentRole.substring(0, displayedText.length - 1) : currentRole.substring(0, displayedText.length + 1));
                }

                , typingSpeed);

            return ()=> clearTimeout(timeout);
        }

        , [displayedText, isDeleting, currentRoleIndex]);

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
<span className="role-dynamic"> <AnimatePresence mode="wait"> <motion.span key= {
            displayedText
        }

        initial= {
                {
                opacity: 1
            }
        }

        exit= {
                {
                opacity: 0
            }
        }

        className="role-text"

        > {
            displayedText
        }

        </motion.span> </AnimatePresence> <motion.span className="role-cursor"

        animate= {
                {
                opacity: [1, 0, 1]
            }
        }

        transition= {
                {
                duration: 0.8, repeat: Infinity
            }
        }

        > | </motion.span> </span> </motion.div> <motion.div className="credentials"

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
                delay: 1.2
            }
        }

        > <span className="credential-item">🎓 M.Eng. Student</span> <span className="credential-divider">•</span> <span className="credential-item">📚 Researcher</span> <span className="credential-divider">•</span> <span className="credential-item">🚀 Founder & CEO</span> </motion.div> </div> </div>);
}

;

export default AnimatedName;