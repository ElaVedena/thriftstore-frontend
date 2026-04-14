import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useNotification } from '../../../hooks/useNotification';
import Sidebar from '../../../components/admin/Sidebar';
import ImageUpload from '../../../components/admin/ImageUpload';
import '../Admin.css';

function AddProduct() {
    const navigate = useNavigate();
    const { showSuccess, showError, showWarning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        customCategory: '',
        brand: '',
        condition: '',
        size: '',
        color: '',
        material: '',
        era: '',
        stock: '',
        images: [],
        availableSizes: [],
        customSize: ''
    });
    const [errors, setErrors] = useState({});
    const [useCustomCategory, setUseCustomCategory] = useState(false);
    const [useCustomSize, setUseCustomSize] = useState(false);

    // Image processing settings
    const [imageSettings, setImageSettings] = useState({
        removeBackground: false,
        quality: 80,
        resizeWidth: 800
    });

    // Add class to body to hide global header and footer
    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    const categories = [
        'jackets', 'pants', 'dresses', 'shoes', 'accessories', 
        'sweaters', 'skirts', 't-shirts', 'shirts'
    ];

    const conditions = [
        'New with tags', 'New without tags', 'Like New', 
        'Very Good', 'Good', 'Fair'
    ];

    const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (useCustomCategory) {
            if (!formData.customCategory.trim()) {
                newErrors.customCategory = 'Custom category is required';
            }
        } else {
            if (!formData.category) {
                newErrors.category = 'Category is required';
            }
        }

        if (!formData.stock && formData.stock !== 0) {
            newErrors.stock = 'Stock is required';
        } else if (parseInt(formData.stock) < 0) {
            newErrors.stock = 'Stock cannot be negative';
        }

        if (formData.originalPrice && parseFloat(formData.originalPrice) < parseFloat(formData.price)) {
            showWarning('Original price should be higher than selling price');
        }

        if (useCustomSize && !formData.customSize.trim()) {
            newErrors.customSize = 'Custom size is required';
        }

        if (!formData.images || formData.images.length === 0) {
            newErrors.images = 'At least one product image is required';
        } else {
            const hasInvalidImages = formData.images.some(img => typeof img !== 'string');
            if (hasInvalidImages) {
                newErrors.images = 'Invalid image format. Please re-upload images.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSizeToggle = (size) => {
        setFormData(prev => ({
            ...prev,
            availableSizes: prev.availableSizes.includes(size)
                ? prev.availableSizes.filter(s => s !== size)
                : [...prev.availableSizes, size]
        }));
    };

    const handleAddCustomSize = () => {
        if (formData.customSize.trim()) {
            const newSize = formData.customSize.trim();
            if (!formData.availableSizes.includes(newSize)) {
                setFormData(prev => ({
                    ...prev,
                    availableSizes: [...prev.availableSizes, newSize],
                    customSize: ''
                }));
            } else {
                showWarning('This size already exists');
            }
        }
    };

    const handleRemoveSize = (sizeToRemove) => {
        setFormData(prev => ({
            ...prev,
            availableSizes: prev.availableSizes.filter(s => s !== sizeToRemove)
        }));
    };

    const handleImageSettingsChange = (settings) => {
        setImageSettings(settings);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showError('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const finalCategory = useCustomCategory ? formData.customCategory : formData.category;

            let finalSizes = [...formData.availableSizes];
            
            if (formData.customSize && !finalSizes.includes(formData.customSize)) {
                finalSizes.push(formData.customSize);
            }

            const imageUrls = formData.images.filter(url => url && typeof url === 'string');
            
            if (imageUrls.length === 0) {
                showError('No valid image URLs found. Please upload images again.');
                setLoading(false);
                return;
            }

            const productData = {
                name: formData.name,
                description: formData.description || '',
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stock: parseInt(formData.stock),
                category: finalCategory.toLowerCase().trim(),
                brand: formData.brand || '',
                condition: formData.condition || '',
                size: formData.size || '',
                color: formData.color || '',
                material: formData.material || '',
                era: formData.era || '',
                images: imageUrls,
                availableSizes: finalSizes,
                status: 'ACTIVE'
            };

            console.log('Creating product with data:', productData);

            const response = await adminService.createProduct(productData);
            
            if (response.success) {
                showSuccess('Product created successfully');
                navigate('/admin/products');
            } else {
                showError(response.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Product creation error:', error);
            showError(error.response?.data?.message || 'Failed to create product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-layout">
            <Sidebar />
            
            <main className="admin-main">
                <div className="admin-header">
                    <h1>Add New Product</h1>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-grid">
                        <div className="form-section">
                            <h2>Basic Information</h2>
                            
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? 'error' : ''}
                                    placeholder="e.g., Vintage Levi's Denim Jacket"
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Describe the product, its condition, features, etc."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (KSh) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className={errors.price ? 'error' : ''}
                                        placeholder="e.g., 4500"
                                    />
                                    {errors.price && <span className="error-message">{errors.price}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Original Price (KSh)</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g., 6500 (if on sale)"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stock *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className={errors.stock ? 'error' : ''}
                                    placeholder="e.g., 10"
                                />
                                {errors.stock && <span className="error-message">{errors.stock}</span>}
                            </div>
                        </div>

                        <div className="form-section">
                            <h2>Categories & Attributes</h2>
                            
                            <div className="form-group">
                                <label>Category Selection Method</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            checked={!useCustomCategory}
                                            onChange={() => setUseCustomCategory(false)}
                                        />
                                        Select from list
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            checked={useCustomCategory}
                                            onChange={() => setUseCustomCategory(true)}
                                        />
                                        Enter custom category
                                    </label>
                                </div>
                            </div>

                            {!useCustomCategory ? (
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select 
                                        name="category" 
                                        value={formData.category} 
                                        onChange={handleChange} 
                                        className={errors.category ? 'error' : ''}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="error-message">{errors.category}</span>}
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Custom Category *</label>
                                    <input
                                        type="text"
                                        name="customCategory"
                                        value={formData.customCategory}
                                        onChange={handleChange}
                                        className={errors.customCategory ? 'error' : ''}
                                        placeholder="Enter custom category (e.g., Vintage, Designer, etc.)"
                                    />
                                    {errors.customCategory && <span className="error-message">{errors.customCategory}</span>}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="e.g., Levi's, Nike, Zara"
                                />
                            </div>

                            <div className="form-group">
                                <label>Condition</label>
                                <select name="condition" value={formData.condition} onChange={handleChange}>
                                    <option value="">Select Condition</option>
                                    {conditions.map(cond => (
                                        <option key={cond} value={cond}>{cond}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Color</label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder="e.g., Blue, Black, Red"
                                />
                            </div>

                            <div className="form-group">
                                <label>Material</label>
                                <input
                                    type="text"
                                    name="material"
                                    value={formData.material}
                                    onChange={handleChange}
                                    placeholder="e.g., Cotton, Leather, Denim"
                                />
                            </div>

                            <div className="form-group">
                                <label>Era</label>
                                <input
                                    type="text"
                                    name="era"
                                    value={formData.era}
                                    onChange={handleChange}
                                    placeholder="e.g., 1990s, Vintage, Modern"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Sizes</h2>
                        
                        <div className="size-selection-method">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={useCustomSize}
                                    onChange={(e) => setUseCustomSize(e.target.checked)}
                                />
                                Add custom size (not in list)
                            </label>
                        </div>

                        {!useCustomSize ? (
                            <div className="checkbox-grid">
                                {sizeOptions.map(size => (
                                    <label key={size} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.availableSizes.includes(size)}
                                            onChange={() => handleSizeToggle(size)}
                                        />
                                        {size}
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="custom-size-input">
                                <div className="form-row">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="customSize"
                                            value={formData.customSize}
                                            onChange={handleChange}
                                            placeholder="Enter custom size (e.g., 28, 30, 32, etc.)"
                                            className={errors.customSize ? 'error' : ''}
                                        />
                                        {errors.customSize && <span className="error-message">{errors.customSize}</span>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddCustomSize}
                                        className="btn-secondary"
                                        disabled={!formData.customSize.trim()}
                                    >
                                        Add Size
                                    </button>
                                </div>
                            </div>
                        )}

                        {formData.availableSizes.length > 0 && (
                            <div className="selected-sizes">
                                <p><strong>Selected Sizes:</strong></p>
                                <div className="size-tags">
                                    {formData.availableSizes.map(size => (
                                        <span key={size} className="size-tag">
                                            {size}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSize(size)}
                                                className="remove-size"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <p className="field-hint">Select or add all sizes that are available</p>
                    </div>

                    <div className="form-section">
                        <h2>Product Images</h2>
                        
                        <div className="image-processing-settings">
                            <h3>Image Processing Options</h3>
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={imageSettings.removeBackground}
                                            onChange={(e) => setImageSettings(prev => ({ ...prev, removeBackground: e.target.checked }))}
                                        />
                                        Remove Background (AI)
                                    </label>
                                    <small>Automatically removes image background using AI</small>
                                </div>

                                <div className="setting-item">
                                    <label>Image Quality: {imageSettings.quality}%</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={imageSettings.quality}
                                        onChange={(e) => setImageSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                                    />
                                    <small>Lower quality = smaller file size</small>
                                </div>

                                <div className="setting-item">
                                    <label>Resize Width: {imageSettings.resizeWidth}px</label>
                                    <input
                                        type="range"
                                        min="200"
                                        max="1200"
                                        step="50"
                                        value={imageSettings.resizeWidth}
                                        onChange={(e) => setImageSettings(prev => ({ ...prev, resizeWidth: parseInt(e.target.value) }))}
                                    />
                                    <small>Images will be resized to this width</small>
                                </div>
                            </div>
                        </div>

                        <ImageUpload
                            images={formData.images}
                            onImagesChange={(newImages) => {
                                console.log('ImageUpload returned:', newImages);
                                setFormData(prev => ({ ...prev, images: newImages }));
                            }}
                            maxImages={5}
                            removeBackground={imageSettings.removeBackground}
                            imageQuality={imageSettings.quality}
                            resizeWidth={imageSettings.resizeWidth}
                        />
                        {errors.images && <span className="error-message">{errors.images}</span>}
                        <p className="field-hint">Upload up to 5 images. First image will be the main product image. Use the settings above to optimize your images.</p>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Creating Product...
                                </>
                            ) : (
                                'Create Product'
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default AddProduct;