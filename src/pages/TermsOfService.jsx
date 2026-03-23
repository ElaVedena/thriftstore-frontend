// pages/TermsOfService.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../components/css/TermsOfService.css';

function TermsOfService() {
    const lastUpdated = "March 15, 2026";

    return (
        <div className="terms-page">
            {/* Hero Section */}
            <section className="terms-hero">
                <h1>Terms of Service</h1>
                <p>Please read these terms carefully before using VedaThrifts</p>
                <div className="last-updated">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Last Updated: {lastUpdated}</span>
                </div>
            </section>

            <div className="terms-container">
                {/* Quick Navigation */}
                <div className="terms-nav">
                    <h3>Quick Navigation</h3>
                    <ul>
                        <li><a href="#agreement">1. Agreement to Terms</a></li>
                        <li><a href="#eligibility">2. Eligibility</a></li>
                        <li><a href="#account">3. Account Registration</a></li>
                        <li><a href="#products">4. Products & Pricing</a></li>
                        <li><a href="#orders">5. Orders & Payments</a></li>
                        <li><a href="#shipping">6. Shipping & Delivery</a></li>
                        <li><a href="#returns">7. Returns & Refunds</a></li>
                        <li><a href="#conduct">8. User Conduct</a></li>
                        <li><a href="#intellectual">9. Intellectual Property</a></li>
                        <li><a href="#privacy">10. Privacy Policy</a></li>
                        <li><a href="#limitation">11. Limitation of Liability</a></li>
                        <li><a href="#changes">12. Changes to Terms</a></li>
                        <li><a href="#contact">13. Contact Us</a></li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="terms-content">
                    {/* Agreement Section */}
                    <section id="agreement" className="terms-section">
                        <h2>1. Agreement to Terms</h2>
                        <div className="terms-card">
                            <p>By accessing or using the VedaThrifts website, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services.</p>
                            <div className="highlight-box">
                                <i className="fas fa-gavel"></i>
                                <p>These terms constitute a legally binding agreement between you and VedaThrifts regarding your use of our platform and services.</p>
                            </div>
                        </div>
                    </section>

                    {/* Eligibility Section */}
                    <section id="eligibility" className="terms-section">
                        <h2>2. Eligibility</h2>
                        <div className="terms-card">
                            <p>To use our services, you must:</p>
                            <ul className="terms-list">
                                <li><i className="fas fa-check-circle"></i> Be at least 18 years of age or have parental consent</li>
                                <li><i className="fas fa-check-circle"></i> Have the legal capacity to enter into binding contracts</li>
                                <li><i className="fas fa-check-circle"></i> Reside in Kenya (for shipping purposes)</li>
                                <li><i className="fas fa-check-circle"></i> Provide accurate and complete information</li>
                            </ul>
                        </div>
                    </section>

                    {/* Account Registration */}
                    <section id="account" className="terms-section">
                        <h2>3. Account Registration</h2>
                        <div className="terms-card">
                            <p>When you create an account with us, you agree to:</p>
                            <div className="grid-2">
                                <div className="term-item">
                                    <i className="fas fa-user"></i>
                                    <h4>Accurate Information</h4>
                                    <p>Provide true, accurate, and complete information about yourself</p>
                                </div>
                                <div className="term-item">
                                    <i className="fas fa-lock"></i>
                                    <h4>Account Security</h4>
                                    <p>Maintain the security of your password and account</p>
                                </div>
                                <div className="term-item">
                                    <i className="fas fa-bell"></i>
                                    <h4>Notifications</h4>
                                    <p>Accept responsibility for all activities under your account</p>
                                </div>
                                <div className="term-item">
                                    <i className="fas fa-undo"></i>
                                    <h4>Updates</h4>
                                    <p>Promptly update your information if it changes</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Products & Pricing */}
                    <section id="products" className="terms-section">
                        <h2>4. Products & Pricing</h2>
                        <div className="terms-card">
                            <p>All products listed on VedaThrifts are subject to:</p>
                            <div className="products-grid">
                                <div className="product-term">
                                    <i className="fas fa-tag"></i>
                                    <h4>Pricing</h4>
                                    <p>Prices are in Kenyan Shillings (KSh) and include VAT where applicable</p>
                                </div>
                                <div className="product-term">
                                    <i className="fas fa-eye"></i>
                                    <h4>Descriptions</h4>
                                    <p>We strive for accuracy but cannot guarantee that all descriptions are error-free</p>
                                </div>
                                <div className="product-term">
                                    <i className="fas fa-hourglass"></i>
                                    <h4>Availability</h4>
                                    <p>Products are subject to availability and may be discontinued without notice</p>
                                </div>
                                <div className="product-term">
                                    <i className="fas fa-balance-scale"></i>
                                    <h4>Condition</h4>
                                    <p>Items are sold as described with clear indication of their thrifted condition</p>
                                </div>
                            </div>
                            <div className="warning-box">
                                <i className="fas fa-exclamation-triangle"></i>
                                <p>We reserve the right to correct any pricing errors and to change or update information at any time without prior notice.</p>
                            </div>
                        </div>
                    </section>

                    {/* Orders & Payments */}
                    <section id="orders" className="terms-section">
                        <h2>5. Orders & Payments</h2>
                        <div className="terms-card">
                            <h3>Order Acceptance</h3>
                            <p>When you place an order, you'll receive an acknowledgment email. This does not constitute acceptance of your order. We reserve the right to refuse or cancel any order for reasons including but not limited to:</p>
                            <ul className="terms-list">
                                <li><i className="fas fa-circle"></i> Product unavailability</li>
                                <li><i className="fas fa-circle"></i> Pricing errors</li>
                                <li><i className="fas fa-circle"></i> Suspicious or fraudulent activity</li>
                                <li><i className="fas fa-circle"></i> Inaccurate payment information</li>
                            </ul>

                            <h3>Payment Terms</h3>
                            <div className="payment-terms">
                                <div className="payment-method-term">
                                    <i className="fas fa-mobile-alt mpesa-icon"></i>
                                    <div>
                                        <h4>M-PESA</h4>
                                        <p>Full payment is required at checkout. Orders are processed only after payment confirmation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Shipping & Delivery - Updated */}
                    <section id="shipping" className="terms-section">
                        <h2>6. Shipping & Delivery</h2>
                        <div className="terms-card">
                            <p>Shipping and delivery are subject to our <Link to="/shipping-policy">Shipping Policy</Link>. Key terms include:</p>
                            <ul className="terms-list">
                                <li><i className="fas fa-check"></i> Free shipping is not available at this time</li>
                                <li><i className="fas fa-check"></i> Shipping costs are calculated at checkout based on your location</li>
                                <li><i className="fas fa-check"></i> Delivery times are estimates (2-5 business days), not guarantees</li>
                                <li><i className="fas fa-check"></i> You're responsible for providing accurate delivery information</li>
                                <li><i className="fas fa-check"></i> Risk of loss passes to you upon delivery</li>
                                <li><i className="fas fa-check"></i> Undeliverable packages may incur additional fees</li>
                            </ul>
                        </div>
                    </section>

                    {/* Returns & Refunds - Updated */}
                    <section id="returns" className="terms-section">
                        <h2>7. Returns & Refunds</h2>
                        <div className="terms-card">
                            <p>Due to the unique nature of thrifted items, our return policy is as follows:</p>
                            <div className="returns-grid">
                                <div className="return-item">
                                    <i className="fas fa-box-open"></i>
                                    <p>Returns only accepted for damaged items or items that don't match description</p>
                                </div>
                                <div className="return-item">
                                    <i className="fas fa-clock"></i>
                                    <p>48 hours to report issues after delivery</p>
                                </div>
                                <div className="return-item">
                                    <i className="fas fa-undo"></i>
                                    <p>No exchanges - each item is unique</p>
                                </div>
                                <div className="return-item">
                                    <i className="fas fa-clock"></i>
                                    <p>3-5 business days for refund processing</p>
                                </div>
                                <div className="return-item">
                                    <i className="fas fa-mobile-alt"></i>
                                    <p>Refunds to M-PESA only</p>
                                </div>
                            </div>
                            <div className="highlight-box warning">
                                <i className="fas fa-exclamation-triangle"></i>
                                <p>Returns are only accepted if the item arrives damaged or in a condition different from what was shown on the website. Please inspect your items upon delivery and report any issues within 48 hours with clear photos.</p>
                            </div>
                        </div>
                    </section>

                    {/* User Conduct */}
                    <section id="conduct" className="terms-section">
                        <h2>8. User Conduct</h2>
                        <div className="terms-card">
                            <p>You agree not to use our platform to:</p>
                            <div className="conduct-grid">
                                <div className="conduct-item">
                                    <i className="fas fa-ban"></i>
                                    <span>Violate any laws or regulations</span>
                                </div>
                                <div className="conduct-item">
                                    <i className="fas fa-ban"></i>
                                    <span>Infringe on intellectual property rights</span>
                                </div>
                                <div className="conduct-item">
                                    <i className="fas fa-ban"></i>
                                    <span>Transmit harmful code or malware</span>
                                </div>
                                <div className="conduct-item">
                                    <i className="fas fa-ban"></i>
                                    <span>Harvest user information without consent</span>
                                </div>
                                <div className="conduct-item">
                                    <i className="fas fa-ban"></i>
                                    <span>Interfere with website operations</span>
                                </div>
                                <div className="conduct-item">
                                    <i className="fas fa-ban"></i>
                                    <span>Post false or misleading information</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section id="intellectual" className="terms-section">
                        <h2>9. Intellectual Property</h2>
                        <div className="terms-card">
                            <p>All content on VedaThrifts, including but not limited to:</p>
                            <ul className="terms-list">
                                <li><i className="fas fa-copyright"></i> Logo, brand name, and trademarks</li>
                                <li><i className="fas fa-copyright"></i> Product images and descriptions</li>
                                <li><i className="fas fa-copyright"></i> Website design and layout</li>
                                <li><i className="fas fa-copyright"></i> User-generated content (with license)</li>
                            </ul>
                            <p>are the property of VedaThrifts and protected by Kenyan and international copyright laws.</p>
                        </div>
                    </section>

                    {/* Privacy Policy */}
                    <section id="privacy" className="terms-section">
                        <h2>10. Privacy Policy</h2>
                        <div className="terms-card">
                            <p>Your use of VedaThrifts is also governed by our <Link to="/privacy">Privacy Policy</Link>, which explains how we collect, use, and protect your personal information.</p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section id="limitation" className="terms-section">
                        <h2>11. Limitation of Liability</h2>
                        <div className="terms-card">
                            <p>To the fullest extent permitted by law:</p>
                            <ul className="terms-list">
                                <li><i className="fas fa-times-circle"></i> VedaThrifts shall not be liable for any indirect, incidental, or consequential damages</li>
                                <li><i className="fas fa-times-circle"></i> Our total liability shall not exceed the amount you paid for the products</li>
                                <li><i className="fas fa-times-circle"></i> We are not responsible for third-party actions or services</li>
                            </ul>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section id="changes" className="terms-section">
                        <h2>12. Changes to Terms</h2>
                        <div className="terms-card">
                            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of VedaThrifts constitutes acceptance of the modified terms.</p>
                            <div className="update-notice">
                                <i className="fas fa-bell"></i>
                                <p>Check this page regularly for updates. Last updated: {lastUpdated}</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Us */}
                    <section id="contact" className="terms-section">
                        <h2>13. Contact Us</h2>
                        <div className="terms-card">
                            <p>If you have any questions about these Terms of Service, please contact us:</p>
                            <div className="contact-details">
                                <div className="contact-method">
                                    <i className="fas fa-envelope"></i>
                                    <a href="mailto:legal@vedathrifts.com">legal@vedathrifts.com</a>
                                </div>
                                <div className="contact-method">
                                    <i className="fas fa-phone-alt"></i>
                                    <a href="tel:+254700000000">+254 700 000 000</a>
                                </div>
                                <div className="contact-method">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <address>123 Thrift Street, Nairobi, Kenya</address>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TermsOfService;