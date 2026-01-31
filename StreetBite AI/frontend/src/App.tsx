import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import MapView from './pages/MapView';
import VendorRegistration from './pages/VendorRegistration';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { useState } from 'react';

type View = 'map' | 'register' | 'admin' | 'adminLogin';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentView, setCurrentView] = useState<View>('map');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleRegistrationSuccess = () => {
    setCurrentView('map');
  };

  const handleReturnHome = () => {
    setCurrentView('map');
  };

  const handleAdminLoginSuccess = () => {
    setCurrentView('admin');
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-accent/5">
        <Header currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="flex-1">
          {currentView === 'map' && <MapView />}
          {currentView === 'register' && (
            <VendorRegistration 
              onSuccess={handleRegistrationSuccess}
              onReturnHome={handleReturnHome}
            />
          )}
          {currentView === 'adminLogin' && (
            <AdminLogin 
              onSuccess={handleAdminLoginSuccess}
              onReturnHome={handleReturnHome}
            />
          )}
          {currentView === 'admin' && (
            <AdminDashboard onReturnHome={handleReturnHome} />
          )}
        </main>

        <Footer />
        
        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
