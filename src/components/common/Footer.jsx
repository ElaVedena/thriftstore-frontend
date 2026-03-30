import {Link} from 'react-router-dom';
import '../../components/css/footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Column 1: Shop */}
                <div className="footer-section">
                    <h3>Shop</h3>
                    <ul>
                        <li><Link to="/shop">All Products</Link></li>
                        <li><Link to="/shop?category=men">Men</Link></li>
                        <li><Link to="/shop?category=women">Women</Link></li>
                        <li><Link to="/shop?category=accessories">Accessories</Link></li>
                        <li><Link to="/shop?category=new-arrivals">New Arrivals</Link></li>
                    </ul>
                </div>
                
                {/* Column 2: Support & Legal */}
                <div className="footer-section">
                    <h3>Support</h3>
                    <ul>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                    </ul>
                    
                    <h3 className="legal-heading">Legal</h3>
                    <ul>
                        <li><Link to="/terms">Terms of Service</Link></li>
                        <li><Link to="/privacy">Privacy Policy</Link></li>
                    </ul>
                </div>
                
                {/* Column 3: Connect With Us */}
                <div className="footer-section">
                    <h3>Connect With Us</h3>
                    <div className="social-links">
                        <a href="https://www.facebook.com/share/1FwRLUUYSV/" target="_blank" rel="noopener noreferrer" className='social-link facebook'>
                            <i className="fab fa-facebook-f"></i>
                            <span>Facebook</span>
                        </a>
                        <a href="https://www.instagram.com/vashvedena?igsh=MWV5ajRoZGZsajNyYw==" target="_blank" rel="noopener noreferrer" className='social-link instagram'>
                            <i className="fab fa-instagram"></i>
                            <span>Instagram</span>
                        </a>
                        <a href="https://www.tiktok.com/@elavedena?_r=1&_t=ZS-93xifmcPOFu" target="_blank" rel="noopener noreferrer" className='social-link tiktok'>
                            <i className="fab fa-tiktok"></i>
                            <span>TikTok</span>
                        </a> 
                    </div>
                </div>

                {/* Column 4: Newsletter */}
                <div className="footer-section newsletter-section">
                    <h3>Newsletter</h3>
                    <div className="newsletter">
                        <p>Get updates on new arrivals, special offers, and more.</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Enter your email" required />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer bottom section */}
            <div className="footer-bottom">
                <div className="footer-bottom-container">
                    <p>&copy; {currentYear} Vedathrifts. All rights reserved.</p>
                    <div className="payment-methods">
                        <span>We Accept:</span>
                        <i className="fas fa-mobile-alt"></i>
                        <span className="mpesa-text">M-PESA</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;