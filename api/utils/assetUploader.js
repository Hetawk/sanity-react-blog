const FormData = require('form-data');
const fetch = require('node-fetch');

/**
 * EKD Digital Assets Upload Utility
 * Handles file uploads to the VPS asset server
 */

class AssetUploader {
    constructor() {
        // EKD Digital Assets API Configuration
        this.apiUrl = process.env.ASSETS_API_URL || 'https://www.assets.andgroupco.com/api/v1/assets';
        this.baseUrl = process.env.VPS_BASE_URL || 'https://www.assets.andgroupco.com';

        // Project Configuration
        this.clientId = process.env.ASSET_CLIENT_ID || 'ekddigital';
        this.projectName = process.env.ASSET_PROJECT_NAME || 'portfolio';

        // Authentication
        this.apiKey = process.env.ASSETS_API_KEY || '';
        this.apiSecret = process.env.ASSETS_API_SECRET || '';
    }

    /**
     * Upload a file to the VPS asset server
     * @param {Buffer|Stream} fileBuffer - File buffer or stream
     * @param {Object} options - Upload options
     * @param {string} options.filename - Original filename
     * @param {string} options.assetType - Asset type (images, documents, videos, etc.)
     * @param {string} options.clientId - Override default client ID
     * @param {string} options.projectName - Override default project name
     * @returns {Promise<Object>} Upload result with file URL
     */
    async uploadFile(fileBuffer, options = {}) {
        try {
            const {
                filename,
                assetType = 'documents',
                clientId = this.clientId,
                projectName = this.projectName,
                mimeType = 'application/octet-stream'
            } = options;

            if (!filename) {
                throw new Error('Filename is required');
            }

            // Create form data
            const formData = new FormData();
            formData.append('file', fileBuffer, {
                filename,
                contentType: mimeType
            });
            formData.append('client_id', clientId);
            formData.append('project_name', projectName);
            formData.append('asset_type', assetType);

            // Prepare headers
            const headers = {
                ...formData.getHeaders()
            };

            // Add authentication headers
            if (this.apiKey && this.apiSecret) {
                headers['x-api-key'] = this.apiKey;
                headers['x-api-secret'] = this.apiSecret;
            }

            console.log(`Uploading ${filename} to EKD Digital Assets...`);
            console.log(`Target: ${this.apiUrl}/upload`);
            console.log(`Path: ${clientId}/${projectName}/${assetType}/`);

            // Upload to Assets API
            const response = await fetch(`${this.apiUrl}/upload`, {
                method: 'POST',
                headers,
                body: formData,
                timeout: 300000 // 5 minute timeout
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Assets API upload failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            // According to EKD Digital Assets documentation, 
            // the correct way to access assets is via the download URL with asset ID
            // Format: https://www.assets.andgroupco.com/api/v1/assets/{asset_id}/download
            const assetId = result.id;
            const publicUrl = `${this.apiUrl}/${assetId}/download`;

            console.log(`✅ Upload successful - Asset ID: ${assetId}`);
            console.log(`✅ Download URL: ${publicUrl}`);

            return {
                success: true,
                assetId: assetId,
                filename: result.filename || result.name || filename,
                filePath: result.filePath || result.file_path,
                fileUrl: publicUrl,
                size: result.size || fileBuffer.length,
                mimeType: result.mimeType || result.mime_type || mimeType,
                uploadedAt: new Date().toISOString(),
                vpsResponse: result
            };

        } catch (error) {
            console.error('❌ Upload failed:', error.message);
            throw new Error(`Asset upload failed: ${error.message}`);
        }
    }

    /**
     * Upload a resume PDF file
     * @param {Buffer} fileBuffer - PDF file buffer
     * @param {string} filename - Original filename
     * @returns {Promise<Object>} Upload result
     */
    async uploadResume(fileBuffer, filename) {
        return this.uploadFile(fileBuffer, {
            filename,
            assetType: 'resumes',
            mimeType: 'application/pdf'
        });
    }

    /**
     * Upload an image file
     * @param {Buffer} fileBuffer - Image file buffer
     * @param {string} filename - Original filename
     * @param {string} mimeType - Image MIME type
     * @returns {Promise<Object>} Upload result
     */
    async uploadImage(fileBuffer, filename, mimeType = 'image/jpeg') {
        return this.uploadFile(fileBuffer, {
            filename,
            assetType: 'images',
            mimeType
        });
    }

    /**
     * Upload a video file
     * @param {Buffer} fileBuffer - Video file buffer
     * @param {string} filename - Original filename
     * @param {string} mimeType - Video MIME type
     * @returns {Promise<Object>} Upload result
     */
    async uploadVideo(fileBuffer, filename, mimeType = 'video/mp4') {
        return this.uploadFile(fileBuffer, {
            filename,
            assetType: 'videos',
            mimeType
        });
    }

    /**
     * Upload a document file
     * @param {Buffer} fileBuffer - Document file buffer
     * @param {string} filename - Original filename
     * @param {string} mimeType - Document MIME type
     * @returns {Promise<Object>} Upload result
     */
    async uploadDocument(fileBuffer, filename, mimeType = 'application/pdf') {
        return this.uploadFile(fileBuffer, {
            filename,
            assetType: 'documents',
            mimeType
        });
    }

    /**
     * Get the public URL for an asset
     * @param {string} filePath - File path returned from upload
     * @returns {string} Public URL
     */
    getPublicUrl(filePath) {
        return `${this.baseUrl}/assets/${filePath}`;
    }
}

// Export singleton instance
module.exports = new AssetUploader();

// Also export the class for custom instances
module.exports.AssetUploader = AssetUploader;
