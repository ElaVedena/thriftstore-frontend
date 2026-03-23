// pages/ShippingPolicy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../components/css/ShippingPolicy.css';

function ShippingPolicy() {
    return (
        <div className="shipping-policy-page">
            {/* Hero Section */}
            <section className="policy-hero">
                <h1>Shipping Policy</h1>
                <p>Everything you need to know about how we deliver your thrifted treasures</p>
            </section>

            <div className="policy-container">
                {/* Quick Summary Cards */}
                <div className="policy-summary">
                    <div className="summary-card">
                        <i className="fas fa-clock"></i>
                        <h3>Delivery Time</h3>
                        <p>2-5 business days</p>
                    </div>
                    <div className="summary-card">
                        <i className="fas fa-truck"></i>
                        <h3>Free Shipping</h3>
                        <p>Not available</p>
                    </div>
                    <div className="summary-card">
                        <i className="fas fa-map-marker-alt"></i>
                        <h3>Coverage</h3>
                        <p>Nationwide Kenya</p>
                    </div>
                    <div className="summary-card">
                        <i className="fas fa-clock"></i>
                        <h3>Cut-off Time</h3>
                        <p>Orders before 3PM ship same day</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="policy-content">
                    {/* Processing Time */}
                    <div className="policy-section">
                        <h2>Order Processing</h2>
                        <div className="policy-card">
                            <i className="fas fa-box"></i>
                            <div className="policy-text">
                                <h3>How long does it take to process my order?</h3>
                                <p>Orders are processed within 1-2 business days after payment confirmation. Orders placed before 3:00 PM EAT on weekdays are usually processed the same day. We do not process or ship orders on weekends or public holidays.</p>
                                <div className="highlight-box">
                                    <strong>Processing Time:</strong> 1-2 business days
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Methods */}
                    <div className="policy-section">
                        <h2>Shipping Methods & Delivery Times</h2>
                        <div className="shipping-table">
                            <div className="shipping-row header">
                                <span>Location</span>
                                <span>Standard Shipping</span>
                                <span>Express Shipping</span>
                            </div>
                            <div className="shipping-row">
                                <span>Nairobi</span>
                                <span>1-2 days (KSh 150)</span>
                                <span>Same day (KSh 350)</span>
                            </div>
                            <div className="shipping-row">
                                <span>Central Kenya</span>
                                <span>2-3 days (KSh 250)</span>
                                <span>1-2 days (KSh 450)</span>
                            </div>
                            <div className="shipping-row">
                                <span>Coast Region</span>
                                <span>3-4 days (KSh 300)</span>
                                <span>2-3 days (KSh 500)</span>
                            </div>
                            <div className="shipping-row">
                                <span>Western Kenya</span>
                                <span>3-5 days (KSh 300)</span>
                                <span>2-3 days (KSh 500)</span>
                            </div>
                            <div className="shipping-row">
                                <span>Rift Valley</span>
                                <span>2-4 days (KSh 250)</span>
                                <span>1-2 days (KSh 450)</span>
                            </div>
                        </div>

                        <div className="note-box">
                            <i className="fas fa-info-circle"></i>
                            <p>Delivery times are estimates and may vary due to weather, traffic, or other unforeseen circumstances. We'll keep you updated every step of the way!</p>
                        </div>
                    </div>

                    {/* Free Shipping - Simplified */}
                    <div className="policy-section">
                        <h2>Free Shipping</h2>
                        <div className="policy-card">
                            <i className="fas fa-gift"></i>
                            <div className="policy-text">
                                <h3>Free Shipping Policy</h3>
                                <p>Free shipping is currently not available. All orders are subject to standard shipping rates based on your location.</p>
                                <div className="highlight-box">
                                    <strong>Note:</strong> All shipping costs are calculated at checkout.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tracking */}
                    <div className="policy-section">
                        <h2>Order Tracking</h2>
                        <div className="policy-card">
                            <i className="fas fa-map-marker-alt"></i>
                            <div className="policy-text">
                                <h3>How to track your order</h3>
                                <p>Once your order ships, you'll receive:</p>
                                <ul>
                                    <li><i className="fas fa-check-circle"></i> Tracking number via SMS</li>
                                    <li><i className="fas fa-check-circle"></i> Email confirmation with tracking link</li>
                                    <li><i className="fas fa-check-circle"></i> Updates at every stage of delivery</li>
                                </ul>
                                <p>You can also track your order anytime in your <Link to="/orders">account dashboard</Link>.</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Partners */}
                    <div className="policy-section">
                        <h2>Our Shipping Partners</h2>
                        <div className="partners-grid">
                            <div className="partner-card">
                                <i className="fas fa-truck"></i>
                                <h4>Wells Fargo</h4>
                                <p>Nationwide coverage</p>
                            </div>
                            <div className="partner-card">
                                <i className="fas fa-truck"></i>
                                <h4>Aramex</h4>
                                <p>Express delivery</p>
                            </div>
                            <div className="partner-card">
                                <i className="fas fa-bicycle"></i>
                                <h4>Sendy</h4>
                                <p>Same-day Nairobi</p>
                            </div>
                            <div className="partner-card">
                                <i className="fas fa-motorcycle"></i>
                                <h4>Boda deliveries</h4>
                                <p>Last-mile delivery</p>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="policy-section">
                        <h2>Important Information</h2>
                        <div className="notes-grid">
                            <div className="note-item">
                                <i className="fas fa-map-pin"></i>
                                <h4>Address Accuracy</h4>
                                <p>Please ensure your shipping address is correct. We're not responsible for deliveries to wrong addresses provided by customers.</p>
                            </div>
                            <div className="note-item">
                                <i className="fas fa-phone-alt"></i>
                                <h4>Contact Information</h4>
                                <p>Keep your phone on during delivery. Our couriers may need to call you for directions or delivery arrangements.</p>
                            </div>
                            <div className="note-item">
                                <i className="fas fa-box-open"></i>
                                <h4>Package Inspection</h4>
                                <p>Inspect your package upon delivery. If damaged, note it with the courier and contact us immediately.</p>
                            </div>
                            <div className="note-item">
                                <i className="fas fa-clock"></i>
                                <h4>Delivery Attempts</h4>
                                <p>We make 3 delivery attempts. After that, the package returns to us and additional shipping fees may apply.</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Links */}
                    <div className="policy-section">
                        <div className="faq-prompt">
                            <i className="fas fa-question-circle"></i>
                            <p>Have more questions about shipping?</p>
                            <Link to="/faq" className="faq-link">Check our FAQ <i className="fas fa-arrow-right"></i></Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShippingPolicy;