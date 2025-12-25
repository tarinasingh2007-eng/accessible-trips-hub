import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Navigation, Loader2, Hospital, Accessibility, Bath, Phone, Clock, ChevronRight } from 'lucide-react';
import PageNarrator from '@/components/PageNarrator';
import { useToast } from '@/hooks/use-toast';

interface NearbyPlace {
  id: string;
  name: string;
  type: 'hospital' | 'wheelchair_access' | 'restroom' | 'pharmacy' | 'accessible_parking';
  address: string;
  distance: string;
  phone?: string;
  openNow?: boolean;
  rating?: number;
  wheelchairAccessible?: boolean;
}

// Mock data for nearby places (in production, use Google Places API)
const MOCK_PLACES: NearbyPlace[] = [
  { id: '1', name: 'City General Hospital', type: 'hospital', address: '123 Medical Center Dr', distance: '0.5 km', phone: '+1 555-0100', openNow: true, rating: 4.5, wheelchairAccessible: true },
  { id: '2', name: 'Community Health Center', type: 'hospital', address: '456 Healthcare Ave', distance: '1.2 km', phone: '+1 555-0101', openNow: true, rating: 4.2, wheelchairAccessible: true },
  { id: '3', name: 'Accessible Public Restroom', type: 'restroom', address: 'Central Park, Main Entrance', distance: '0.3 km', openNow: true, wheelchairAccessible: true },
  { id: '4', name: 'Metro Station Restroom', type: 'restroom', address: 'Metro Station B1', distance: '0.7 km', openNow: true, wheelchairAccessible: true },
  { id: '5', name: 'Shopping Mall Wheelchair Ramp', type: 'wheelchair_access', address: 'Grand Mall, North Entrance', distance: '0.4 km', wheelchairAccessible: true },
  { id: '6', name: 'Library Wheelchair Access', type: 'wheelchair_access', address: 'Public Library, Side Entrance', distance: '0.6 km', wheelchairAccessible: true },
  { id: '7', name: 'Accessible Parking Lot A', type: 'accessible_parking', address: 'Downtown Parking Structure', distance: '0.2 km', wheelchairAccessible: true },
  { id: '8', name: 'Pharmacy Plus', type: 'pharmacy', address: '789 Health St', distance: '0.8 km', phone: '+1 555-0102', openNow: true, rating: 4.0, wheelchairAccessible: true },
];

