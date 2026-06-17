import { useState, useEffect } from 'react';
import '../../components/css/CloudinaryImage.css';

function CloudinaryImage({ 
    src, 
    alt = '',
    className = '',
    lazy = true,
    onLoad,
    onError,
    priority = false,
    quality = 'auto',
    format = 'auto',
    ...props 
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Use the original URL without any transformations
    const imageUrl = src || '/placeholder-image.jpg';

    const handleImageError = () => {
        console.warn('Image failed to load:', src);
        setHasError(true);
        if (onError) onError();
    };

    const handleImageLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    if (hasError || !src) {
        return (
            <div className={`image-fallback ${className}`}>
                <i className="fas fa-image"></i>
            </div>
        );
    }

    return (
        <div className="image-container">
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
                onLoad={handleImageLoad}
                onError={handleImageError}
                {...props}
            />
        </div>
    );
}

export default CloudinaryImage;