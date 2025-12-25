import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownRenderer.scss';

/**
 * MarkdownRenderer Component
 * Renders markdown content with proper styling
 * Supports: bold, italic, lists, links, headers, code blocks
 */
const MarkdownRenderer = ({
    content,
    className = '',
    maxLength = null,
    inline = false
}) => {
    if (!content) return null;

    // Truncate content if maxLength is specified
    let displayContent = content;
    let isTruncated = false;

    if (maxLength && content.length > maxLength) {
        displayContent = content.substring(0, maxLength).trim() + '...';
        isTruncated = true;
    }

    // For inline rendering (tooltips, etc.), strip block elements
    if (inline) {
        return (
            <span className={`markdown-renderer markdown-renderer--inline ${className}`}>
                <ReactMarkdown
                    components={{
                        // Convert block elements to inline
                        p: ({ children }) => <span>{children}</span>,
                        h1: ({ children }) => <strong>{children}</strong>,
                        h2: ({ children }) => <strong>{children}</strong>,
                        h3: ({ children }) => <strong>{children}</strong>,
                        h4: ({ children }) => <strong>{children}</strong>,
                        ul: ({ children }) => <span>{children}</span>,
                        ol: ({ children }) => <span>{children}</span>,
                        li: ({ children }) => <span>{children} </span>,
                        // Keep inline elements as-is
                        strong: ({ children }) => <strong>{children}</strong>,
                        em: ({ children }) => <em>{children}</em>,
                        code: ({ children }) => <code>{children}</code>,
                        a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                            </a>
                        ),
                    }}
                >
                    {displayContent}
                </ReactMarkdown>
            </span>
        );
    }

    return (
        <div className={`markdown-renderer ${className}`}>
            <ReactMarkdown
                components={{
                    // Open links in new tab
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                        </a>
                    ),
                    // Style code blocks
                    code: ({ inline, children }) => (
                        inline
                            ? <code className="markdown-renderer__inline-code">{children}</code>
                            : <pre className="markdown-renderer__code-block"><code>{children}</code></pre>
                    ),
                }}
            >
                {displayContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
