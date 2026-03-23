// pages/FAQ.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/css/FAQ.css';

function FAQ() {
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (index) => {
        setOpenItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const faqCategories = [
        {
            category: "Orders & Shipping",
            icon: "fa-solid fa-truck",
            questions: [
                {
                    q: "How long does shipping take?",
                    a: "Shipping typically takes 2-5 business days within Kenya. We use trusted courier services to ensure your items arrive safely and promptly."
                },
                {
                    q: "Do you ship internationally?",
                    a: "Currently, we only ship within Kenya. We're working on expanding our shipping options to East Africa soon!"
                },
                {
                    q: "How can I track my order?",
                    a: "Once your order is shipped, you'll receive a tracking number via SMS and email. You can also track your order in your account dashboard under 'My Orders'."
                },
                {
                    q: "What are your shipping costs?",
                    a: "Shipping costs are calculated based on your location and order size. Standard shipping within Nairobi is KSh 150, while other regions range from KSh 250-500. Please note that we do not offer free shipping at this time."
                }
            ]
        },
        {
            category: "Returns & Refunds",
            icon: "fa-solid fa-rotate-left",
            questions: [
                {
                    q: "What is your return policy?",
                    a: "Due to the nature of thrifted items, we only accept returns if the item arrives damaged or in a condition different from what was shown on the website. Each item is carefully inspected before shipping to ensure accuracy."
                },
                {
                    q: "How do I report a damaged item?",
                    a: "If you receive a damaged item or an item that doesn't match the description, please contact us within 48 hours of delivery. Provide your order number and clear photos of the damage or discrepancy, and we'll assist you promptly."
                },
                {
                    q: "How long do refunds take?",
                    a: "Once your return is approved, refunds are processed within 3-5 business days. The money will be sent back to your M-PESA account. We'll notify you via email once the refund is complete."
                },
                {
                    q: "Can I exchange an item?",
                    a: "Unfortunately, we do not offer exchanges since each thrifted piece is unique and hard to replace. If you're unhappy with your purchase due to damage or misrepresentation, please follow our return process for a refund."
                }
            ]
        },
        {
            category: "Payment",
            icon: "fa-solid fa-mobile-alt",
            questions: [
                {
                    q: "What payment methods do you accept?",
                    a: "We accept M-PESA payments only. Simply select M-PESA at checkout and you'll receive a prompt on your phone to complete the payment."
                },
                {
                    q: "Is M-PESA payment secure?",
                    a: "Absolutely! All M-PESA transactions are encrypted and secure. We never store your payment details on our servers."
                },
                {
                    q: "What if my M-PESA payment fails?",
                    a: "If your payment fails, don't worry. Your order will be held for 30 minutes while you try again. You can also contact our support team for assistance."
                }
            ]
        },
        {
            category: "Products & Sizing",
            icon: "fa-solid fa-shirt",
            questions: [
                {
                    q: "How do I know my size?",
                    a: "Each product page has detailed measurements. We recommend measuring a similar item you own and comparing with our measurements. Since thrifted items vary by era and brand, please check the measurements carefully."
                },
                {
                    q: "Are the items really thrifted?",
                    a: "Yes! All our items are carefully curated from various sources. We inspect each piece for quality and authenticity before listing."
                },
                {
                    q: "How do you describe condition?",
                    a: "We use standard condition terms: 'New with tags', 'New without tags', 'Like New', 'Very Good', 'Good', and 'Fair'. Each item's description includes specific details about its condition, including any flaws."
                },
                {
                    q: "Can I request specific items?",
                    a: "Absolutely! Follow us on social media and send us a message with what you're looking for. We're always hunting for special pieces our customers want."
                }
            ]
        },
        {
            category: "Account & Reviews",
            icon: "fa-solid fa-user",
            questions: [
                {
                    q: "How do I create an account?",
                    a: "Click 'Login' at the top right, then select 'Register'. Fill in your details and you're all set! You can also checkout as a guest."
                },
                {
                    q: "How do I leave a review?",
                    a: "Once your order is delivered, you'll receive an email inviting you to review your purchases. You can also go to 'My Orders' and click 'Write a Review' on any delivered item."
                },
                {
                    q: "Can I edit or delete my review?",
                    a: "Yes! Go to the product page, find your review, and click the edit or delete buttons. You can only edit reviews within 30 days of posting."
                }
            ]
        }
    ];

    return (
        <div className="faq-page">
            {/* Hero Section */}
            <section className="faq-hero">
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about shopping at VedaThrifts</p>
            </section>

            {/* Search Bar */}
            <div className="faq-search-container">
                <div className="faq-search">
                    <i className="fas fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Search for answers..." 
                    />
                </div>
            </div>

            {/* FAQ Categories */}
            <div className="faq-container">
                {faqCategories.map((category, catIndex) => (
                    <div key={catIndex} className="faq-category">
                        <div className="category-header">
                            <i className={category.icon}></i>
                            <h2>{category.category}</h2>
                        </div>
                        
                        <div className="faq-items">
                            {category.questions.map((item, qIndex) => {
                                const uniqueIndex = `${catIndex}-${qIndex}`;
                                return (
                                    <div key={qIndex} className="faq-item">
                                        <button 
                                            className={`faq-question ${openItems[uniqueIndex] ? 'active' : ''}`}
                                            onClick={() => toggleItem(uniqueIndex)}
                                        >
                                            <span>{item.q}</span>
                                            <i className={`fas fa-chevron-${openItems[uniqueIndex] ? 'up' : 'down'}`}></i>
                                        </button>
                                        <div className={`faq-answer ${openItems[uniqueIndex] ? 'open' : ''}`}>
                                            <p>{item.a}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Still Have Questions Section */}
            <section className="faq-contact">
                <div className="contact-box">
                    <i className="fas fa-headset"></i>
                    <h2>Still Have Questions?</h2>
                    <p>Can't find the answer you're looking for? Please reach out to our friendly team.</p>
                    <div className="contact-options">
                        <Link to="/contact" className="contact-btn">
                            <i className="fas fa-envelope"></i>
                            Contact Us
                        </Link>
                        <a href="tel:+254700000000" className="contact-btn">
                            <i className="fas fa-phone-alt"></i>
                            Call Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FAQ;