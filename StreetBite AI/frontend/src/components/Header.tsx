import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MapPin, UserPlus, BarChart3, LogIn, LogOut } from 'lucide-react';

interface HeaderProps {
  currentView: 'map' | 'register' | 'admin' | 'adminLogin';
  onViewChange: (view: 'map' | 'register' | 'admin' | 'adminLogin') => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      onViewChange('map');
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              StreetBite AI
            </h1>
            <p className="text-xs text-muted-foreground">Discover Street Food</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant={currentView === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('map')}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Map</span>
          </Button>

          <Button
            variant={currentView === 'register' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('register')}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Register</span>
          </Button>

          <Button
            variant={currentView === 'admin' || currentView === 'adminLogin' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('adminLogin')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Button>

          <Button
            onClick={handleAuth}
            disabled={disabled}
            size="sm"
            variant={isAuthenticated ? 'outline' : 'default'}
            className="gap-2"
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </>
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
