import React from 'react';
import '../../components/css/OrderTimeline.css';

function OrderTimeline({ timeline, currentStatus }) {
    // Helper function to format date with correct timezone
    const formatDateWithTimezone = (dateString) => {
        if (!dateString) return null;
        
        // Parse the date string and ensure it's treated as Nairobi time
        let date;
        if (dateString.includes('T')) {
            // If ISO format, keep as is and let toLocaleString handle timezone
            date = new Date(dateString);
        } else {
            // If not ISO, append Nairobi timezone info
            date = new Date(dateString + '+03:00');
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        // Format for Nairobi timezone (Eastern Africa Time)
        return date.toLocaleString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Africa/Nairobi'
        });
    };

    // Helper to get relative time display
    const getRelativeTime = (dateString) => {
        if (!dateString) return null;
        
        let date;
        if (dateString.includes('T')) {
            date = new Date(dateString);
        } else {
            date = new Date(dateString + '+03:00');
        }
        
        if (isNaN(date.getTime())) return null;
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return null;
    };

    if (!timeline || timeline.length === 0) {
        return (
            <div className="timeline-empty">
                <i className="fas fa-history"></i>
                <p>No timeline events available</p>
            </div>
        );
    }

    return (
        <div className="order-timeline">
            {timeline.map((event, index) => (
                <div 
                    key={index} 
                    className={`timeline-event ${event.completed ? 'completed' : ''} ${event.failed ? 'failed' : ''} ${event.active ? 'active' : ''}`}
                >
                    <div className="timeline-dot">
                        {event.icon && <i className={event.icon}></i>}
                    </div>
                    <div className="timeline-content">
                        <div className="timeline-header">
                            <h4>{event.status}</h4>
                            {event.date && (
                                <div className="timeline-date-wrapper">
                                    <span className="timeline-date">
                                        {formatDateWithTimezone(event.date)}
                                    </span>
                                    <span className="timeline-relative">
                                        {getRelativeTime(event.date)}
                                    </span>
                                </div>
                            )}
                        </div>
                        {event.description && (
                            <p className="timeline-description">{event.description}</p>
                        )}
                        {event.metadata && (
                            <div className="timeline-metadata">
                                {event.metadata.receipt && (
                                    <span className="metadata-item">
                                        <i className="fas fa-receipt"></i>
                                        Receipt: {event.metadata.receipt}
                                    </span>
                                )}
                                {event.metadata.trackingNumber && (
                                    <span className="metadata-item">
                                        <i className="fas fa-truck"></i>
                                        Tracking: {event.metadata.trackingNumber}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default OrderTimeline;