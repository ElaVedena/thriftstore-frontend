// pages/Beauty.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import CartFloatingIcon from '../components/common/CartFloatingIcon';
import '../components/css/Beauty.css';

function Beauty() {
    const [selectedTab, setSelectedTab] = useState('recommend');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSkinType, setSelectedSkinType] = useState('');
    const [selectedConcern, setSelectedConcern] = useState('');
    const [selectedCoverage, setSelectedCoverage] = useState('');
    const [selectedFinish, setSelectedFinish] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [detectedSkinTone, setDetectedSkinTone] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [foundationMatches, setFoundationMatches] = useState([]);
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);

    // Skin type options
    const skinTypes = [
        { value: 'oily', label: 'Oily', icon: 'fas fa-tint', description: 'Shiny appearance, large pores' },
        { value: 'dry', label: 'Dry', icon: 'fas fa-snowflake', description: 'Flaky, tight feeling' },
        { value: 'combination', label: 'Combination', icon: 'fas fa-adjust', description: 'Oily T-zone, dry cheeks' },
        { value: 'normal', label: 'Normal', icon: 'fas fa-smile', description: 'Balanced, not too oily or dry' },
        { value: 'sensitive', label: 'Sensitive', icon: 'fas fa-heart-broken', description: 'Prone to redness, irritation' }
    ];

    // Skin concerns
    const concerns = [
        { value: 'acne', label: 'Acne & Breakouts', icon: 'fas fa-bug' },
        { value: 'redness', label: 'Redness', icon: 'fas fa-fire' },
        { value: 'aging', label: 'Fine Lines & Aging', icon: 'fas fa-clock' },
        { value: 'dark-spots', label: 'Dark Spots', icon: 'fas fa-dot-circle' },
        { value: 'dullness', label: 'Dullness', icon: 'fas fa-moon' }
    ];

    // Coverage options
    const coverages = [
        { value: 'sheer', label: 'Sheer', description: 'Light, natural look' },
        { value: 'medium', label: 'Medium', description: 'Buildable coverage' },
        { value: 'full', label: 'Full', description: 'Maximum coverage' }
    ];

    // Finish options
    const finishes = [
        { value: 'matte', label: 'Matte', icon: 'fas fa-chalkboard' },
        { value: 'dewy', label: 'Dewy', icon: 'fas fa-water' },
        { value: 'natural', label: 'Natural', icon: 'fas fa-leaf' }
    ];

    useEffect(() => {
        loadBeautyProducts();
    }, []);

    const loadBeautyProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getProducts(0, 50);
            if (response.success) {
                const allProducts = response.data.content || [];
                // Filter beauty products
                const beautyProducts = allProducts.filter(p => 
                    p.category === 'beauty' || 
                    p.category === 'makeup' ||
                    p.category === 'skincare'
                );
                setProducts(beautyProducts);
            }
        } catch (error) {
            console.error('Error loading beauty products:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRecommendations = () => {
        let filtered = [...products];
        
        if (selectedSkinType) {
            filtered = filtered.filter(p => 
                p.skinType?.includes(selectedSkinType) || 
                !p.skinType
            );
        }
        
        if (selectedConcern) {
            filtered = filtered.filter(p => 
                p.concerns?.includes(selectedConcern) ||
                !p.concerns
            );
        }
        
        if (selectedCoverage) {
            filtered = filtered.filter(p => 
                p.coverage === selectedCoverage ||
                !p.coverage
            );
        }
        
        if (selectedFinish) {
            filtered = filtered.filter(p => 
                p.finish === selectedFinish ||
                !p.finish
            );
        }
        
        setRecommendations(filtered);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target.result);
                analyzeSkinTone(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeSkinTone = (imageSrc) => {
        setIsDetecting(true);
        
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const centerX = Math.floor(img.width / 2);
            const centerY = Math.floor(img.height / 2);
            const sampleSize = 50;
            
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let x = centerX - sampleSize/2; x < centerX + sampleSize/2; x++) {
                for (let y = centerY - sampleSize/2; y < centerY + sampleSize/2; y++) {
                    if (x >= 0 && x < img.width && y >= 0 && y < img.height) {
                        const pixel = ctx.getImageData(x, y, 1, 1).data;
                        r += pixel[0];
                        g += pixel[1];
                        b += pixel[2];
                        count++;
                    }
                }
            }
            
            const avgR = r / count;
            const avgG = g / count;
            const avgB = b / count;
            const brightness = (avgR + avgG + avgB) / 3;
            
            let skinTone = '';
            if (brightness > 200) {
                skinTone = 'fair';
            } else if (brightness > 160) {
                skinTone = 'light';
            } else if (brightness > 120) {
                skinTone = 'medium';
            } else if (brightness > 80) {
                skinTone = 'tan';
            } else {
                skinTone = 'deep';
            }
            
            const isWarm = avgR > avgG && avgG > avgB;
            const isCool = avgB > avgG && avgG > avgR;
            
            let undertone = 'neutral';
            if (isWarm) undertone = 'warm';
            if (isCool) undertone = 'cool';
            
            setDetectedSkinTone(`${skinTone} (${undertone} undertone)`);
            
            const matches = products.filter(p => 
                (p.skinTone?.includes(skinTone) || !p.skinTone) &&
                (p.undertone === undertone || !p.undertone)
            );
            setFoundationMatches(matches);
            
            setIsDetecting(false);
        };
        img.src = imageSrc;
    };

    const resetDetection = () => {
        setUploadedImage(null);
        setDetectedSkinTone('');
        setFoundationMatches([]);
    };

    const formatPrice = (price) => `KSh ${(price || 0).toFixed(2)}`;

    return (
        <div className="beauty-page">
            {/* Hidden canvas for image analysis */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* Hero Section with Background Image */}
            <section className="beauty-hero">
                <div className="beauty-hero-overlay"></div>
                <div className="beauty-hero-content">
                    <h1>Beauty & Skincare</h1>
                    <p>Discover products personalized for your unique skin</p>
                </div>
            </section>

            {/* Tabs */}
            <div className="beauty-tabs">
                <button 
                    className={`tab-btn ${selectedTab === 'recommend' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('recommend')}
                >
                    <i className="fas fa-magic"></i>
                    Find Your Match
                </button>
                <button 
                    className={`tab-btn ${selectedTab === 'quiz' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('quiz')}
                >
                    <i className="fas fa-question-circle"></i>
                    Skin Quiz
                </button>
                <button 
                    className={`tab-btn ${selectedTab === 'shades' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('shades')}
                >
                    <i className="fas fa-palette"></i>
                    Shade Finder
                </button>
                <button 
                    className={`tab-btn ${selectedTab === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('all')}
                >
                    <i className="fas fa-grid"></i>
                    All Beauty
                </button>
            </div>

            {/* Rest of your component remains the same... */}
            {/* Find Your Match Tab */}
            {selectedTab === 'recommend' && (
                <div className="recommend-section">
                    {/* ... existing content ... */}
                    <div className="recommend-filters">
                        <div className="filter-group">
                            <h3>Skin Type</h3>
                            <div className="filter-options skin-type-grid">
                                {skinTypes.map(type => (
                                    <div 
                                        key={type.value}
                                        className={`filter-card ${selectedSkinType === type.value ? 'active' : ''}`}
                                        onClick={() => setSelectedSkinType(selectedSkinType === type.value ? '' : type.value)}
                                    >
                                        <i className={type.icon}></i>
                                        <span className="filter-label">{type.label}</span>
                                        <span className="filter-desc">{type.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3>Skin Concerns</h3>
                            <div className="filter-options concerns-grid">
                                {concerns.map(concern => (
                                    <div 
                                        key={concern.value}
                                        className={`filter-chip ${selectedConcern === concern.value ? 'active' : ''}`}
                                        onClick={() => setSelectedConcern(selectedConcern === concern.value ? '' : concern.value)}
                                    >
                                        <i className={concern.icon}></i>
                                        <span>{concern.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3>Coverage Preference</h3>
                            <div className="filter-options coverage-grid">
                                {coverages.map(coverage => (
                                    <div 
                                        key={coverage.value}
                                        className={`coverage-card ${selectedCoverage === coverage.value ? 'active' : ''}`}
                                        onClick={() => setSelectedCoverage(selectedCoverage === coverage.value ? '' : coverage.value)}
                                    >
                                        <span className="coverage-label">{coverage.label}</span>
                                        <span className="coverage-desc">{coverage.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3>Finish Type</h3>
                            <div className="filter-options finish-grid">
                                {finishes.map(finish => (
                                    <div 
                                        key={finish.value}
                                        className={`finish-card ${selectedFinish === finish.value ? 'active' : ''}`}
                                        onClick={() => setSelectedFinish(selectedFinish === finish.value ? '' : finish.value)}
                                    >
                                        <i className={finish.icon}></i>
                                        <span>{finish.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="get-recommendations-btn" onClick={getRecommendations}>
                            <i className="fas fa-magic"></i>
                            Get Recommendations
                        </button>
                    </div>

                    <div className="recommendations-results">
                        <h2>Recommended for You</h2>
                        {recommendations.length === 0 ? (
                            <div className="empty-state">
                                <i className="fas fa-magic"></i>
                                <p>Select your preferences to get personalized recommendations</p>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {recommendations.map(product => (
                                    <div key={product.id} className="product-card">
                                        <img src={product.images?.[0]} alt={product.name} />
                                        <div className="product-info">
                                            <h3>{product.name}</h3>
                                            <p className="product-price">{formatPrice(product.price)}</p>
                                            <Link to={`/product/${product.id}`} className="view-product-btn">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Skin Quiz Tab */}
            {selectedTab === 'quiz' && (
                <div className="quiz-section">
                    <div className="quiz-container">
                        <h2>Skin Quiz</h2>
                        <p>Answer a few questions to get personalized skincare recommendations</p>
                        
                        <div className="quiz-questions">
                            <div className="quiz-question">
                                <label>How does your skin feel 2 hours after washing?</label>
                                <div className="quiz-options">
                                    <button className="quiz-option">Oily all over</button>
                                    <button className="quiz-option">Dry and tight</button>
                                    <button className="quiz-option">Oily T-zone, dry cheeks</button>
                                    <button className="quiz-option">Comfortable and balanced</button>
                                </div>
                            </div>

                            <div className="quiz-question">
                                <label>What's your main skin concern?</label>
                                <div className="quiz-options">
                                    {concerns.map(concern => (
                                        <button key={concern.value} className="quiz-option">
                                            {concern.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="quiz-question">
                                <label>What foundation finish do you prefer?</label>
                                <div className="quiz-options">
                                    {finishes.map(finish => (
                                        <button key={finish.value} className="quiz-option">
                                            {finish.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button className="quiz-submit-btn">
                            Get My Results
                        </button>
                    </div>
                </div>
            )}

            {/* Shade Finder Tab */}
            {selectedTab === 'shades' && (
                <div className="shade-finder-section">
                    <div className="shade-finder-container">
                        <h2>Foundation Shade Finder</h2>
                        <p>Upload a selfie to find your perfect foundation match</p>
                        
                        <div className="shade-upload-area">
                            {!uploadedImage ? (
                                <div className="upload-placeholder" onClick={() => fileInputRef.current.click()}>
                                    <i className="fas fa-camera"></i>
                                    <p>Click to upload a photo</p>
                                    <span>Upload a clear selfie for best results</span>
                                </div>
                            ) : (
                                <div className="uploaded-image-container">
                                    <img src={uploadedImage} alt="Uploaded selfie" />
                                    <button className="remove-image" onClick={resetDetection}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        {isDetecting && (
                            <div className="detecting">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Analyzing your skin tone...</p>
                            </div>
                        )}

                        {detectedSkinTone && (
                            <div className="detection-result">
                                <h3>Detected Skin Tone</h3>
                                <div className="skin-tone-badge">{detectedSkinTone}</div>
                                <p className="recommendation-note">
                                    Based on your skin tone, here are foundations that may match you:
                                </p>
                                
                                <div className="foundation-matches">
                                    {foundationMatches.length > 0 ? (
                                        foundationMatches.map(product => (
                                            <div key={product.id} className="foundation-match-card">
                                                <img src={product.images?.[0]} alt={product.name} />
                                                <div className="match-info">
                                                    <h4>{product.name}</h4>
                                                    <p className="match-price">{formatPrice(product.price)}</p>
                                                    <Link to={`/product/${product.id}`} className="match-link">
                                                        View Product
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-matches">No matching foundations found in our collection yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* All Beauty Tab */}
            {selectedTab === 'all' && (
                <div className="all-beauty-section">
                    <div className="beauty-header">
                        <h2>All Beauty Products</h2>
                        <p>Discover our curated collection of beauty and skincare essentials</p>
                    </div>
                    
                    {loading ? (
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading products...</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map(product => (
                                <div key={product.id} className="product-card">
                                    <img src={product.images?.[0]} alt={product.name} />
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <p className="product-price">{formatPrice(product.price)}</p>
                                        <Link to={`/product/${product.id}`} className="view-product-btn">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <div className="empty-state">
                                    <i className="fas fa-palette"></i>
                                    <p>No beauty products available yet. Coming soon!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Floating Cart Icon */}
            <CartFloatingIcon />
        </div>
    );
}

export default Beauty;