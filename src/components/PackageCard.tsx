import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TravelPackage } from '@/types/travel';
import { Star, MapPin, Calendar, Users, Accessibility, Plane, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PackageCardProps {
  package: TravelPackage;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
}

export default function PackageCard({ package: pkg, isFavorite: initialFavorite = false, onFavoriteChange }: PackageCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const discountedPrice = pkg.Price_USD - (pkg.Price_USD * pkg.Discount_Percent / 100);
  
  const accessibilityColor = {
    High: "bg-safety text-safety-foreground",
    Medium: "bg-warning text-warning-foreground",
    Low: "bg-muted text-muted-foreground"
  }[pkg.Accessibility_Level] || "bg-muted";

  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('package_id', pkg.Package_ID);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, package_id: pkg.Package_ID });
      }
      setIsFavorite(!isFavorite);
      onFavoriteChange?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={toggleFavorite}
      >
        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
      </Button>

      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="absolute top-3 left-3 flex gap-2">
          {pkg.Discount_Percent > 0 && (
            <Badge className="bg-secondary text-secondary-foreground">
              {pkg.Discount_Percent}% OFF
            </Badge>
          )}
          <Badge className={accessibilityColor}>
            <Accessibility className="w-3 h-3 mr-1" />
            {pkg.Accessibility_Level}
          </Badge>
        </div>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h3 className="font-semibold text-lg">{pkg.Destination}</h3>
        </div>
      </div>
      
      <CardContent className="pt-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-xl mb-1">{pkg.Package_Name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-medium">{pkg.Rating}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {pkg.Description}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{pkg.Duration_Days} Days</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>{pkg.Available_Slots} Slots</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            <span>{pkg.Transport_Mode}</span>
          </div>
          <Badge variant="outline" className="w-fit">
            {pkg.Category}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div>
          {pkg.Discount_Percent > 0 && (
            <p className="text-sm text-muted-foreground line-through">
              ${pkg.Price_USD}
            </p>
          )}
          <p className="text-2xl font-bold text-primary">
            ${discountedPrice.toFixed(0)}
          </p>
        </div>
        <Button asChild>
          <Link to={`/package/${pkg.Package_ID}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