const AccessibilityMap: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [filters, setFilters] = useState({
    hospital: true,
    restroom: true,
    wheelchair_access: true,
    pharmacy: true,
    accessible_parking: true,
  });
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  const { toast } = useToast();

  const getTypeIcon = (type: NearbyPlace['type']) => {
    switch (type) {
      case 'hospital':
        return <Hospital className="h-5 w-5 text-destructive" />;
      case 'restroom':
        return <Bath className="h-5 w-5 text-primary" />;
      case 'wheelchair_access':
        return <Accessibility className="h-5 w-5 text-accent" />;
      case 'pharmacy':
        return <Hospital className="h-5 w-5 text-safety" />;
      case 'accessible_parking':
        return <MapPin className="h-5 w-5 text-adventure" />;
    }
  };

  const getTypeLabel = (type: NearbyPlace['type']) => {
    switch (type) {
      case 'hospital': return 'Hospital';
      case 'restroom': return 'Restroom';
      case 'wheelchair_access': return 'Wheelchair Access';
      case 'pharmacy': return 'Pharmacy';
      case 'accessible_parking': return 'Accessible Parking';
    }
  };

  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingLocation(false);
          toast({
            title: "Location found",
            description: "Showing nearby accessible facilities",
          });
          // Load mock places (in production, call Google Places API here)
          setPlaces(MOCK_PLACES);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoadingLocation(false);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Unable to get your location. Using demo data.",
          });
          // Show mock data anyway for demo
          setLocation({ lat: 40.7128, lng: -74.0060 }); // NYC
          setPlaces(MOCK_PLACES);
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
      });
    }
  }, [toast]);

  const filteredPlaces = places.filter(place => {
    if (!filters[place.type]) return false;
    if (searchQuery && !place.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !place.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const openDirections = (place: NearbyPlace) => {
    if (location) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${encodeURIComponent(place.address)}`;
      window.open(url, '_blank');
    }
  };

  const pageDescription = "Accessibility map showing nearby wheelchair access points, hospitals, restrooms, and other accessible facilities.";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Accessibility Map</h1>
            </div>
            <PageNarrator content={pageDescription} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* API Key Input (for demo) */}
            {showApiKeyInput && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Google Maps API Key (Optional)</CardTitle>
                  <CardDescription>For live map integration. Leave empty for demo mode.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Enter API key..."
                    value={googleMapsApiKey}
                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowApiKeyInput(false)}
                    className="w-full"
                  >
                    Use Demo Mode
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Your Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={getCurrentLocation} 
                  disabled={isLoadingLocation}
                  className="w-full"
                >
                  {isLoadingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting location...
                    </>
                  ) : location ? (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Update Location
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Get My Location
                    </>
                  )}
                </Button>
                
                {location && (
                  <p className="text-sm text-muted-foreground">
                    📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Places</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="space-y-3">
                  {Object.entries(filters).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <Label htmlFor={key} className="flex items-center gap-2">
                        {getTypeIcon(key as NearbyPlace['type'])}
                        {getTypeLabel(key as NearbyPlace['type'])}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Container */}
            <Card className="min-h-96">
              <CardContent className="p-0">
                {location && googleMapsApiKey ? (
                  <iframe
                    title="Accessibility Map"
                    width="100%"
                    height="400"
                    style={{ border: 0, borderRadius: 'var(--radius)' }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/search?key=${googleMapsApiKey}&q=wheelchair+accessible+places&center=${location.lat},${location.lng}&zoom=14`}
                  />
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center bg-muted rounded-lg">
                    <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      {location ? 'Demo mode: Map preview not available without API key' : 'Click "Get My Location" to start'}
                    </p>
                    {location && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.open(`https://www.google.com/maps/@${location.lat},${location.lng},14z`, '_blank')}
                      >
                        Open in Google Maps
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Places List */}
            <Card>
              <CardHeader>
                <CardTitle>Nearby Accessible Facilities ({filteredPlaces.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {!location ? (
                  <p className="text-muted-foreground text-center py-8">
                    Enable location to find nearby accessible facilities
                  </p>
                ) : filteredPlaces.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No places found matching your filters
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredPlaces.map((place) => (
                      <div
                        key={place.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted ${
                          selectedPlace?.id === place.id ? 'border-primary bg-muted' : ''
                        }`}
                        onClick={() => setSelectedPlace(place)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getTypeIcon(place.type)}
                            <div>
                              <h4 className="font-medium">{place.name}</h4>
                              <p className="text-sm text-muted-foreground">{place.address}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{place.distance}</Badge>
                                {place.wheelchairAccessible && (
                                  <Badge variant="outline" className="text-accent">
                                    <Accessibility className="h-3 w-3 mr-1" />
                                    Accessible
                                  </Badge>
                                )}
                                {place.openNow !== undefined && (
                                  <Badge variant={place.openNow ? "default" : "secondary"}>
                                    <Clock className="h-3 w-3 mr-1" />
                                    {place.openNow ? 'Open' : 'Closed'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        {selectedPlace?.id === place.id && (
                          <div className="mt-4 pt-4 border-t flex gap-2">
                            {place.phone && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={`tel:${place.phone}`}>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call
                                </a>
                              </Button>
                            )}
                            <Button size="sm" onClick={() => openDirections(place)}>
                              <Navigation className="h-4 w-4 mr-2" />
                              Directions
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessibilityMap;
