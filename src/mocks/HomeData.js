import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';

export const featuredProducts = [
  {
    id: 1,
    name: "Vintage Leather Jacket",
    price: 120,
    condition: "Good",
    category: "jackets",
    size: "L",
    brand: "Vintage Co.",
    rating: 4.5,
    image: image1,
    isNew: false
  },
  {
    id: 2,
    name: "Retro Denim Jeans",
    price: 60,  
    condition: "Like New",
    category: "pants",
    size: "32",
    brand: "Levi's",
    rating: 4.8,
    image: image2,
    isNew: true
  },
  {
    id: 3,
    name: "Classic Wool Coat",
    price: 150,
    condition: "Excellent",
    category: "jackets",
    size: "M",
    brand: "London Fog",
    rating: 4.7,
    image: image3,
    isNew: false
  },
  {
    id: 4,
    name: "Boho Floral Dress",
    price: 80,
    condition: "Good",
    category: "dresses",
    size: "S",
    brand: "Free People",
    rating: 4.3,
    image: image2,
    isNew: false
  },
];

export const categories = [
  {
    name: "Clothing",
    image: image1,
    count: 120
  },
  {
    name: "Accessories",
    image: image1,
    count: 80
  },
  {
    name: "Home Decor",
    image: image2,
    count: 60
  },
  {
    name: "Shoes",
    image: image3,
    count: 90
  },
];

export const newArrivals = [
  {
    id: 5,  
    name: "Vintage Silk Scarf",
    price: 40,
    condition: "Like New",
    category: "accessories",
    size: "One Size",
    brand: "Vintage",
    rating: 4.6,
    image: image1,
    isNew: true
  },
  {
    id: 6,
    name: "Retro Leather Boots",
    price: 100,
    condition: "Good",
    category: "shoes",
    size: "42",
    brand: "Dr. Martens",
    rating: 4.9,
    image: image3,
    isNew: true
  },
  {
    id: 7,  
    name: "Classic Wool Sweater",
    price: 70,
    condition: "Excellent",
    category: "sweaters",
    size: "L",
    brand: "Ralph Lauren",
    rating: 4.4,
    image: image2,
    isNew: true
  },
  {
    id: 8,  
    name: "Boho Maxi Skirt",
    price: 50,
    condition: "Good",
    category: "skirts",
    size: "M",
    brand: "Anthropologie",
    rating: 4.2,
    image: image3,
    isNew: true
  },
];