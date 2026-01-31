import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Star, Navigation, QrCode } from 'lucide-react';
import type { Vendor, Coordinates } from '../backend';
import { useState } from 'react';
import QRCodeDisplay from './QRCodeDisplay';

interface VendorDetailDialogProps {
  vendor: Vendor;
  onClose: () => void;
  userLocation: Coordinates | null;
}

export default function VendorDetailDialog({ vendor, onClose, userLocation }: VendorDetailDialogProps) {
  const [showQR, setShowQR] = useState(false);

  const calculateDistance = (coords1: Coordinates, coords2: Coordinates): number => {
    const R = 6371;
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

  const distance = userLocation ? calculateDistance(userLocation, vendor.coordinates) : null;

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${vendor.coordinates.latitude},${vendor.coordinates.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {vendor.name}
              {vendor.isVerified && (
                <Badge variant="default" className="text-xs">
                  Verified
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status and Type */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                {vendor.foodType}
              </Badge>
              {vendor.availability ? (
                <Badge variant="default" className="bg-green-500">
                  <Clock className="mr-1 h-3 w-3" />
                  Open Now
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Closed
                </Badge>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <h3 className="font-semibold">Location</h3>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{vendor.address}</span>
              </div>
              {distance !== null && (
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Navigation className="h-4 w-4" />
                  <span>{distance.toFixed(1)} km away</span>
                </div>
              )}
              <Button onClick={openInMaps} variant="outline" size="sm" className="w-full">
                <MapPin className="mr-2 h-4 w-4" />
                Open in Google Maps
              </Button>
            </div>

            <Separator />

            {/* Menu */}
            <div className="space-y-3">
              <h3 className="font-semibold">Menu</h3>
              {vendor.menu.length === 0 ? (
                <p className="text-sm text-muted-foreground">No menu items available</p>
              ) : (
                <div className="space-y-2">
                  {vendor.menu.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-lg font-bold text-primary">₹{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Ratings (Mock) */}
            <div className="space-y-3">
              <h3 className="font-semibold">Ratings & Reviews</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">4.5</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Based on 127 reviews</p>
                  <p className="mt-1">Hygiene Score: 92/100</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* QR Code */}
            <div className="space-y-3">
              <h3 className="font-semibold">Vendor QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Scan this QR code to quickly access vendor information
              </p>
              <Button onClick={() => setShowQR(true)} variant="outline" className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                View QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showQR && <QRCodeDisplay vendor={vendor} onClose={() => setShowQR(false)} />}
    </>
  );
}
