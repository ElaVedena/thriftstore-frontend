import { useState } from 'react';
import '../../../components/css/ProductShare.css'; 


function ProductShare({ product }) {
    const [copied, setCopied] = useState(false);
    const productUrl = window.location.href;

    const shareLinks = [
        { name: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877f2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}` },
        { name: 'Twitter', icon: 'fab fa-twitter', color: '#1da1f2', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(`Check out this ${product.name} at Vedathrifts!`)}` },
        { name: 'Pinterest', icon: 'fab fa-pinterest', color: '#bd081c', url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(product.images[0])}&description=${encodeURIComponent(product.name)}` },
        { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25d366', url: `https://wa.me/?text=${encodeURIComponent(`Check out this ${product.name} at Vedathrifts: ${productUrl}`)}` },
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(productUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="product-share">
            <span className="share-label">Share:</span>
            <div className="share-buttons">
                {shareLinks.map(link => (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-btn"
                        style={{ '--hover-color': link.color }}
                        title={`Share on ${link.name}`}
                    >
                        <i className={link.icon}></i>
                    </a>
                ))}
                <button
                    className={`share-btn copy-btn ${copied ? 'copied' : ''}`}
                    onClick={copyToClipboard}
                    title="Copy link"
                >
                    <i className={`fa${copied ? 's' : 'r'} fa-copy`}></i>
                </button>
            </div>
            {copied && <span className="copy-message">Link copied!</span>}
        </div>
    );
}

export default ProductShare;