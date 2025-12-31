/**
 * Resume PDF Generator Utility
 * 
 * Converts resume markdown to styled HTML and generates PDF
 * Used during seeding to create PDF versions of resumes
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert Markdown Resume to Styled HTML
 */
function markdownToHtml(markdownContent) {
    let html = markdownContent
        // Headers
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>')
        // Lists
        .replace(/^• (.*?)$/gm, '<li>$1</li>')
        .replace(/^- (.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        // Horizontal rules
        .replace(/^={20,}$/gm, '<hr/>')
        .replace(/^-{20,}$/gm, '<hr/>');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - Enoch Kwateh Dongbo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }
        
        .container {
            max-width: 8.5in;
            height: 11in;
            margin: 0 auto;
            background: white;
            padding: 0.5in;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
            color: #1a1a1a;
        }
        
        h2 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 15px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #333;
            color: #1a1a1a;
        }
        
        h3 {
            font-size: 12px;
            font-weight: bold;
            margin-top: 8px;
            margin-bottom: 3px;
            color: #1a1a1a;
        }
        
        p {
            font-size: 11px;
            margin-bottom: 8px;
            line-height: 1.4;
        }
        
        ul {
            margin-left: 20px;
            margin-bottom: 10px;
        }
        
        li {
            font-size: 11px;
            margin-bottom: 4px;
            line-height: 1.4;
        }
        
        strong {
            font-weight: bold;
            color: #1a1a1a;
        }
        
        em {
            font-style: italic;
        }
        
        a {
            color: #0066cc;
            text-decoration: none;
        }
        
        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 10px 0;
        }
        
        .contact-info {
            text-align: center;
            font-size: 10px;
            margin-bottom: 10px;
            line-height: 1.3;
        }
        
        .section {
            margin-bottom: 12px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            .container {
                box-shadow: none;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${html}
    </div>
</body>
</html>
    `;
}

/**
 * Create resume HTML file for PDF generation
 * Returns the file path
 */
function createResumeHtml(resumeTitle, markdownContent) {
    const htmlContent = markdownToHtml(markdownContent);
    const htmlFileName = `${resumeTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
    const htmlPath = path.join(__dirname, '..', 'docs', 'resumes', htmlFileName);

    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    return htmlPath;
}

module.exports = {
    markdownToHtml,
    createResumeHtml
};
