import api from './api';

export const categoryService = {
    // Get all categories with product counts and sample images
    getAllCategories: async () => {
        console.log('Extracting categories from products...');
        
        try {
            // Fetch products to extract categories
            const response = await api.get('/products', {
                params: { page: 0, size: 100 } // Get up to 100 products
            });
            
           
            let products = [];
            if (response.data?.content) {
                products = response.data.content;
            } else if (Array.isArray(response.data)) {
                products = response.data;
            } else {
                products = response.data || [];
            }
            
            console.log(`Found ${products.length} products for category extraction`);
            
            // If no products found return empty array
            if (!products || products.length === 0) {
                console.log('No products found to extract categories');
                return {
                    success: true,
                    data: []
                };
            }
            
            // Group products by category
            const categoryMap = new Map();
            
            products.forEach(product => {
                if (product.category) {
                    const categoryName = product.category;
                    
                    if (!categoryMap.has(categoryName)) {
                        categoryMap.set(categoryName, {
                            id: categoryName, 
                            name: categoryName, 
                            displayName: categoryName.charAt(0).toUpperCase() + categoryName.slice(1), // For display
                            count: 0,
                            image: null
                        });
                    }
                    
                    const categoryData = categoryMap.get(categoryName);
                    categoryData.count++;
                    
                    // Set the first product's image as category image
                    if (!categoryData.image) {
                        if (product.images?.length > 0) {
                            categoryData.image = product.images[0];
                        } else if (product.imageUrl) {
                            categoryData.image = product.imageUrl;
                        } else if (product.image) {
                            categoryData.image = product.image;
                        }
                    }
                }
            });
            
            // Convert map to array
            const categories = Array.from(categoryMap.values());
            
            // Sort categories by count (most products first)
            categories.sort((a, b) => b.count - a.count);
            
            console.log(`Extracted ${categories.length} categories from ${products.length} products`);
            console.log('Categories:', categories.map(c => ({ name: c.name, count: c.count, displayName: c.displayName })));
            
            // Return success true with the categories data
            return {
                success: true,
                data: categories
            };
            
        } catch (error) {
            console.error('Error extracting categories from products:', error);
            
            // Fallback: predefined categories with your list
            const predefinedCategories = [
                { id: 'jackets', name: 'jackets', displayName: 'Jackets', count: 0, image: null },
                { id: 'pants', name: 'pants', displayName: 'Pants', count: 0, image: null },
                { id: 'dresses', name: 'dresses', displayName: 'Dresses', count: 0, image: null },
                { id: 'shoes', name: 'shoes', displayName: 'Shoes', count: 0, image: null },
                { id: 'accessories', name: 'accessories', displayName: 'Accessories', count: 0, image: null },
                { id: 'sweaters', name: 'sweaters', displayName: 'Sweaters', count: 0, image: null },
                { id: 'skirts', name: 'skirts', displayName: 'Skirts', count: 0, image: null },
                { id: 't-shirts', name: 't-shirts', displayName: 'T-Shirts', count: 0, image: null },
                { id: 'shirts', name: 'shirts', displayName: 'Shirts', count: 0, image: null }
            ];
            
            console.log('Using predefined categories as fallback');
            return {
                success: true,
                data: predefinedCategories
            };
        }
    },

    // Get single category by name
    getCategoryByName: async (categoryName) => {
        try {
            // Use lowercase to match database
            const searchName = categoryName.toLowerCase();
            
            // Fetch products in this category
            const response = await api.get('/products/filter', {
                params: { category: searchName, page: 0, size: 20 }
            });
            
            let products = [];
            let totalCount = 0;
            
            if (response.data?.content) {
                products = response.data.content;
                totalCount = response.data.totalElements || products.length;
            } else if (Array.isArray(response.data)) {
                products = response.data;
                totalCount = products.length;
            }
            
            // Get sample image from first product
            const sampleImage = products.length > 0 
                ? (products[0].images?.[0] || products[0].imageUrl || products[0].image)
                : null;
            
            return {
                success: true,
                data: {
                    id: searchName,
                    name: searchName,
                    displayName: searchName.charAt(0).toUpperCase() + searchName.slice(1),
                    count: totalCount,
                    image: sampleImage,
                    products: products.slice(0, 4) 
                }
            };
            
        } catch (error) {
            console.error(`Error fetching category ${categoryName}:`, error);
            return {
                success: true,
                data: {
                    id: categoryName.toLowerCase(),
                    name: categoryName.toLowerCase(),
                    displayName: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
                    count: 0,
                    image: null,
                    products: []
                }
            };
        }
    },

    // Get category by ID 
    getCategoryById: async (id) => {
        return categoryService.getCategoryByName(id);
    }
};