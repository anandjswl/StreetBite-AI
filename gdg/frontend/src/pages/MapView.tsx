import { useState, useEffect, useRef } from 'react';
import { useGetAllVendors, useGetLiveVendorLocations } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Clock, Star, Navigation, Filter, Radio } from 'lucide-react';
import VendorDetailDialog from '../components/VendorDetailDialog';
import type { Vendor, Coordinates } from '../backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MapView() {
  const { data: vendors = [], isLoading } = useGetAllVendors();
  const { data: liveLocations = [] } = useGetLiveVendorLocations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      // Start watching user's position for live tracking
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to single position request
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (err) => console.error('Fallback location error:', err)
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    // Cleanup: stop watching position when component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Merge live location updates with vendor data
  const vendorsWithLiveLocations = vendors.map((vendor) => {
    const liveLocation = liveLocations.find(([id]) => id === vendor.id);
    if (liveLocation) {
      return {
        ...vendor,
        coordinates: liveLocation[1],
      };
    }
    return vendor;
  });

  const calculateDistance = (coords1: Coordinates, coords2: Coordinates): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
    const dLon = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coords1.latitude * Math.PI) / 180) *
        Math.cos((coords2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredVendors = vendorsWithLiveLocations
    .filter((vendor) => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.foodType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || vendor.foodType === filterType;
      return matchesSearch && matchesFilter;
    })
    .map((vendor) => ({
      ...vendor,
      distance: userLocation ? calculateDistance(userLocation, vendor.coordinates) : null,
    }))
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return 0;
    });

  const foodTypes = Array.from(new Set(vendors.map((v) => v.foodType)));

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vendors or food types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {foodTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {userLocation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4 text-green-500 animate-pulse" />
              <span>Showing vendors near your location</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-800 dark:bg-green-950">
            <Radio className="h-4 w-4 text-green-600 animate-pulse dark:text-green-400" />
            <span className="font-medium text-green-900 dark:text-green-100">
              Live Location Updates
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVendors.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No vendors found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm ? 'Try adjusting your search' : 'Be the first to register a vendor!'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => setSelectedVendor(vendor)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {vendor.name}
                      {vendor.isVerified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{vendor.foodType}</p>
                  </div>
                  {vendor.availability ? (
                    <Badge variant="default" className="bg-green-500">
                      <Clock className="mr-1 h-3 w-3" />
                      Open
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Closed</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-2">{vendor.address}</span>
                </div>
                {vendor.distance !== null && (
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Navigation className="h-4 w-4" />
                    <span>{vendor.distance.toFixed(1)} km away</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.5</span>
                  <span className="text-muted-foreground">(Mock rating)</span>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedVendor && (
        <VendorDetailDialog
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
