import React, { useState } from 'react';
import { contactService } from '../services/contactService';
import { useNotification } from '../hooks/useNotification';
import '../components/css/Contact.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const { showSuccess, showError } = useNotification();

    const validateForm = () => {
        const errors = {};
        
        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        } else if (formData.name.trim().length > 100) {
            errors.name = 'Name must be less than 100 characters';
        }
        
        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Please enter a valid email address (e.g., name@example.com)';
        }
        
        // Message validation
        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            errors.message = `Message must be at least 10 characters (currently ${formData.message.trim().length})`;
        } else if (formData.message.trim().length > 1000) {
            errors.message = 'Message must be less than 1000 characters';
        }
        
        setValidationErrors(errors);
        
        console.log('Validation errors:', errors);
        console.log('Form data:', formData);
        
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('Submitting form with data:', formData);
        
        if (!validateForm()) {
            showError('Please fix the errors in the form');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const cleanedData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                message: formData.message.trim()
            };
            
            console.log('Sending cleaned data:', cleanedData);
            
            const response = await contactService.sendMessage(cleanedData);
            
            if (response.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });
                setValidationErrors({});
                showSuccess(response.message || 'Message sent successfully!');
                setTimeout(() => setSubmitStatus(null), 5000);
            } else {
                setSubmitStatus('error');
                showError(response.message || 'Failed to send message. Please try again.');
                setTimeout(() => setSubmitStatus(null), 5000);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setSubmitStatus('error');
            showError('An error occurred. Please try again later.');
            setTimeout(() => setSubmitStatus(null), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <div className="contact-hero">
                <div className="hero-content">
                    <span className="hero-badge">Get in Touch</span>
                    <h1>Let's Create Something <span>Amazing</span> Together</h1>
                    <p>Have a question, idea, or just want to say hello? We're all ears!</p>
                </div>
            </div>

            <div className="contact-container">
                {/* Fun Quote Section */}
                <div className="quote-section">
                    <div className="quote-bubble">
                        <i className="fas fa-quote-left"></i>
                        <p>Every thrifted piece has a story. We'd love to hear yours!</p>
                        <div className="quote-author">— The VedaThrifts Team</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="contact-grid">
                    {/* Left Side - Fun Info Cards */}
                    <div className="contact-fun-side">
                        <div className="fun-card floating">
                            <div className="fun-icon">
                                <i className="fas fa-comment-dots"></i>
                            </div>
                            <h3>Quick Response</h3>
                            <p>We reply within 24 hours, usually much faster! Our team is always ready to help.</p>
                            <div className="fun-stats">
                                <span>⭐ 98% customer satisfaction</span>
                            </div>
                        </div>

                        <div className="fun-card floating delay-1">
                            <div className="fun-icon">
                                <i className="fas fa-heart"></i>
                            </div>
                            <h3>Love What You Do</h3>
                            <p>We're passionate about sustainable fashion and helping you find your perfect style.</p>
                            <div className="fun-stats">
                                <span>❤️ 5000+ happy thrifters</span>
                            </div>
                        </div>

                        <div className="fun-card floating delay-2">
                            <div className="fun-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3>Always Here</h3>
                            <p>Whether it's styling advice or order help, we're just a message away.</p>
                            <div className="fun-stats">
                                <span>📞 24/7 Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Contact Form */}
                    <div className="contact-form-wrapper">
                        <div className="form-header">
                            <h2>Send us a Message</h2>
                            <p>We'd love to hear from you! Fill out the form and we'll get back to you soon.</p>
                        </div>
                        
                        {submitStatus === 'success' && (
                            <div className="alert-fun success">
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <strong>Message sent!</strong>
                                    <p>Thanks for reaching out. We'll get back to you soon!</p>
                                </div>
                            </div>
                        )}
                        
                        {submitStatus === 'error' && (
                            <div className="alert-fun error">
                                <i className="fas fa-exclamation-circle"></i>
                                <div>
                                    <strong>Oops!</strong>
                                    <p>Something went wrong. Please try again.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="fun-form">
                            <div className="input-group">
                                <i className="fas fa-user input-icon"></i>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your name (minimum 2 characters)"
                                    className={validationErrors.name ? 'error' : ''}
                                />
                                {validationErrors.name && (
                                    <span className="validation-error">{validationErrors.name}</span>
                                )}
                            </div>

                            <div className="input-group">
                                <i className="fas fa-envelope input-icon"></i>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your email (e.g., name@example.com)"
                                    className={validationErrors.email ? 'error' : ''}
                                />
                                {validationErrors.email && (
                                    <span className="validation-error">{validationErrors.email}</span>
                                )}
                            </div>

                            <div className="input-group">
                                <i className="fas fa-comment input-icon"></i>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Your message (minimum 10 characters)"
                                    className={validationErrors.message ? 'error' : ''}
                                ></textarea>
                                {validationErrors.message && (
                                    <span className="validation-error">{validationErrors.message}</span>
                                )}
                            </div>

                            <button type="submit" className="submit-fun-btn" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span>Send Message</span>
                                        <i className="fas fa-paper-plane"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="form-footer">
                            <p>Or reach us directly at <strong>hello@vedathrifts.com</strong></p>
                            <div className="social-fun">
                                <a href="https://www.facebook.com/share/1FwRLUUYSV/" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://www.instagram.com/vashvedena?igsh=MWV5ajRoZGZsajNyYw==" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="https://www.tiktok.com/@elavedena?_r=1&_t=ZS-93xifmcPOFu" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-tiktok"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info Bar */}
                <div className="contact-info-bar">
                    <div className="info-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <div>
                            <h4>Visit Us</h4>
                            <p>123 Thrift Street, Nairobi, Kenya</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-phone-alt"></i>
                        <div>
                            <h4>Call Us</h4>
                            <p>+254 716 139 821</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <i className="fas fa-clock"></i>
                        <div>
                            <h4>Store Hours</h4>
                            <p>Mon - Sat: 9am - 6pm</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;