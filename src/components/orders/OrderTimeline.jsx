import React from 'react';
import '../../components/css/OrderTimeline.css';

function OrderTimeline({ timeline, currentStatus }) {
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
                                <span className="timeline-date">
                                    {new Date(event.date).toLocaleDateString('en-KE', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
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