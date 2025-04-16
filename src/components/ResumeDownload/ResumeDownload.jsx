import React, { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import './ResumeDownload.scss';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { client } from '../../client';

const ResumeDownload = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [skills, setSkills] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [awards, setAwards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedResume, setUploadedResume] = useState(null);

    // Fetch data from Sanity on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Check for uploaded resume first
                const resumeQuery = '*[_type == "resume" && isActive == true][0]';
                const resumeData = await client.fetch(resumeQuery);

                if (resumeData && resumeData.resumeFile?.asset?.url) {
                    setUploadedResume(resumeData);
                } else {
                    // Fetch skills
                    const skillsQuery = '*[_type == "skills"]';
                    const skillsData = await client.fetch(skillsQuery);
                    setSkills(skillsData);

                    // Fetch experiences
                    const experiencesQuery = '*[_type == "experiences"] | order(year desc)';
                    const experiencesData = await client.fetch(experiencesQuery);
                    setExperiences(experiencesData);

                    // Fetch awards
                    const awardsQuery = '*[_type == "awards"] | order(year desc)';
                    const awardsData = await client.fetch(awardsQuery);
                    setAwards(awardsData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDownload = () => {
        if (uploadedResume) {
            // Download the uploaded resume directly
            window.open(uploadedResume.resumeFile.asset.url, '_blank');
        } else {
            // Generate resume dynamically
            generateResume();
        }
    };

    const generateResume = () => {
        setIsGenerating(true);

        // Create a new PDF document
        const doc = new jsPDF();

        // Add title/header
        doc.setFontSize(24);
        doc.setTextColor(51, 51, 51);
        doc.text('Enoch Kwateh Dongbo', 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(102, 102, 102);
        doc.text('Web Developer & UI/UX Designer', 20, 30);

        doc.setFontSize(10);
        doc.text('enoch.dongbo@gmail.com | +86 (185) 0683-2159', 20, 38);
        doc.text('github.com/Hetawk | linkedin.com/in/hetawk', 20, 44);

        // Add a line
        doc.setDrawColor(255, 76, 41); // #FF4C29
        doc.setLineWidth(0.5);
        doc.line(20, 48, 190, 48);

        // Professional Summary
        doc.setFontSize(14);
        doc.setTextColor(255, 76, 41);
        doc.text('PROFESSIONAL SUMMARY', 20, 58);

        doc.setFontSize(10);
        doc.setTextColor(68, 68, 68);
        const summary = 'Passionate and creative web developer with expertise in modern front-end technologies. Experienced in building responsive and user-friendly web applications using React, JavaScript, and various web development tools.';
        const summaryLines = doc.splitTextToSize(summary, 170);
        doc.text(summaryLines, 20, 66);

        // Skills Section
        doc.setFontSize(14);
        doc.setTextColor(255, 76, 41);
        doc.text('SKILLS', 20, 85);

        doc.setFontSize(10);
        doc.setTextColor(68, 68, 68);

        let skillsText = '';
        if (skills && skills.length > 0) {
            skillsText = skills.map(skill => skill.name).join(' • ');
        } else {
            skillsText = 'React • JavaScript • CSS/SCSS • HTML5 • UI/UX Design • Responsive Design • Git • Node.js';
        }

        const skillsLines = doc.splitTextToSize(skillsText, 170);
        doc.text(skillsLines, 20, 93);

        // Work Experience
        doc.setFontSize(14);
        doc.setTextColor(255, 76, 41);
        doc.text('WORK EXPERIENCE', 20, 110);

        let experienceY = 118;

        if (experiences && experiences.length > 0) {
            experiences.forEach(exp => {
                if (exp.works && exp.works.length > 0) {
                    exp.works.forEach(work => {
                        doc.setFontSize(12);
                        doc.setTextColor(51, 51, 51);
                        doc.text(work.name, 20, experienceY);

                        doc.setFontSize(10);
                        doc.setTextColor(102, 102, 102);
                        doc.text(work.company, 20, experienceY + 6);

                        doc.setFontSize(10);
                        doc.setTextColor(119, 119, 119);
                        doc.text(exp.year, 20, experienceY + 12);

                        doc.setFontSize(9);
                        doc.setTextColor(68, 68, 68);
                        const descLines = doc.splitTextToSize(work.desc || '', 170);
                        doc.text(descLines, 20, experienceY + 18);

                        experienceY += 30 + (descLines.length * 5); // adjust based on description length
                    });
                }
            });
        } else {
            doc.setFontSize(12);
            doc.setTextColor(51, 51, 51);
            doc.text('Web Developer', 20, experienceY);

            doc.setFontSize(10);
            doc.setTextColor(102, 102, 102);
            doc.text('Company Name', 20, experienceY + 6);

            doc.setFontSize(10);
            doc.setTextColor(119, 119, 119);
            doc.text('2021 - Present', 20, experienceY + 12);

            doc.setFontSize(9);
            doc.setTextColor(68, 68, 68);
            const defaultDesc = 'Developed and maintained various web applications using React, JavaScript, and other modern web technologies.';
            const descLines = doc.splitTextToSize(defaultDesc, 170);
            doc.text(descLines, 20, experienceY + 18);

            experienceY += 30;
        }

        // Education Section
        doc.setFontSize(14);
        doc.setTextColor(255, 76, 41);
        doc.text('EDUCATION', 20, experienceY + 10);

        doc.setFontSize(11);
        doc.setTextColor(51, 51, 51);
        doc.text('Bachelor of Science in Computer Science', 20, experienceY + 20);

        doc.setFontSize(10);
        doc.setTextColor(85, 85, 85);
        doc.text('University Name', 20, experienceY + 26);

        doc.setFontSize(10);
        doc.setTextColor(119, 119, 119);
        doc.text('2015 - 2019', 20, experienceY + 32);

        // Awards & Certificates (if available)
        if (awards && awards.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(255, 76, 41);
            doc.text('AWARDS & CERTIFICATES', 20, experienceY + 45);

            let awardY = experienceY + 55;

            awards.slice(0, 3).forEach(award => {
                doc.setFontSize(11);
                doc.setTextColor(51, 51, 51);
                doc.text(award.name, 20, awardY);

                doc.setFontSize(10);
                doc.setTextColor(85, 85, 85);
                doc.text(award.company, 20, awardY + 6);

                doc.setFontSize(10);
                doc.setTextColor(119, 119, 119);
                doc.text(award.year, 20, awardY + 12);

                awardY += 20;
            });
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(153, 153, 153);
        doc.text(`Generated on ${new Date().toLocaleDateString()} | Enoch Kwateh Dongbo Resume`, 105, 280, { align: 'center' });

        // Save the PDF
        doc.save('Enoch-Kwateh-Dongbo-Resume.pdf');

        setIsGenerating(false);
    };

    return (
        <div className="resume-download-container">
            <button
                className="resume-download-btn"
                onClick={handleDownload}
                disabled={isGenerating || isLoading}
            >
                {isLoading ? (
                    <span className="loading">Loading data...</span>
                ) : isGenerating ? (
                    <span className="loading">Preparing Resume...</span>
                ) : (
                    <span className="download">
                        <FaDownload className="download-icon" />
                        Download Resume
                    </span>
                )}
            </button>
        </div>
    );
};

export default ResumeDownload;