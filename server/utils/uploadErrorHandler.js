const multer = require('multer');

/**
 * Middleware to handle Multer errors (file size, type, etc.)
 * Use this after multer middleware in routes
 */
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                error: 'File too large',
                message: 'File size must be less than 5MB. Please compress your file and try again.',
                maxSize: '5MB',
                code: 'FILE_TOO_LARGE'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Unexpected field',
                message: 'Unexpected file field in upload',
                code: error.code
            });
        }
        return res.status(400).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }

    // Handle file filter errors (wrong file type)
    if (error.message && error.message.includes('Only')) {
        return res.status(400).json({
            success: false,
            error: 'Invalid file type',
            message: error.message,
            code: 'INVALID_FILE_TYPE'
        });
    }

    next(error);
};

/**
 * Parse upload error and return appropriate status code and user-friendly message
 * @param {Error} error - The error object
 * @returns {Object} - { statusCode, userMessage, errorCode }
 */
const parseUploadError = (error) => {
    const errorMessage = error.message || 'Unknown error occurred';
    let statusCode = 500;
    let userMessage = errorMessage;
    let errorCode = 'UPLOAD_FAILED';

    // File too large (413)
    if (errorMessage.includes('413') ||
        errorMessage.includes('Too Large') ||
        errorMessage.includes('PAYLOAD_TOO_LARGE') ||
        errorMessage.includes('FUNCTION_PAYLOAD_TOO_LARGE')) {
        statusCode = 413;
        userMessage = 'File is too large for the server to process. Please compress your file to under 5MB and try again.';
        errorCode = 'FILE_TOO_LARGE';
    }
    // Authentication errors (401)
    else if (errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Authentication')) {
        statusCode = 401;
        userMessage = 'Authentication failed. Please contact support.';
        errorCode = 'AUTH_FAILED';
    }
    // Access denied (403)
    else if (errorMessage.includes('403') ||
        errorMessage.includes('Forbidden')) {
        statusCode = 403;
        userMessage = 'Access denied. Please contact support.';
        errorCode = 'ACCESS_DENIED';
    }
    // Timeout (504)
    else if (errorMessage.includes('timeout') ||
        errorMessage.includes('ETIMEDOUT')) {
        statusCode = 504;
        userMessage = 'Upload timeout. Please try again with a smaller file.';
        errorCode = 'TIMEOUT';
    }
    // Network errors
    else if (errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('Network')) {
        statusCode = 503;
        userMessage = 'Unable to connect to upload service. Please try again later.';
        errorCode = 'SERVICE_UNAVAILABLE';
    }
    // Bad request (400)
    else if (errorMessage.includes('400') ||
        errorMessage.includes('Bad Request')) {
        statusCode = 400;
        userMessage = 'Invalid file or request. Please check your file and try again.';
        errorCode = 'BAD_REQUEST';
    }

    return { statusCode, userMessage, errorCode, originalError: errorMessage };
};

/**
 * Create a standardized error response for upload failures
 * @param {Error} error - The error object
 * @param {string} fileType - Type of file being uploaded (e.g., 'image', 'document', 'logo')
 * @returns {Object} - Response object with status and json data
 */
const createUploadErrorResponse = (error, fileType = 'file') => {
    const { statusCode, userMessage, errorCode, originalError } = parseUploadError(error);

    return {
        status: statusCode,
        json: {
            success: false,
            error: userMessage,
            message: userMessage,
            code: errorCode,
            fileType: fileType,
            // Only include technical details in development
            details: process.env.NODE_ENV === 'development' ? originalError : undefined
        }
    };
};

/**
 * Wrap an upload handler with standardized error handling
 * @param {Function} handler - Async handler function
 * @param {string} fileType - Type of file being uploaded
 * @returns {Function} - Express middleware function
 */
const withUploadErrorHandling = (handler, fileType = 'file') => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            console.error(`❌ ${fileType} upload error:`, error);
            const errorResponse = createUploadErrorResponse(error, fileType);
            res.status(errorResponse.status).json(errorResponse.json);
        }
    };
};

module.exports = {
    handleMulterError,
    parseUploadError,
    createUploadErrorResponse,
    withUploadErrorHandling
};
