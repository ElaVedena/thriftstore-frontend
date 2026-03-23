export const formatDate = (dateString) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-KE', options);
};

export const formatShortDate = (dateString) => {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-KE', options);
};

export const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};