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
    crop = 'scale',      // Default: NO cropping (scale)
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
    const [currentSrc, setCurrentSrc] = useState(src);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

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
            
            // Determine dimensions based on device
            let finalWidth = width;
            let finalHeight = height;
            
            if (responsive && isMobile && mobileWidth) {
                finalWidth = mobileWidth;
                finalHeight = mobileHeight || mobileWidth;
            }
            
            // Build transformations
            const transformations = [];
            
            // Size transformation - using c_scale (NO cropping)
            if (finalWidth && finalHeight) {
                transformations.push(`w_${finalWidth},h_${finalHeight},c_${crop}`);
            } else if (finalWidth) {
                transformations.push(`w_${finalWidth},c_${crop}`);
            } else if (finalHeight) {
                transformations.push(`h_${finalHeight},c_${crop}`);
            }
            
            // Quality and format
            transformations.push(`q_${quality},f_${format}`);
            
            // Background removal
            if (removeBackground) {
                transformations.push('e_background_removal');
            }
            
            // Auto DPR for retina displays
            transformations.push('dpr_auto');
            
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
            
            const sizes = [120, 240, 360, 480, 600];
            const srcSet = sizes.map(size => {
                return `${baseUrl}w_${size},h_${size},c_${crop},q_${quality},f_${format}/${publicId} ${size}w`;
            }).join(', ');
            
            return srcSet;
        } catch (error) {
            return null;
        }
    };

    const handleError = () => {
        console.warn('Image failed to load:', src);
        setHasError(true);
        if (onError) onError();
    };

    const handleLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    const imageUrl = getOptimizedUrl();
    const srcSet = getResponsiveSrcSet();
    const sizes = responsive ? "(max-width: 480px) 120px, (max-width: 768px) 240px, 360px" : undefined;

    if (hasError || !src) {
        return (
            <div 
                className={`image-fallback ${className}`}
                style={{ width: finalWidth, height: finalHeight }}
            >
                <i className="fas fa-image"></i>
            </div>
        );
    }

    const finalWidth = responsive && isMobile && mobileWidth ? mobileWidth : width;
    const finalHeight = responsive && isMobile && mobileHeight ? mobileHeight : height;

    return (
        <div className={`image-container ${className}`} style={{ width: finalWidth, height: finalHeight }}>
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
                onLoad={handleLoad}
                onError={handleError}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                {...props}
            />
        </div>
    );
}

export default CloudinaryImage;