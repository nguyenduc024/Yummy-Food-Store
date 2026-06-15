import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/Navbar';
import { CartDrawer, MobileCartBar } from './components/CartDrawer';
import { CartProvider } from './components/CartContext';
import { HomePage } from './components/HomePage';
import { DiscoveryPage } from './components/DiscoveryPage';
import { RestaurantDetailPage } from './components/RestaurantDetailPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import '../styles/fonts.css';

/* MARKER-MAKE-KIT-INVOKED */
/* MARKER-MAKE-KIT-DISCOVERY-READ */

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoveryPage />} />
              <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/tracking" element={<OrderTrackingPage />} />
            </Routes>
          </main>
          <CartDrawer />
          <MobileCartBar />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
