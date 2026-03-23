// pages/PrivacyPolicy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../components/css/PrivacyPolicy.css';

function PrivacyPolicy() {
    const lastUpdated = "March 15, 2026";

    return (
        <div className="privacy-page">
            {/* Hero Section */}
            <section className="privacy-hero">
                <h1>Privacy Policy</h1>
                <p>How we collect, use, and protect your personal information</p>
                <div className="last-updated">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Last Updated: {lastUpdated}</span>
                </div>
            </section>

            <div className="privacy-container">
                {/* Quick Navigation */}
                <div className="privacy-nav">
                    <h3>Quick Navigation</h3>
                    <ul>
                        <li><a href="#introduction">1. Introduction</a></li>
                        <li><a href="#information">2. Information We Collect</a></li>
                        <li><a href="#use">3. How We Use Your Information</a></li>
                        <li><a href="#sharing">4. Information Sharing</a></li>
                        <li><a href="#security">5. Data Security</a></li>
                        <li><a href="#cookies">6. Cookies & Tracking</a></li>
                        <li><a href="#rights">7. Your Rights</a></li>
                        <li><a href="#children">8. Children's Privacy</a></li>
                        <li><a href="#retention">9. Data Retention</a></li>
                        <li><a href="#changes">10. Changes to Policy</a></li>
                        <li><a href="#contact">11. Contact Us</a></li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="privacy-content">
                    {/* Introduction */}
                    <section id="introduction" className="privacy-section">
                        <h2>1. Introduction</h2>
                        <div className="privacy-card">
                            <p>At VedaThrifts, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.</p>
                            <div className="highlight-box">
                                <i className="fas fa-shield-alt"></i>
                                <p>By using VedaThrifts, you consent to the practices described in this policy.</p>
                            </div>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section id="information" className="privacy-section">
                        <h2>2. Information We Collect</h2>
                        <div className="privacy-card">
                            <h3>Personal Information</h3>
                            <p>When you use our services, we may collect:</p>
                            
                            <div className="info-grid">
                                <div className="info-item">
                                    <i className="fas fa-user"></i>
                                    <h4>Identity Information</h4>
                                    <ul>
                                        <li>Name</li>
                                        <li>Date of birth</li>
                                        <li>ID/Passport number</li>
                                    </ul>
                                </div>
                                <div className="info-item">
                                    <i className="fas fa-envelope"></i>
                                    <h4>Contact Information</h4>
                                    <ul>
                                        <li>Email address</li>
                                        <li>Phone number</li>
                                        <li>Shipping address</li>
                                    </ul>
                                </div>
                                <div className="info-item">
                                    <i className="fas fa-mobile-alt"></i>
                                    <h4>Payment Information</h4>
                                    <ul>
                                        <li>M-PESA transaction ID</li>
                                        <li>Payment history</li>
                                        <li>Billing details</li>
                                    </ul>
                                </div>
                                <div className="info-item">
                                    <i className="fas fa-history"></i>
                                    <h4>Transaction Data</h4>
                                    <ul>
                                        <li>Order history</li>
                                        <li>Items purchased</li>
                                        <li>Return records</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="note-box">
                                <i className="fas fa-info-circle"></i>
                                <p><strong>Note:</strong> We do NOT store your M-PESA PIN or full payment credentials. All payment processing is handled securely through Safaricom's M-PESA API.</p>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section id="use" className="privacy-section">
                        <h2>3. How We Use Your Information</h2>
                        <div className="privacy-card">
                            <p>We use your information for the following purposes:</p>
                            
                            <div className="usage-timeline">
                                <div className="usage-item">
                                    <div className="usage-icon">
                                        <i className="fas fa-shopping-cart"></i>
                                    </div>
                                    <div className="usage-content">
                                        <h4>Order Processing</h4>
                                        <p>To process and fulfill your orders, including sending confirmations and updates</p>
                                    </div>
                                </div>
                                <div className="usage-item">
                                    <div className="usage-icon">
                                        <i className="fas fa-comments"></i>
                                    </div>
                                    <div className="usage-content">
                                        <h4>Customer Support</h4>
                                        <p>To respond to your inquiries and provide assistance</p>
                                    </div>
                                </div>
                                <div className="usage-item">
                                    <div className="usage-icon">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <div className="usage-content">
                                        <h4>Improve Services</h4>
                                        <p>To analyze usage patterns and enhance your shopping experience</p>
                                    </div>
                                </div>
                                <div className="usage-item">
                                    <div className="usage-icon">
                                        <i className="fas fa-shield-alt"></i>
                                    </div>
                                    <div className="usage-content">
                                        <h4>Security</h4>
                                        <p>To protect against fraud and unauthorized transactions</p>
                                    </div>
                                </div>
                                <div className="usage-item">
                                    <div className="usage-icon">
                                        <i className="fas fa-bullhorn"></i>
                                    </div>
                                    <div className="usage-content">
                                        <h4>Marketing</h4>
                                        <p>To send you promotional offers (with your consent)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="legal-basis">
                                <h4>Legal Basis for Processing</h4>
                                <p>We process your information based on:</p>
                                <ul>
                                    <li><i className="fas fa-check-circle"></i> Contract fulfillment (to process your orders)</li>
                                    <li><i className="fas fa-check-circle"></i> Legal obligations (to comply with tax and record-keeping laws)</li>
                                    <li><i className="fas fa-check-circle"></i> Legitimate interests (to improve our services)</li>
                                    <li><i className="fas fa-check-circle"></i> Your consent (for marketing communications)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section id="sharing" className="privacy-section">
                        <h2>4. Information Sharing</h2>
                        <div className="privacy-card">
                            <p>We may share your information with:</p>
                            
                            <div className="sharing-grid">
                                <div className="sharing-item">
                                    <i className="fas fa-truck"></i>
                                    <h4>Delivery Partners</h4>
                                    <p>To ship your orders (name, address, phone)</p>
                                </div>
                                <div className="sharing-item">
                                    <i className="fas fa-credit-card"></i>
                                    <h4>Payment Processors</h4>
                                    <p>Safaricom M-PESA for payment processing</p>
                                </div>
                                <div className="sharing-item">
                                    <i className="fas fa-cloud"></i>
                                    <h4>Cloud Services</h4>
                                    <p>To host our website and data (secure servers)</p>
                                </div>
                                <div className="sharing-item">
                                    <i className="fas fa-gavel"></i>
                                    <h4>Legal Authorities</h4>
                                    <p>When required by law or to protect rights</p>
                                </div>
                            </div>

                            <div className="important-box">
                                <i className="fas fa-handshake"></i>
                                <div>
                                    <h4>We Do NOT:</h4>
                                    <ul>
                                        <li>Sell your personal information to third parties</li>
                                        <li>Share your data for advertising purposes without consent</li>
                                        <li>Retain payment credentials</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section id="security" className="privacy-section">
                        <h2>5. Data Security</h2>
                        <div className="privacy-card">
                            <p>We implement various security measures to protect your information:</p>
                            
                            <div className="security-badges">
                                <div className="security-badge">
                                    <i className="fas fa-lock"></i>
                                    <span>256-bit SSL Encryption</span>
                                </div>
                                <div className="security-badge">
                                    <i className="fas fa-shield-virus"></i>
                                    <span>Firewall Protection</span>
                                </div>
                                <div className="security-badge">
                                    <i className="fas fa-key"></i>
                                    <span>Secure Authentication</span>
                                </div>
                                <div className="security-badge">
                                    <i className="fas fa-user-secret"></i>
                                    <span>Regular Security Audits</span>
                                </div>
                            </div>

                            <p className="security-note">While we strive to protect your data, no method of transmission over the Internet is 100% secure. We encourage you to take precautions to protect your personal information.</p>
                        </div>
                    </section>

                    {/* Cookies & Tracking */}
                    <section id="cookies" className="privacy-section">
                        <h2>6. Cookies & Tracking</h2>
                        <div className="privacy-card">
                            <p>We use cookies and similar technologies to enhance your experience:</p>
                            
                            <div className="cookies-table">
                                <div className="cookie-row header">
                                    <span>Type</span>
                                    <span>Purpose</span>
                                    <span>Duration</span>
                                </div>
                                <div className="cookie-row">
                                    <span>Essential</span>
                                    <span>Shopping cart, login session</span>
                                    <span>Session</span>
                                </div>
                                <div className="cookie-row">
                                    <span>Functional</span>
                                    <span>Remember preferences</span>
                                    <span>1 year</span>
                                </div>
                                <div className="cookie-row">
                                    <span>Analytics</span>
                                    <span>Site usage, improvements</span>
                                    <span>2 years</span>
                                </div>
                                <div className="cookie-row">
                                    <span>Marketing</span>
                                    <span>Personalized offers (opt-in)</span>
                                    <span>1 year</span>
                                </div>
                            </div>

                            <p className="cookie-control">You can control cookies through your browser settings. Disabling cookies may affect site functionality.</p>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section id="rights" className="privacy-section">
                        <h2>7. Your Rights</h2>
                        <div className="privacy-card">
                            <p>Under Kenyan data protection law, you have the following rights:</p>
                            
                            <div className="rights-grid">
                                <div className="right-item">
                                    <i className="fas fa-eye"></i>
                                    <h4>Right to Access</h4>
                                    <p>Request a copy of your personal data</p>
                                </div>
                                <div className="right-item">
                                    <i className="fas fa-pencil-alt"></i>
                                    <h4>Right to Rectification</h4>
                                    <p>Correct inaccurate information</p>
                                </div>
                                <div className="right-item">
                                    <i className="fas fa-trash"></i>
                                    <h4>Right to Erasure</h4>
                                    <p>Request deletion of your data</p>
                                </div>
                                <div className="right-item">
                                    <i className="fas fa-ban"></i>
                                    <h4>Right to Restrict</h4>
                                    <p>Limit how we use your data</p>
                                </div>
                                <div className="right-item">
                                    <i className="fas fa-download"></i>
                                    <h4>Right to Portability</h4>
                                    <p>Receive your data in a portable format</p>
                                </div>
                                <div className="right-item">
                                    <i className="fas fa-times-circle"></i>
                                    <h4>Right to Object</h4>
                                    <p>Opt out of marketing communications</p>
                                </div>
                            </div>

                            <div className="action-box">
                                <p>To exercise any of these rights, please <Link to="/contact">contact us</Link>.</p>
                            </div>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section id="children" className="privacy-section">
                        <h2>8. Children's Privacy</h2>
                        <div className="privacy-card">
                            <p>VedaThrifts is not intended for children under 13. We do not knowingly collect information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.</p>
                        </div>
                    </section>

                    {/* Data Retention */}
                    <section id="retention" className="privacy-section">
                        <h2>9. Data Retention</h2>
                        <div className="privacy-card">
                            <p>We retain your information for as long as necessary to:</p>
                            <ul className="retention-list">
                                <li><i className="fas fa-clock"></i> Fulfill the purposes outlined in this policy</li>
                                <li><i className="fas fa-clock"></i> Comply with legal obligations (tax records: 5 years)</li>
                                <li><i className="fas fa-clock"></i> Resolve disputes and enforce agreements</li>
                            </ul>
                            <p>You may request deletion of your account and data at any time.</p>
                        </div>
                    </section>

                    {/* Changes to Policy */}
                    <section id="changes" className="privacy-section">
                        <h2>10. Changes to Privacy Policy</h2>
                        <div className="privacy-card">
                            <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date.</p>
                            <div className="update-notice">
                                <i className="fas fa-bell"></i>
                                <p>We encourage you to review this policy regularly to stay informed about how we protect your information.</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Us */}
                    <section id="contact" className="privacy-section">
                        <h2>11. Contact Us</h2>
                        <div className="privacy-card">
                            <p>If you have questions about this Privacy Policy or our data practices:</p>
                            
                            <div className="contact-details">
                                <div className="contact-method">
                                    <i className="fas fa-envelope"></i>
                                    <div>
                                        <strong>Email:</strong>
                                        <a href="mailto:privacy@vedathrifts.com">privacy@vedathrifts.com</a>
                                    </div>
                                </div>
                                <div className="contact-method">
                                    <i className="fas fa-phone-alt"></i>
                                    <div>
                                        <strong>Phone:</strong>
                                        <a href="tel:+254700000000">+254 700 000 000</a>
                                    </div>
                                </div>
                                <div className="contact-method">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <strong>Address:</strong>
                                        <address>123 Thrift Street, Nairobi, Kenya</address>
                                    </div>
                                </div>
                                <div className="contact-method">
                                    <i className="fas fa-clock"></i>
                                    <div>
                                        <strong>Response Time:</strong>
                                        <span>Within 48 hours</span>
                                    </div>
                                </div>
                            </div>

                            <div className="data-officer">
                                <i className="fas fa-user-shield"></i>
                                <div>
                                    <h4>Data Protection Officer</h4>
                                    <p>For formal data protection inquiries: <a href="mailto:dpo@vedathrifts.com">dpo@vedathrifts.com</a></p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;