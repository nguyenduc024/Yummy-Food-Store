import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/Navbar';
import { CartDrawer, MobileCartBar } from './components/CartDrawer';
import { CartProvider } from './components/CartContext';
import { AuthProvider } from './components/AuthContext';
import { GlobalChatWidget } from './components/GlobalChatWidget';
import { HomePage } from './components/HomePage';
import { DiscoveryPage } from './components/DiscoveryPage';
import { RestaurantDetailPage } from './components/RestaurantDetailPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { AuthPage } from './components/AuthPage';
import { ProfileSetupPage } from './components/ProfileSetupPage';
import { SettingsPage } from './components/SettingsPage';
import '../styles/fonts.css';

/* MARKER-MAKE-KIT-INVOKED */
/* MARKER-MAKE-KIT-DISCOVERY-READ */

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/profile-setup" element={<ProfileSetupPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
            <CartDrawer />
            <GlobalChatWidget />
            <MobileCartBar />
            <Toaster
              position="top-right"
              gap={12}
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast: '!p-0 !bg-transparent !border-0 !shadow-none',
                },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
