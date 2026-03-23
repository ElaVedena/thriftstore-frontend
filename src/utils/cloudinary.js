// utils/cloudinary.js
/**
 * Cloudinary image transformation utilities
 * 
 * Transformation flags:
 * - c_fill : Crop to fill dimensions (may crop parts of image)
 * - c_pad  : Add padding to fit dimensions
 * - c_scale: Scale to fit dimensions (may distort)
 * - c_thumb: Smart thumbnail cropping
 * - g_auto : Automatic gravity for smart cropping
 */

// Default transformations for different use cases
export const IMAGE_SIZES = {
    thumbnail: { width: 150, height: 150, crop: 'fill', gravity: 'auto' },
    product_card: { width: 300, height: 300, crop: 'fill', gravity: 'auto' },
    product_detail: { width: 600, height: 600, crop: 'pad', background: 'white' },
    banner: { width: 1200, height: 400, crop: 'fill', gravity: 'auto' },
    cart: { width: 100, height: 100, crop: 'fill', gravity: 'auto' },
    wishlist: { width: 200, height: 200, crop: 'fill', gravity: 'auto' },
    category: { width: 400, height: 300, crop: 'fill', gravity: 'auto' }
};

// Cloudinary cloud name (extract from URL or use default)
export const CLOUDINARY_CLOUD_NAME = 'daxepfapa';

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary')) return null;
    
    try {
        // Match patterns: /upload/v123456/folder/public_id.jpg
        // Also handle URLs without version: /upload/folder/public_id.jpg
        const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
        return matches ? matches[1] : null;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

/**
 * Extract cloud name from Cloudinary URL
 */
export const extractCloudName = (url) => {
    if (!url || !url.includes('cloudinary')) return CLOUDINARY_CLOUD_NAME;
    
    try {
        const matches = url.match(/res\.cloudinary\.com\/([^\/]+)/);
        return matches ? matches[1] : CLOUDINARY_CLOUD_NAME;
    } catch (error) {
        return CLOUDINARY_CLOUD_NAME;
    }
};

/**
 * Check if URL is a valid Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
    return url && url.includes('cloudinary.com') && url.includes('/upload/');
};

/**
 * Generate optimized Cloudinary URL with transformations
 * 
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.crop - Crop mode (fill, pad, scale, thumb)
 * @param {string} options.gravity - Gravity for cropping (auto, center, north, etc.)
 * @param {number|string} options.quality - Image quality (auto, 1-100)
 * @param {string} options.format - Output format (auto, jpg, png, webp)
 * @param {string} options.background - Background color for padding (hex or name)
 * @param {number} options.radius - Border radius
 * @param {string} options.effect - Special effects (sepia, grayscale, etc.)
 * @param {number} options.angle - Rotation angle
 * @param {boolean} options.secure - Use HTTPS (default: true)
 * @returns {string} Transformed Cloudinary URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
    // Handle invalid URLs
    if (!url) return '/placeholder-image.jpg';
    
    // If not a Cloudinary URL, return as-is
    if (!isCloudinaryUrl(url)) {
        return url;
    }

    try {
        const {
            width,
            height,
            crop = 'fill',
            gravity = 'auto',
            quality = 'auto',
            format = 'auto',
            background,
            radius,
            effect,
            angle,
            secure = true
        } = options;

        // Build transformation string
        const transformations = [];

        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        if (crop) transformations.push(`c_${crop}`);
        if (gravity) transformations.push(`g_${gravity}`);
        if (quality) transformations.push(`q_${quality}`);
        if (format) transformations.push(`f_${format}`);
        if (background) transformations.push(`b_${background}`);
        if (radius) transformations.push(`r_${radius}`);
        if (effect) transformations.push(`e_${effect}`);
        if (angle) transformations.push(`a_${angle}`);

        // Add dpr_auto for retina displays
        transformations.push('dpr_auto');

        const transformationString = transformations.join(',');

        // Insert transformations into URL
        // From: /upload/v123456/image.jpg
        // To:   /upload/w_300,h_300,c_fill,g_auto,q_auto,f_auto,dpr_auto/v123456/image.jpg
        const transformedUrl = url.replace('/upload/', `/upload/${transformationString}/`);
        
        // Ensure HTTPS
        if (secure && transformedUrl.startsWith('http:')) {
            return transformedUrl.replace('http:', 'https:');
        }
        
        return transformedUrl;
    } catch (error) {
        console.error('Error generating optimized URL:', error);
        return url;
    }
};

/**
 * Get image URL for specific use case
 */
export const getImageForUseCase = (url, useCase, customOptions = {}) => {
    if (!url) return '/placeholder-image.jpg';
    
    const size = IMAGE_SIZES[useCase];
    if (!size) return url;
    
    return getOptimizedImageUrl(url, { ...size, ...customOptions });
};

/**
 * Generate responsive srcSet for different screen sizes
 */
export const getResponsiveSrcSet = (url, sizes = [300, 600, 900, 1200], options = {}) => {
    if (!url || !isCloudinaryUrl(url)) return null;

    try {
        return sizes
            .map(size => {
                const optimizedUrl = getOptimizedImageUrl(url, { 
                    width: size, 
                    height: size,
                    ...options 
                });
                return `${optimizedUrl} ${size}w`;
            })
            .join(', ');
    } catch (error) {
        console.error('Error generating srcSet:', error);
        return null;
    }
};

/**
 * Generate a simple image URL without transformations
 * Useful for fallback when transformations fail
 */
export const getBaseImageUrl = (url) => {
    if (!url || !isCloudinaryUrl(url)) return url;
    
    try {
        // Remove any transformations
        return url.replace(/\/upload\/[^\/]+\//, '/upload/');
    } catch (error) {
        return url;
    }
};

/**
 * Get video thumbnail from Cloudinary video URL
 */
export const getVideoThumbnail = (videoUrl, options = {}) => {
    if (!videoUrl || !videoUrl.includes('cloudinary')) return null;
    
    try {
        // Convert video URL to image thumbnail URL
        const thumbnailUrl = videoUrl.replace('/video/upload/', '/image/upload/');
        return getOptimizedImageUrl(thumbnailUrl, options);
    } catch (error) {
        return null;
    }
};

/**
 * Validate if an image URL is accessible
 * Useful for checking if an image exists before displaying
 */
export const validateImageUrl = async (url) => {
    if (!url) return false;
    
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
};

/**
 * Get dominant color from image (requires Cloudinary API)
 */
export const getDominantColorUrl = (url, options = {}) => {
    if (!url || !isCloudinaryUrl(url)) return url;
    
    const {
        colors = 3,
        palette = false
    } = options;
    
    let transformation = `e_extract:${palette ? 'palette' : 'colors'}`;
    if (colors) transformation += `:${colors}`;
    
    return getOptimizedImageUrl(url, { effect: transformation });
};

export default {
    IMAGE_SIZES,
    extractPublicId,
    extractCloudName,
    isCloudinaryUrl,
    getOptimizedImageUrl,
    getImageForUseCase,
    getResponsiveSrcSet,
    getBaseImageUrl,
    getVideoThumbnail,
    validateImageUrl,
    getDominantColorUrl
};