import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Mic, Plus, Trash2, Navigation, Info, LogIn, Home } from 'lucide-react';
import { useRegisterVendor } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { MenuItem, Coordinates } from '../backend';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VendorRegistrationProps {
  onSuccess?: () => void;
  onReturnHome?: () => void;
}

export default function VendorRegistration({ onSuccess, onReturnHome }: VendorRegistrationProps) {
  const [name, setName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const registerVendor = useRegisterVendor();
  const { identity, login } = useInternetIdentity();

  const isAuthenticated = !!identity;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsGettingLocation(false);
        toast.success('Location captured successfully!');
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get location. Please try again.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleAddMenuItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;

    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setMenuItems([...menuItems, { name: newItemName.trim(), price, currency: 'INR' }]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleRemoveMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening... Please speak now');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceInput(transcript);
      toast.success('Voice input captured!');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Failed to capture voice input');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !foodType.trim() || !address.trim() || !coordinates) {
      toast.error('Please fill in all required fields and capture location');
      return;
    }

    if (menuItems.length === 0) {
      toast.error('Please add at least one menu item');
      return;
    }

    registerVendor.mutate(
      {
        name: name.trim(),
        foodType: foodType.trim(),
        coordinates,
        menu: menuItems,
        address: address.trim(),
      },
      {
        onSuccess: () => {
          // Reset form
          setName('');
          setFoodType('');
          setAddress('');
          setCoordinates(null);
          setMenuItems([]);
          setNewItemName('');
          setNewItemPrice('');
          setVoiceInput('');
          
          // Show success toast
          toast.success('Vendor registered successfully! Redirecting to map...');
          
          // Redirect to homepage
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold">Register Your Vendor</h1>
          <p className="mt-2 text-muted-foreground">
            Join the StreetBite AI network and reach more customers
          </p>
        </div>
        {onReturnHome && (
          <Button
            onClick={onReturnHome}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Return to Home</span>
          </Button>
        )}
      </div>

      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          Open Registration
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Anyone can register a vendor without logging in. However, logging in allows you to edit, update, and manage your vendor profile later.
        </AlertDescription>
        {!isAuthenticated && (
          <Button
            onClick={login}
            variant="outline"
            size="sm"
            className="mt-3 border-blue-300 bg-white text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login for Management
          </Button>
        )}
      </Alert>

      <Tabs defaultValue="gps" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gps">
            <MapPin className="mr-2 h-4 w-4" />
            GPS Registration
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="mr-2 h-4 w-4" />
            Voice Registration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gps">
          <Card>
            <CardHeader>
              <CardTitle>GPS-Based Registration</CardTitle>
              <CardDescription>
                Use your device's GPS to automatically capture your location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Joe's Tacos"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foodType">Food Type *</Label>
                  <Input
                    id="foodType"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    placeholder="e.g., Mexican, Indian, Chinese"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your street address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    variant="outline"
                    className="w-full"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    {isGettingLocation
                      ? 'Getting Location...'
                      : coordinates
                        ? `Location Captured (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)})`
                        : 'Capture GPS Location'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <Label>Menu Items *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Item name"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price (₹)"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-32"
                    />
                    <Button type="button" onClick={handleAddMenuItem} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {menuItems.length > 0 && (
                    <div className="space-y-2 rounded-lg border p-4">
                      {menuItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>
                            {item.name} - ₹{item.price.toFixed(2)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMenuItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={registerVendor.isPending}>
                  {registerVendor.isPending ? 'Registering...' : 'Register Vendor'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice-Based Registration</CardTitle>
              <CardDescription>
                Use voice input for feature-phone users or hands-free registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Voice Input</Label>
                <Button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  variant="outline"
                  className="w-full"
                >
                  <Mic className={`mr-2 h-4 w-4 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
                  {isListening ? 'Listening...' : 'Start Voice Input'}
                </Button>

                {voiceInput && (
                  <div className="rounded-lg border bg-muted p-4">
                    <p className="text-sm font-medium">Captured Input:</p>
                    <p className="mt-2 text-sm">{voiceInput}</p>
                  </div>
                )}

                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  <p>
                    Speak your vendor details including name, food type, address, and menu items.
                  </p>
                  <p className="mt-2">
                    Example: "My vendor name is Joe's Tacos, I sell Mexican food at 123 Main Street, menu items are tacos for 50 rupees and burritos for 70 rupees"
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Voice registration is a simplified interface. After capturing voice input, you can manually fill in the GPS registration form with the details.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
