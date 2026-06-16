import { useState, useEffect } from 'react';
import '../../components/css/CloudinaryImage.css';

function CloudinaryImage({ 
    src, 
    alt = '',
    width,
    height,
    className = '',
    lazy = true,
    onLoad,
    onError,
    priority = false,
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
    removeBackground = false,
    responsive = false,
    mobileWidth,
    mobileHeight,
    ...props 
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            setWindowWidth(window.innerWidth);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Calculate final dimensions
    const getFinalDimensions = () => {
        let finalWidth = width;
        let finalHeight = height;
        
        if (responsive && isMobile && mobileWidth) {
            finalWidth = mobileWidth;
            finalHeight = mobileHeight || mobileWidth;
        }
        
        return { finalWidth, finalHeight };
    };

    const { finalWidth, finalHeight } = getFinalDimensions();

    // Function to get optimized Cloudinary URL
    const getOptimizedUrl = () => {
        if (!src) return '/placeholder-image.jpg';
        
        // If not Cloudinary URL, return as-is
        if (!src.includes('cloudinary.com')) {
            return src;
        }
        
        try {
            const baseUrl = src.split('/upload/')[0] + '/upload/';
            let publicId = src.split('/upload/')[1]?.split('?')[0];
            
            if (!publicId) return src;
            
            // Remove version prefix (e.g., v123456/)
            publicId = publicId.replace(/^v\d+\//, '');
            
            // Build transformations
            const transformations = [];
            
            // ONLY add transformations if width/height are explicitly provided
            // Otherwise, don't transform the image at all
            if (finalWidth && finalHeight) {
                // Use 'c_scale' with 'limit' - only scales down, never up
                transformations.push(`w_${finalWidth},h_${finalHeight},c_scale`);
            } else if (finalWidth) {
                transformations.push(`w_${finalWidth},c_scale`);
            } else if (finalHeight) {
                transformations.push(`h_${finalHeight},c_scale`);
            }
            
            // Only add quality/format if they're not 'auto'
            // This prevents unnecessary transformations
            if (quality && quality !== 'auto') {
                transformations.push(`q_${quality}`);
            }
            if (format && format !== 'auto') {
                transformations.push(`f_${format}`);
            }
            
            // Background removal (optional - only if explicitly requested)
            if (removeBackground) {
                transformations.push('e_bgremoval');
            }
            
            // If no transformations needed, return the original URL
            if (transformations.length === 0) {
                return src;
            }
            
            const transformationString = transformations.join(',');
            
            return `${baseUrl}${transformationString}/${publicId}`;
            
        } catch (error) {
            console.error('Error generating Cloudinary URL:', error);
            return src;
        }
    };

    // Generate responsive srcSet for different screen sizes
    const getResponsiveSrcSet = () => {
        if (!src || !src.includes('cloudinary.com') || !responsive) return null;
        
        try {
            const baseUrl = src.split('/upload/')[0] + '/upload/';
            let publicId = src.split('/upload/')[1]?.split('?')[0];
            publicId = publicId?.replace(/^v\d+\//, '');
            
            if (!publicId) return null;
            
            const sizeOptions = [120, 240, 360, 480, 600];
            const srcSet = sizeOptions.map(size => {
                // Use c_scale to simply scale down, preserving aspect ratio
                return `${baseUrl}w_${size},h_${size},c_scale/${publicId} ${size}w`;
            }).join(', ');
            
            return srcSet;
        } catch (error) {
            return null;
        }
    };

    const handleImageError = () => {
        console.warn('Image failed to load:', src);
        setHasError(true);
        if (onError) onError();
    };

    const handleImageLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    // If dimensions are provided, use them for the container
    const containerStyle = {
        width: finalWidth || '100%',
        height: finalHeight || '100%'
    };

    // Remove dimensions from props to avoid conflicting with container
    const imgProps = { ...props };
    delete imgProps.width;
    delete imgProps.height;

    const imageUrl = getOptimizedUrl();
    const srcSet = getResponsiveSrcSet();
    const sizes = responsive ? "(max-width: 480px) 120px, (max-width: 768px) 240px, 360px" : undefined;

    if (hasError || !src) {
        return (
            <div 
                className={`image-fallback ${className}`}
                style={containerStyle}
            >
                <i className="fas fa-image"></i>
            </div>
        );
    }

    return (
        <div className={`image-container ${className}`} style={containerStyle}>
            {!isLoaded && (
                <div className="image-placeholder">
                    <div className="shimmer"></div>
                </div>
            )}
            <img
                src={imageUrl}
                srcSet={srcSet}
                sizes={sizes}
                alt={alt}
                className={`image ${isLoaded ? 'loaded' : 'loading'}`}
                loading={priority ? 'eager' : (lazy ? 'lazy' : 'eager')}
                onLoad={handleImageLoad}
                onError={handleImageError}
                {...imgProps}
            />
        </div>
    );
}

export default CloudinaryImage;