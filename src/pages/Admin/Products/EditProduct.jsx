import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useNotification } from '../../../hooks/useNotification';
import Sidebar from '../../../components/admin/Sidebar';
import ImageUpload from '../../../components/admin/ImageUpload';
import '../Admin.css';

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        brand: '',
        condition: '',
        size: '',
        color: '',
        material: '',
        era: '',
        stock: '',
        status: 'ACTIVE',
        images: [],
        availableSizes: []
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [originalData, setOriginalData] = useState(null);

    const categories = [
        'jackets', 'pants', 'dresses', 'shoes', 'accessories', 
        'sweaters', 'skirts', 't-shirts', 'shirts'
    ];

    const conditions = [
        'New with tags', 'New without tags', 'Like New', 
        'Very Good', 'Good', 'Fair'
    ];

    const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

    // Load product data when component mounts
    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            // You need to add this method to your adminService
            const response = await adminService.getProductById(id);
            
            if (response.success) {
                const product = response.data || response.product;
                setOriginalData(product);
                
                // Map the product data to form fields
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price || '',
                    originalPrice: product.originalPrice || '',
                    category: product.category || '',
                    brand: product.brand || '',
                    condition: product.condition || '',
                    size: product.size || '',
                    color: product.color || '',
                    material: product.material || '',
                    era: product.era || '',
                    stock: product.stock || '',
                    status: product.status || 'ACTIVE',
                    images: product.images || [],
                    availableSizes: product.availableSizes || []
                });
            } else {
                showError(response.message || 'Failed to load product');
                navigate('/admin/products');
            }
        } catch (error) {
            console.error('Failed to load product:', error);
            showError('An error occurred while loading the product');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.stock && formData.stock !== 0) {
            newErrors.stock = 'Stock is required';
        } else if (parseInt(formData.stock) < 0) {
            newErrors.stock = 'Stock cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSizeToggle = (size) => {
        setFormData(prev => ({
            ...prev,
            availableSizes: prev.availableSizes?.includes(size)
                ? prev.availableSizes.filter(s => s !== size)
                : [...(prev.availableSizes || []), size]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showError('Please fill in all required fields');
            return;
        }

        setSaving(true);

        try {
            // Prepare the data for update
            const productData = {
                name: formData.name,
                description: formData.description || '',
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stock: parseInt(formData.stock),
                category: formData.category,
                brand: formData.brand || '',
                condition: formData.condition || '',
                size: formData.size || '',
                color: formData.color || '',
                material: formData.material || '',
                era: formData.era || '',
                status: formData.status,
                images: formData.images || [],
                availableSizes: formData.availableSizes || []
            };

            const response = await adminService.updateProduct(id, productData);
            
            if (response.success) {
                showSuccess('Product updated successfully');
                navigate('/admin/products');
            } else {
                showError(response.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Product update error:', error);
            showError(error.response?.data?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    // Check if form has been modified
    const hasChanges = () => {
        if (!originalData) return false;
        
        return JSON.stringify(formData) !== JSON.stringify({
            name: originalData.name || '',
            description: originalData.description || '',
            price: originalData.price || '',
            originalPrice: originalData.originalPrice || '',
            category: originalData.category || '',
            brand: originalData.brand || '',
            condition: originalData.condition || '',
            size: originalData.size || '',
            color: originalData.color || '',
            material: originalData.material || '',
            era: originalData.era || '',
            stock: originalData.stock || '',
            status: originalData.status || 'ACTIVE',
            images: originalData.images || [],
            availableSizes: originalData.availableSizes || []
        });
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading product...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            
            <main className="admin-main">
                <div className="admin-header">
                    <h1>Edit Product: {formData.name}</h1>
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

                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                    <option value="DELETED">Deleted</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Sizes</h2>
                        <div className="checkbox-grid">
                            {sizeOptions.map(size => (
                                <label key={size} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.availableSizes?.includes(size)}
                                        onChange={() => handleSizeToggle(size)}
                                    />
                                    {size}
                                </label>
                            ))}
                        </div>
                        <p className="field-hint">Select all sizes that are available</p>
                    </div>

                    <div className="form-section">
                        <h2>Product Images</h2>
                        <ImageUpload
                            images={formData.images || []}
                            onImagesChange={(newImages) => {
                                setFormData(prev => ({ ...prev, images: newImages }));
                            }}
                            maxImages={5}
                        />
                        <p className="field-hint">Upload up to 5 images. First image will be the main product image.</p>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="btn-secondary"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving || !hasChanges()}
                        >
                            {saving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Saving Changes...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default EditProduct;