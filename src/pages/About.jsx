import React from 'react';
import { Link } from 'react-router-dom';
import '../components/css/About.css';

import heroImage from '../assets/hero3.png';

function About() {
    return (
        <div className="about-page">
            {/* Mission Section */}
            <section className="mission-section">
                <div className="container">
                    <div className="mission-content">
                        <div className="mission-text">
                            <h2>Our Mission</h2>
                            <p>
                                At VedaThrifts, we're on a mission to make sustainable fashion accessible to everyone. 
                                We believe that style shouldn't cost the earth, and that pre-loved items deserve a second chance.
                            </p>
                            <div className="mission-highlights">
                                <div className="highlight">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Eco-friendly</span>
                                </div>
                                <div className="highlight">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Ethical sourcing</span>
                                </div>
                                <div className="highlight">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Community focused</span>
                                </div>
                            </div>
                            
                            {/* Shop Now Button */}
                            <div className="mission-cta">
                                <Link to="/shop" className="mission-shop-btn">
                                    Shop Now <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="mission-image">
                            <img src={heroImage} alt="Sustainable Fashion" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="container">
                    <h2>Why Choose Us?</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-leaf"></i>
                            </div>
                            <h3>Sustainable</h3>
                            <p>Every purchase helps reduce fashion waste and promotes circular economy.</p>
                            <div className="value-stats">-30% CO2</div>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-hand-holding-heart"></i>
                            </div>
                            <h3>Quality Assured</h3>
                            <p>We carefully curate and inspect every item to ensure the highest quality.</p>
                            <div className="value-stats">100% Inspected</div>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-tag"></i>
                            </div>
                            <h3>Affordable</h3>
                            <p>Great fashion doesn't have to break the bank. Find unique pieces at great prices.</p>
                            <div className="value-stats">Up to 70% Off</div>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-truck"></i>
                            </div>
                            <h3>Fast Delivery</h3>
                            <p>We ensure your thrifted treasures reach you quickly and safely.</p>
                            <div className="value-stats">2-3 Days</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Journey Timeline  */}
            <section className="journey-section">
                <div className="container">
                    <h2>Our Journey</h2>
                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <h3>2024</h3>
                                <p>The idea of VedaThrifts was born - a vision for sustainable fashion in Kenya</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <h3>2025</h3>
                                <p>VedaThrifts officially launched with our first collection of curated thrift items</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <h3>2026</h3>
                                <p>Growing community of 1000+ happy customers and 5000+ items sold</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section">
                <div className="container">
                    <h2>What Our Customers Say</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <i className="fas fa-quote-left"></i>
                            <p>"Amazing quality and fast shipping! Found the perfect vintage dress."</p>
                            <div className="testimonial-author">
                                <strong>Sarah M.</strong>
                                <div className="stars">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <i className="fas fa-quote-left"></i>
                            <p>"Love the sustainable approach. Great prices and unique pieces!"</p>
                            <div className="testimonial-author">
                                <strong>James K.</strong>
                                <div className="stars">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <i className="fas fa-quote-left"></i>
                            <p>"Customer service is excellent. Will definitely shop again!"</p>
                            <div className="testimonial-author">
                                <strong>Mary W.</strong>
                                <div className="stars">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default About;