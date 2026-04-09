import { useState, useEffect, useRef } from 'react';
import '../../components/css/ShippingForm.css';

function ShippingForm({ onSubmit, initialData = {} }) {
    const [formData, setFormData] = useState({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        county: initialData.county || '',
        postalCode: initialData.postalCode || '',
        saveInfo: initialData.saveInfo || false
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const nameInputRef = useRef(null);

    // Focus name input on mount
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    // Format phone number as user types
    const formatPhoneNumber = (value) => {
        // Remove all non-digits
        const cleaned = value.replace(/\D/g, '');
        
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        if (cleaned.length <= 9) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`; 
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Full name must be at least 3 characters';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
            const phoneDigits = formData.phone.replace(/\s/g, '');
            
            if (phoneDigits.length === 10) {
                if (!/^(07|01)\d{8}$/.test(phoneDigits)) {
                    newErrors.phone = 'Enter a valid Kenyan phone number';
                }
            } else if (phoneDigits.length === 12) {
                if (!/^254(7|1)\d{8}$/.test(phoneDigits)) {
                    newErrors.phone = 'Enter a valid Kenyan phone number';
                }
            } else {
                newErrors.phone = 'Phone number must be 10 digits';
            }
        }
        
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.trim().length < 5) {
            newErrors.address = 'Please enter a complete address';
        }
        
        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        } else if (formData.city.trim().length < 2) {
            newErrors.city = 'Please enter a valid city name';
        }
        
        if (!formData.county) {
            newErrors.county = 'Please select a county';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let processedValue = value;
        if (name === 'phone') {
            processedValue = formatPhoneNumber(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : processedValue
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        
        if (field === 'phone' && formData.phone) {
            const phoneDigits = formData.phone.replace(/\s/g, '');
            
            if (phoneDigits.length === 10) {
                if (!/^(07|01)\d{8}$/.test(phoneDigits)) {
                    setErrors(prev => ({ 
                        ...prev, 
                        phone: 'Enter a valid Kenyan phone number' 
                    }));
                }
            } else if (phoneDigits.length === 12) {
                if (!/^254(7|1)\d{8}$/.test(phoneDigits)) {
                    setErrors(prev => ({ 
                        ...prev, 
                        phone: 'Enter a valid Kenyan phone number' 
                    }));
                }
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        
        if (validateForm()) {
            const submitData = {
                ...formData,
                phone: formData.phone.replace(/\s/g, '')
            };
            onSubmit(submitData);
        }
    };

    const kenyanCounties = [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
        'Machakos', 'Uasin Gishu', 'Kilifi', 'Meru', 'Kakamega',
        'Bungoma', 'Busia', 'Siaya', 'Homabay', 'Migori',
        'Kisii', 'Nyamira', 'Kericho', 'Bomet', 'Nandi',
        'Elgeyo Marakwet', 'Turkana', 'West Pokot', 'Samburu',
        'Trans Nzoia', 'Baringo', 'Laikipia', 'Nyandarua',
        'Nyeri', 'Kirinyaga', 'Muranga', 'Embu', 'Tharaka Nithi',
        'Kitui', 'Makueni', 'Taita Taveta', 'Tana River', 'Lamu',
        'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo'
    ].sort();

    return (
        <form onSubmit={handleSubmit} className="shipping-form">
            <h2>Shipping Information</h2>
            <p className="form-subtitle">Enter your delivery details</p>
            
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="fullName">
                        <i className="fas fa-user"></i>
                        Full Name *
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        ref={nameInputRef}
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('fullName')}
                        className={`form-input ${errors.fullName && touched.fullName ? 'error' : ''}`}
                        placeholder=""
                    />
                    {errors.fullName && touched.fullName && (
                        <span className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.fullName}
                        </span>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="email">
                        <i className="fas fa-envelope"></i>
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                        placeholder=""
                    />
                    {errors.email && touched.email && (
                        <span className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.email}
                        </span>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="phone">
                        <i className="fas fa-phone"></i>
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={() => handleBlur('phone')}
                        className={`form-input ${errors.phone && touched.phone ? 'error' : ''}`}
                        placeholder=""
                        maxLength="13"
                    />
                    {errors.phone && touched.phone ? (
                        <span className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.phone}
                        </span>
                    ) : (
                        <span className="help-text">Format: 07XX XXX XXX (10 digits)</span>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="address">
                        <i className="fas fa-map-marker-alt"></i>
                        Delivery Address *
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={() => handleBlur('address')}
                        className={`form-input ${errors.address && touched.address ? 'error' : ''}`}
                        placeholder=""
                    />
                    {errors.address && touched.address && (
                        <span className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.address}
                        </span>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="city">
                        <i className="fas fa-city"></i>
                        Town/City *
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={() => handleBlur('city')}
                        className={`form-input ${errors.city && touched.city ? 'error' : ''}`}
                        placeholder=""
                    />
                    {errors.city && touched.city && (
                        <span className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.city}
                        </span>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="county">
                        <i className="fas fa-globe"></i>
                        County *
                    </label>
                    <select
                        id="county"
                        name="county"
                        value={formData.county}
                        onChange={handleChange}
                        onBlur={() => handleBlur('county')}
                        className={`form-select ${errors.county && touched.county ? 'error' : ''}`}
                    >
                        <option value="">Select County</option>
                        {kenyanCounties.map(county => (
                            <option key={county} value={county}>{county}</option>
                        ))}
                    </select>
                    {errors.county && touched.county && (
                        <span className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.county}
                        </span>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="postalCode">
                        <i className="fas fa-mail-bulk"></i>
                        Postal Code (Optional)
                    </label>
                    <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder=""
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-row checkbox">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="saveInfo"
                        checked={formData.saveInfo}
                        onChange={handleChange}
                    />
                    <span>Save this information for next time</span>
                </label>
            </div>

            <button type="submit" className="continue-btn">
                Continue to Payment
                <i className="fas fa-arrow-right"></i>
            </button>
        </form>
    );
}

export default ShippingForm;