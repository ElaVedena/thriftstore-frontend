import { useState } from 'react';
import '../../../components/css/ProductImages.css';
import CloudinaryImage from '../../common/CloudinaryImage';

function ProductImages({ images, productName }) {
    const [mainImage, setMainImage] = useState(images?.[0] || '');

    // Handle case when no images are provided
    if (!images || images.length === 0) {
        return (
            <div className="product-images">
                <div className="main-image no-image">
                    <CloudinaryImage
                        src="/placeholder-image.jpg"
                        alt="No image available"
                        width={600}
                        height={600}
                        crop="pad"
                        background="white"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="product-images">
            <div className="main-image">
                <CloudinaryImage
                    src={mainImage}
                    alt={productName}
                    width={600}
                    height={600}
                    crop="pad"          
                    background="white"   
                    quality="auto"       
                    format="auto"        
                    className="main-img"
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
                                width={100}
                                height={100}
                                crop="fill"     
                                gravity="auto" 
                                quality="auto"
                                format="auto"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductImages;