import { useState, useEffect } from 'react';
import '../../../components/css/ProductImages.css';
import CloudinaryImage from '../../common/CloudinaryImage';

function ProductImages({ images, productName }) {
    const [mainImage, setMainImage] = useState(images?.[0] || '');
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

    // Handle case when no images are provided
    if (!images || images.length === 0) {
        return (
            <div className="product-images">
                <div className="main-image no-image">
                    <CloudinaryImage
                        src="/placeholder-image.jpg"
                        alt="No image available"
                        width={isMobile ? 400 : 600}
                        height={isMobile ? 400 : 600}
                        crop="scale"
                        quality="auto"
                        format="auto"
                    />
                </div>
            </div>
        );
    }

    // Main image dimensions based on device
    const mainImageWidth = isMobile ? 400 : 600;
    const mainImageHeight = isMobile ? 400 : 600;

    return (
        <div className="product-images">
            <div className="main-image">
                <CloudinaryImage
                    src={mainImage}
                    alt={productName}
                    width={mainImageWidth}
                    height={mainImageHeight}
                    crop="scale"           // NO cropping - entire image visible
                    quality="auto"
                    format="auto"
                    className="main-img"
                    responsive={true}
                    priority={true}
                />
            </div>
            
            {images.length > 1 && (
                <div className="thumbnail-grid">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            className={`thumbnail ${mainImage === image ? 'active' : ''}`}
                            onClick={() => setMainImage(image)}
                        >
                            <CloudinaryImage
                                src={image}
                                alt={`${productName} ${index + 1}`}
                                width={80}
                                height={80}
                                crop="scale"        // NO cropping for thumbnails
                                quality="auto"
                                format="webp"       // WebP for thumbnails (smaller)
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductImages;