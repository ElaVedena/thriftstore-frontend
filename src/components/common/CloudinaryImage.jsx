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
            
            // Determine dimensions based on device
            let imgWidth = finalWidth;
            let imgHeight = finalHeight;
            
            if (responsive && isMobile && mobileWidth) {
                imgWidth = mobileWidth;
                imgHeight = mobileHeight || mobileWidth;
            }
            
            // Build transformations
            const transformations = [];
            
            // Size transformation - using c_scale (NO cropping)
            if (imgWidth && imgHeight) {
                transformations.push(`w_${imgWidth},h_${imgHeight},c_${crop}`);
            } else if (imgWidth) {
                transformations.push(`w_${imgWidth},c_${crop}`);
            } else if (imgHeight) {
                transformations.push(`h_${imgHeight},c_${crop}`);
            }
            
            // Quality and format
            transformations.push(`q_${quality},f_${format}`);
            
            // Background removal - using correct Cloudinary syntax
            if (removeBackground) {
                transformations.push('e_bgremoval');
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
                return `${baseUrl}w_${size},h_${size},c_${crop},q_${quality},f_${format}/${publicId} ${size}w`;
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
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                {...props}
            />
        </div>
    );
}

export default CloudinaryImage;