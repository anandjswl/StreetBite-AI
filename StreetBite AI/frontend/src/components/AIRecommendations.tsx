import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, MapPin, Star, Loader2 } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import type { Vendor, Coordinates } from '../backend';

interface AIRecommendationsProps {
  vendors: Vendor[];
  userLocation: Coordinates | null;
  onVendorSelect: (vendor: Vendor) => void;
}

interface Recommendation {
  vendor: Vendor;
  reason: string;
  score: number;
}

export default function AIRecommendations({ vendors, userLocation, onVendorSelect }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trendingFoods, setTrendingFoods] = useState<string[]>([]);

  useEffect(() => {
    // Simulate AI recommendation generation
    const generateRecommendations = () => {
      setIsLoading(true);

      // Mock AI logic: prioritize nearby, verified, and available vendors
      const scored = vendors
        .filter((v) => v.availability)
        .map((vendor) => {
          let score = 0;
          let reason = '';

          // Distance factor
          if (userLocation) {
            const distance = calculateDistance(userLocation, vendor.coordinates);
            if (distance < 1) {
              score += 50;
              reason = 'Very close to you';
            } else if (distance < 3) {
              score += 30;
              reason = 'Nearby location';
            } else {
              score += 10;
              reason = 'Within your area';
            }
          } else {
            score += 20;
            reason = 'Popular choice';
          }

          // Verification bonus
          if (vendor.isVerified) {
            score += 30;
            reason += ' • Verified vendor';
          }

          // Menu variety
          if (vendor.menu.length > 3) {
            score += 20;
            reason += ' • Wide menu selection';
          }

          // Random trending boost
          if (Math.random() > 0.7) {
            score += 25;
            reason += ' • Trending now';
          }

          return { vendor, reason, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setRecommendations(scored);

      // Generate trending foods
      const foodTypes = vendors.map((v) => v.foodType);
      const uniqueFoods = Array.from(new Set(foodTypes));
      const trending = uniqueFoods.slice(0, 5);
      setTrendingFoods(trending);

      setTimeout(() => setIsLoading(false), 1000);
    };

    if (vendors.length > 0) {
      generateRecommendations();
    } else {
      setIsLoading(false);
    }
  }, [vendors, userLocation]);

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

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Recommendations</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <SiGoogle className="h-3 w-3" />
              <span className="text-xs">Powered by Google AI</span>
            </Badge>
          </div>
          <CardDescription>Personalized suggestions based on your preferences</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating recommendations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Recommendations</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <SiGoogle className="h-3 w-3" />
              <span className="text-xs">Powered by Google AI</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            No recommendations available at the moment. Check back when more vendors are online!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Recommendations</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <SiGoogle className="h-3 w-3" />
              <span className="text-xs">Powered by Google AI</span>
            </Badge>
          </div>
          <CardDescription>Personalized suggestions based on your preferences and location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec, index) => (
            <Card
              key={rec.vendor.id}
              className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
              onClick={() => onVendorSelect(rec.vendor)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h4 className="font-semibold">{rec.vendor.name}</h4>
                      {rec.vendor.isVerified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{rec.vendor.foodType}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span>{rec.reason}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.5</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {trendingFoods.length > 0 && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-950 dark:to-orange-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-orange-900 dark:text-orange-100">Trending Food Types</CardTitle>
              </div>
              <Badge variant="outline" className="gap-1 border-orange-300 dark:border-orange-700">
                <SiGoogle className="h-3 w-3" />
                <span className="text-xs">Powered by Google AI</span>
              </Badge>
            </div>
            <CardDescription className="text-orange-800 dark:text-orange-200">
              Popular choices in your area right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingFoods.map((food) => (
                <Badge key={food} variant="secondary" className="bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100">
                  {food}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
