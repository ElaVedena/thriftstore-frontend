import Navbar from './components/common/navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop'; 
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Shop from './pages/Shop';
import Beauty from './pages/Beauty';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderConfirmation from './pages/OrderConfirmation';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/Admin/Dashboard';
import ProductList from './pages/Admin/Products/ProductList';
import AddProduct from './pages/Admin/Products/AddProduct';
import EditProduct from './pages/Admin/Products/EditProduct';
import OrderManagement from './pages/Admin/Orders/OrderManagement';
import UserManagement from './pages/Admin/Users/UserManagement';
import { NotificationProvider } from './context/NotificationContext';
import ToastContainer from './components/common/ToastContainer';
import {Route, Routes} from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TrackOrder from './pages/TrackOrder';
import FAQ from './pages/FAQ';
import ShippingPolicy from './pages/ShippingPolicy';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Revenue from './pages/Admin/Revenue/Revenue';

function App() {
    return (
        <NotificationProvider settings={{ position: 'top-right', autoClose: 5000 }}>
        <AuthProvider>
            <WishlistProvider>
            <CartProvider>
                <ScrollToTop /> 
                <Navbar />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/beauty" element={<Beauty />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    
                    {/* Protected User Routes */}
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                     <Route path="/track/:orderId" element={<TrackOrder />} />
                    
                    {/* Admin Routes  */}
                    <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute requireAdmin={true}><ProductList /></ProtectedRoute>} />
                    <Route path="/admin/products/add" element={<ProtectedRoute requireAdmin={true}><AddProduct /></ProtectedRoute>} />
                    <Route path="/admin/products/edit/:id" element={<ProtectedRoute requireAdmin={true}><EditProduct /></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute requireAdmin={true}><OrderManagement /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>} />
                    <Route path="/admin/revenue" element={<ProtectedRoute requireAdmin={true}><Revenue /></ProtectedRoute>} />
                </Routes>
                <Footer />
                <ToastContainer />
            </CartProvider>
            </WishlistProvider>
        </AuthProvider>
        </NotificationProvider>
    );
}

export default App;