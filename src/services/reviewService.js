import api from './api';

export const reviewService = {
    // Add a new review
    addReview: async (reviewData) => {
        try {
            console.log('Submitting review:', reviewData);
            const response = await api.post('/reviews', reviewData);
            console.log('Review submission response:', response.data);
            
            // Handle different response structures
            const review = response.data.data || response.data;
            
            return {
                success: true,
                review: review,
                message: response.data.message || 'Review submitted successfully'
            };
        } catch (error) {
            console.error(' Add review error:', error);
            console.error(' Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to submit review'
            };
        }
    },

    // Update a review
    updateReview: async (reviewId, reviewData) => {
        try {
            console.log(` Updating review ${reviewId}:`, reviewData);
            const response = await api.put(`/reviews/${reviewId}`, reviewData);
            
            return {
                success: true,
                review: response.data.data || response.data
            };
        } catch (error) {
            console.error(' Update review error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update review'
            };
        }
    },

    // Delete a review
    deleteReview: async (reviewId) => {
        try {
            console.log(` Deleting review ${reviewId}`);
            const response = await api.delete(`/reviews/${reviewId}`);
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Review deleted successfully'
            };
        } catch (error) {
            console.error(' Delete review error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete review'
            };
        }
    },

    // Get all reviews for a product
    getProductReviews: async (productId, page = 0, size = 10, rating = null, verified = null, sortBy = 'recent') => {
        try {
            console.log(` Fetching reviews for product ${productId}`, { page, size, rating, verified, sortBy });
            
            const params = { page, size, sortBy };
            if (rating) params.rating = rating;
            if (verified !== null) params.verified = verified;
            
            const response = await api.get(`/reviews/product/${productId}`, { params });
            
            // Handle different response structures
            if (response.data && response.data.content) {
                return {
                    success: true,
                    reviews: response.data.content,
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                    currentPage: response.data.number || page
                };
            } else if (Array.isArray(response.data)) {
                return {
                    success: true,
                    reviews: response.data,
                    totalPages: 1,
                    totalElements: response.data.length,
                    currentPage: 0
                };
            } else {
                return {
                    success: true,
                    reviews: response.data || [],
                    totalPages: 1,
                    totalElements: (response.data || []).length,
                    currentPage: 0
                };
            }
        } catch (error) {
            console.error(' Get reviews error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch reviews',
                reviews: [],
                totalPages: 0,
                totalElements: 0,
                currentPage: 0
            };
        }
    },

    // Get review statistics for a product
    getReviewStats: async (productId) => {
        try {
            console.log(` Fetching review stats for product ${productId}`);
            const response = await api.get(`/reviews/product/${productId}/stats`);
            
            return {
                success: true,
                stats: response.data
            };
        } catch (error) {
            console.error('Get review stats error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch review stats',
                stats: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                }
            };
        }
    },

    // Get reviews by user ID 
    getUserReviews: async (userId) => {
        try {
            console.log(`👤 Fetching reviews for user ${userId}`);
            const response = await api.get(`/reviews/user/${userId}`);
            
            // Handle different response structures
            if (response.data && response.data.content) {
                return {
                    success: true,
                    reviews: response.data.content,
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements
                };
            } else if (Array.isArray(response.data)) {
                return {
                    success: true,
                    reviews: response.data,
                    totalPages: 1,
                    totalElements: response.data.length
                };
            } else {
                return {
                    success: true,
                    reviews: response.data || [],
                    totalPages: 1,
                    totalElements: (response.data || []).length
                };
            }
        } catch (error) {
            console.error(' Get user reviews error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch user reviews',
                reviews: []
            };
        }
    },

    // Check if user has reviewed a specific product
    hasReviewedProduct: async (userId, productId) => {
        try {
            console.log(`🔍 Checking if user ${userId} reviewed product ${productId}`);
            const response = await api.get(`/reviews/user/${userId}/product/${productId}`);
            
            return {
                success: true,
                reviewed: response.data.reviewed || false,
                review: response.data.review || null
            };
        } catch (error) {
            console.error(' Check review status error:', error);
            return {
                success: false,
                reviewed: false,
                message: error.response?.data?.message || 'Failed to check review status'
            };
        }
    },

    // Mark review as helpful/not helpful
    markHelpful: async (reviewId, helpful) => {
        try {
            console.log(` Marking review ${reviewId} as ${helpful ? 'helpful' : 'not helpful'}`);
            const response = await api.post(`/reviews/${reviewId}/helpful?helpful=${helpful}`);
            
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Thank you for your feedback'
            };
        } catch (error) {
            console.error(' Mark helpful error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to mark review'
            };
        }
    },

    // Report a review
    reportReview: async (reviewId, reason) => {
        try {
            console.log(` Reporting review ${reviewId} with reason: ${reason}`);
            const response = await api.post(`/reviews/${reviewId}/report?reason=${encodeURIComponent(reason)}`);
            
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Review reported successfully'
            };
        } catch (error) {
            console.error(' Report review error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to report review'
            };
        }
    },

    // Admin: Get reported reviews
    getReportedReviews: async (page = 0, size = 20) => {
        try {
            console.log(` Fetching reported reviews page ${page}, size ${size}`);
            const response = await api.get('/reviews/admin/reported', { params: { page, size } });
            
            if (response.data && response.data.content) {
                return {
                    success: true,
                    reviews: response.data.content,
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements
                };
            }
            return {
                success: true,
                reviews: response.data || []
            };
        } catch (error) {
            console.error('Get reported reviews error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch reported reviews',
                reviews: []
            };
        }
    },

    // Admin Moderate a review
    moderateReview: async (reviewId, action, reason = '') => {
        try {
            console.log(` Moderating review ${reviewId} with action: ${action}`);
            
            const params = new URLSearchParams();
            params.append('action', action);
            if (reason) params.append('reason', reason);
            
            const response = await api.post(`/reviews/admin/${reviewId}/moderate?${params.toString()}`);
            
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Review moderated successfully'
            };
        } catch (error) {
            console.error(' Moderate review error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to moderate review'
            };
        }
    },

    // Upload review images
    uploadImages: async (files) => {
        try {
            console.log(` Uploading ${files.length} review images`);
            
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await api.post('/uploads/review-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('📸 Upload response:', response.data);
            
            // Handle different response structures
            const imageUrls = response.data.data || response.data;
            
            return {
                success: true,
                data: imageUrls,
                message: response.data.message || 'Images uploaded successfully'
            };
        } catch (error) {
            console.error(' Image upload error:', error);
            console.error(' Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to upload images'
            };
        }
    },

    // Helper method to get average rating for a product
    getAverageRating: async (productId) => {
        try {
            const stats = await reviewService.getReviewStats(productId);
            if (stats.success) {
                return {
                    success: true,
                    average: stats.stats.averageRating || 0,
                    total: stats.stats.totalReviews || 0
                };
            }
            return {
                success: false,
                average: 0,
                total: 0
            };
        } catch (error) {
            console.error('Error getting average rating:', error);
            return {
                success: false,
                average: 0,
                total: 0
            };
        }
    }
};