import { useState } from 'react';
import '../../../components/css/ProductDescription.css'; 


function ProductDescription({ description, details }) {
    const [activeTab, setActiveTab] = useState('description');

    return (
        <div className="product-description">
            <div className="description-tabs">
                <button
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                >
                    Description
                </button>
                <button
                    className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Additional Information
                </button>
                <button
                    className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shipping')}
                >
                    Shipping & Returns
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'description' && (
                    <div className="description-content">
                        <p>{description}</p>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="details-content">
                        <ul className="details-list">
                            {details.map((detail, index) => (
                                <li key={index}>
                                    <i className="fas fa-check"></i>
                                    <span>{detail}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'shipping' && (
                    <div className="shipping-content">
                        <h4>Shipping Information</h4>
                        <p>Shipping cost on orders will display after you select the destination. Standard shipping takes 3-5 business days.</p>
                        <h4>Returns</h4>
                        <p>Return policy is for items that were shipped in bad condition only. Items must be unworn and in original condition.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDescription;