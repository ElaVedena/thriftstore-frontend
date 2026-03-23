import { useState } from 'react';
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
    ...props 
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    //function to get optimized Cloudinary URL
    const getOptimizedUrl = () => {
        if (!src) return '/placeholder-image.jpg';
        
        if (src.includes('cloudinary.com')) {
            const baseUrl = src.split('/upload/')[0] + '/upload/';
            const publicId = src.split('/upload/')[1]?.split('?')[0]?.replace(/^v\d+\//, '');
            
            if (!publicId) return src;
            
            // Add optimizations - use 'q_auto,f_auto' for quality
            const transformations = [];
            if (width && height) {
                transformations.push(`w_${width},h_${height},c_pad`); 
            }
            transformations.push('q_auto,f_auto');
            
            return `${baseUrl}${transformations.join(',')}/${publicId}`;
        }
        
       
        return src;
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

    if (hasError || !src) {
        return (
            <div 
                className={`image-fallback ${className}`}
                style={{ width, height }}
            >
                <i className="fas fa-image"></i>
            </div>
        );
    }

    return (
        <div className={`image-container ${className}`} style={{ width, height }}>
            {!isLoaded && (
                <div className="image-placeholder">
                    <div className="shimmer"></div>
                </div>
            )}
            <img
                src={imageUrl}
                alt={alt}
                className={`image ${isLoaded ? 'loaded' : 'loading'}`}
                loading={priority ? 'eager' : (lazy ? 'lazy' : 'eager')}
                onLoad={handleLoad}
                onError={handleError}
                style={{ width, height }}
                {...props}
            />
        </div>
    );
}

export default CloudinaryImage;