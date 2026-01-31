import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Vendor } from '../backend';
import { useEffect, useRef } from 'react';

interface QRCodeDisplayProps {
  vendor: Vendor;
  onClose: () => void;
}

export default function QRCodeDisplay({ vendor, onClose }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate a simple QR code representation
    // In production, you would use a proper QR code library
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple pattern generation (not a real QR code)
    const size = 200;
    const moduleSize = 10;
    const modules = size / moduleSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#000000';
    
    // Create a pseudo-random pattern based on vendor ID
    const seed = vendor.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let random = seed;
    
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        random = (random * 9301 + 49297) % 233280;
        if (random / 233280 > 0.5) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [vendor.id]);

  const vendorUrl = `${window.location.origin}?vendor=${vendor.id}`;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vendor QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center rounded-lg border bg-white p-6">
            <canvas ref={canvasRef} width={200} height={200} className="rounded" />
          </div>
          <div className="space-y-2 text-center">
            <p className="font-semibold">{vendor.name}</p>
            <p className="text-sm text-muted-foreground">{vendor.foodType}</p>
            <p className="text-xs text-muted-foreground break-all">{vendorUrl}</p>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Scan this code to access vendor information instantly
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
