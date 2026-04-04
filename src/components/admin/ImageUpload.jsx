import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import api from '../../services/api';
import '../../components/css/ImageUpload.css';

function ImageUpload({ images = [], onImagesChange, maxImages = 5 }) {
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [removeBackground, setRemoveBackground] = useState(false);
    const [imageQuality, setImageQuality] = useState(80);
    const [resizeWidth, setResizeWidth] = useState(800);
    const fileInputRef = useRef(null);
    const { showError, showSuccess, showInfo } = useNotification();

    // Initialize previews from existing images
    useEffect(() => {
        if (images && images.length > 0) {
            const initialPreviews = images.map(img => {
                if (typeof img === 'string') {
                    const transformedUrl = applyClientTransformations(img);
                    return {
                        url: img,
                        preview: transformedUrl,
                        file: null,
                        isExisting: true,
                        publicId: extractPublicIdFromUrl(img)
                    };
                } else if (img.url) {
                    const transformedUrl = applyClientTransformations(img.url);
                    return {
                        ...img,
                        preview: transformedUrl,
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

    // Apply client-side Cloudinary transformations for preview only
    const applyClientTransformations = (url) => {
        if (!url || !url.includes('cloudinary')) return url;
        
        let transformations = [];
        
        if (resizeWidth && resizeWidth > 0) {
            transformations.push(`w_${resizeWidth}`);
        }
        
        if (imageQuality && imageQuality < 100) {
            transformations.push(`q_${imageQuality}`);
        }
        
        if (removeBackground) {
            transformations.push('e_bgremoval');
        }
        
        if (transformations.length === 0) return url;
        
        return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
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

        // Create temporary previews for immediate feedback
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

            if (response.data.success) {
                const uploadedUrls = response.data.data || [];
                
                const previewsWithoutTemp = previews.filter(p => !p.isUploading);
                
                const finalPreviews = [
                    ...previewsWithoutTemp,
                    ...uploadedUrls.map(url => ({
                        url: url,
                        preview: applyClientTransformations(url),
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
            showError(error.response?.data?.message || 'Failed to upload images. Please try again.');
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

    // Update previews when transformation settings change
    useEffect(() => {
        setPreviews(prev => prev.map(img => ({
            ...img,
            preview: img.url ? applyClientTransformations(img.url) : img.preview
        })));
    }, [removeBackground, imageQuality, resizeWidth]);

    return (
        <div className="image-upload">
            {/* Image Settings Panel - Client-side only for preview */}
            <div className="image-settings">
                <div className="settings-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={removeBackground}
                            onChange={(e) => setRemoveBackground(e.target.checked)}
                            disabled={uploading}
                        />
                        Remove Background (AI) - Preview Only
                    </label>
                    <small>AI background removal effect for preview (applied client-side)</small>
                </div>

                <div className="settings-group">
                    <label>Preview Quality: {imageQuality}%</label>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={imageQuality}
                        onChange={(e) => setImageQuality(parseInt(e.target.value))}
                        disabled={uploading}
                    />
                    <small>Adjust preview quality (original image preserved)</small>
                </div>

                <div className="settings-group">
                    <label>Preview Width: {resizeWidth}px</label>
                    <input
                        type="range"
                        min="200"
                        max="1200"
                        step="50"
                        value={resizeWidth}
                        onChange={(e) => setResizeWidth(parseInt(e.target.value))}
                        disabled={uploading}
                    />
                    <small>Preview size adjustment (original image preserved)</small>
                </div>
            </div>

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

                        {removeBackground && img.url && !img.isUploading && (
                            <span className="image-badge bg-removed">
                                <i className="fas fa-magic"></i> Preview
                            </span>
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
                        <small>Uploading...</small>
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

            <p className="upload-hint">
                <i className="fas fa-info-circle"></i>
                Max {maxImages} images, 5MB each. Images are stored securely.
                {previews.length > 0 && (
                    <span className="image-count"> ({previews.length}/{maxImages})</span>
                )}
            </p>
        </div>
    );
}

export default ImageUpload;