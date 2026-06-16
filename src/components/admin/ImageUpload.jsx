import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import api from '../../services/api';
import '../../components/css/ImageUpload.css';

function ImageUpload({ images = [], onImagesChange, maxImages = 5 }) {
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const { showError, showSuccess, showInfo } = useNotification();

    // Initialize previews from existing images
    useEffect(() => {
        if (images && images.length > 0) {
            const initialPreviews = images.map(img => {
                if (typeof img === 'string') {
                    return {
                        url: img,
                        preview: img,
                        file: null,
                        isExisting: true,
                        publicId: extractPublicIdFromUrl(img)
                    };
                } else if (img.url) {
                    return {
                        ...img,
                        preview: img.url,
                        isExisting: true,
                        publicId: img.publicId || extractPublicIdFromUrl(img.url)
                    };
                }
                return img;
            });
            setPreviews(initialPreviews);
        } else {
            setPreviews([]);
        }
    }, [images]);

    // Helper to extract public ID from Cloudinary URL
    const extractPublicIdFromUrl = (url) => {
        if (!url) return null;
        const matches = url.match(/\/v\d+\/(.+)\./);
        return matches ? matches[1] : null;
    };

    const validateFiles = (files) => {
        const validFiles = [];
        const errors = [];

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`${file.name} is too large. Max size is 5MB`);
                continue;
            }
            if (!file.type.startsWith('image/')) {
                errors.push(`${file.name} is not an image`);
                continue;
            }
            validFiles.push(file);
        }

        return { validFiles, errors };
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        
        if (previews.length + files.length > maxImages) {
            showError(`You can only upload up to ${maxImages} images`);
            return;
        }

        const { validFiles, errors } = validateFiles(files);
        errors.forEach(error => showError(error));

        if (validFiles.length === 0) return;

        const formData = new FormData();
        validFiles.forEach(file => {
            formData.append('files', file);
        });

        setUploading(true);
        setUploadProgress(0);

        const tempPreviews = validFiles.map(file => ({
            url: null,
            preview: URL.createObjectURL(file),
            file: file,
            isExisting: false,
            isUploading: true,
            fileName: file.name
        }));

        const newPreviews = [...previews, ...tempPreviews];
        setPreviews(newPreviews);

        try {
            const response = await api.post('/uploads/product-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                },
            });

            console.log('Upload response:', response.data);

            if (response.data.success) {
                const uploadedUrls = response.data.data || [];
                
                const previewsWithoutTemp = previews.filter(p => !p.isUploading);
                
                const finalPreviews = [
                    ...previewsWithoutTemp,
                    ...uploadedUrls.map(url => ({
                        url: url,
                        preview: url,
                        file: null,
                        isExisting: false,
                        publicId: extractPublicIdFromUrl(url)
                    }))
                ];

                setPreviews(finalPreviews);
                
                const imageUrlsOnly = finalPreviews
                    .filter(img => img.url)
                    .map(img => img.url);
                
                onImagesChange(imageUrlsOnly);
                showSuccess(`${validFiles.length} image(s) uploaded successfully`);
            } else {
                showError(response.data.message || 'Failed to upload images');
                const filteredPreviews = previews.filter(p => !p.isUploading);
                setPreviews(filteredPreviews);
                onImagesChange(filteredPreviews.map(p => p.url).filter(Boolean));
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to upload images. Please try again.';
            showError(errorMessage);
            
            const filteredPreviews = previews.filter(p => !p.isUploading);
            filteredPreviews.forEach(p => {
                if (p.preview?.startsWith('blob:')) {
                    URL.revokeObjectURL(p.preview);
                }
            });
            
            setPreviews(filteredPreviews);
            onImagesChange(filteredPreviews.map(p => p.url).filter(Boolean));
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = async (index) => {
        const imageToRemove = previews[index];
        
        if (imageToRemove.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove.preview);
        }

        if (imageToRemove.publicId && !imageToRemove.isUploading) {
            try {
                await api.delete('/uploads/images', {
                    params: { publicId: imageToRemove.publicId }
                });
                showInfo('Image deleted from storage');
            } catch (error) {
                console.error('Failed to delete from Cloudinary:', error);
            }
        }
        
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
        
        const imageUrlsOnly = newPreviews
            .filter(img => img.url)
            .map(img => img.url);
        
        onImagesChange(imageUrlsOnly);
        showInfo('Image removed');
    };

    const handleReorder = (dragIndex, dropIndex) => {
        if (dragIndex === dropIndex) return;
        
        const newPreviews = [...previews];
        const [draggedItem] = newPreviews.splice(dragIndex, 1);
        newPreviews.splice(dropIndex, 0, draggedItem);
        setPreviews(newPreviews);
        
        const imageUrlsOnly = newPreviews
            .filter(img => img.url)
            .map(img => img.url);
        
        onImagesChange(imageUrlsOnly);
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
            handleReorder(dragIndex, dropIndex);
        }
    };

    return (
        <div className="image-upload">
            <div className="image-grid">
                {previews.map((img, index) => (
                    <div 
                        key={img.url || img.preview || index} 
                        className={`image-item ${img.isUploading ? 'uploading' : ''}`}
                        draggable={!img.isUploading}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <img 
                            src={img.preview || img.url} 
                            alt={`Product ${index + 1}`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x300?text=Error';
                            }}
                        />
                        <button
                            type="button"
                            className="remove-image"
                            onClick={() => handleRemove(index)}
                            disabled={img.isUploading}
                            title="Remove image"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        
                        {img.isUploading && (
                            <div className="uploading-overlay">
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>Uploading...</span>
                            </div>
                        )}

                        {img.isExisting && (
                            <span className="image-badge existing">Saved</span>
                        )}

                        {!img.isUploading && !img.isExisting && (
                            <span className="image-badge new">New</span>
                        )}
                    </div>
                ))}

                {previews.length < maxImages && !uploading && (
                    <div 
                        className="upload-placeholder"
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Upload Image</span>
                        <small>Click or drag to upload</small>
                    </div>
                )}

                {uploading && (
                    <div className="upload-placeholder uploading">
                        <div className="upload-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                        </div>
                        <div className="upload-progress">
                            <div 
                                className="progress-bar" 
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                            <span>{uploadProgress}%</span>
                        </div>
                        <small>Uploading to Cloudinary...</small>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                style={{ display: 'none' }}
                disabled={uploading}
            />

            {/* UPDATED: Removed the misleading hint about resizing */}
            <p className="upload-hint">
                <i className="fas fa-info-circle"></i>
                Max {maxImages} images, 5MB each. Upload images at their original size.
                {previews.length > 0 && (
                    <span className="image-count"> ({previews.length}/{maxImages})</span>
                )}
            </p>
        </div>
    );
}

export default ImageUpload;