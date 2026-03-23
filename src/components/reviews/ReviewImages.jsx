import { useState } from 'react';
import '../../components/css/ReviewImages.css';

function ReviewImages({ images }) {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!images || images.length === 0) return null;

    const openLightbox = (image) => {
        setSelectedImage(image);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <>
            <div className="review-images">
                {images.slice(0, 3).map((image, index) => (
                    <div 
                        key={index} 
                        className="review-image-thumb"
                        onClick={() => openLightbox(image)}
                    >
                        <img src={image} alt={`Review ${index + 1}`} />
                        {index === 2 && images.length > 3 && (
                            <div className="more-images">
                                +{images.length - 3}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div className="image-lightbox" onClick={closeLightbox}>
                    <span className="close-lightbox">&times;</span>
                    <img src={selectedImage} alt="Review" />
                </div>
            )}
        </>
    );
}

export default ReviewImages;