// services/contactService.js
import api from './api';

export const contactService = {
    sendMessage: async (formData) => {
        try {
            console.log('📧 Sending contact message:', formData);
            
            const response = await api.post('/contact', {
                name: formData.name,
                email: formData.email,
                message: formData.message
            });
            
            console.log('✅ Contact response:', response.data);
            
            return {
                success: true,
                message: response.data?.message || 'Message sent successfully',
                data: response.data
            };
        } catch (error) {
            console.error('❌ Send message error:', error);
            
            // Log the full error response for debugging
            if (error.response) {
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
                console.error('Error headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            
            // Extract error message from response
            let errorMessage = 'Failed to send message. Please try again.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Handle validation errors array
                const errors = error.response.data.errors;
                if (Array.isArray(errors)) {
                    errorMessage = errors.join(', ');
                } else if (typeof errors === 'object') {
                    errorMessage = Object.values(errors).join(', ');
                }
            } else if (error.message === 'Network Error') {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            
            return {
                success: false,
                message: errorMessage,
                error: error.response?.data
            };
        }
    }
};