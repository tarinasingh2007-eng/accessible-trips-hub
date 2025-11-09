import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PackageCard from '@/components/PackageCard';
import { TravelPackage } from '@/types/travel';
import { parsePackagesCSV } from '@/lib/csvParser';

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadFavorites();
      loadPackages();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('package_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.package_id) || []);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadPackages = async () => {
    try {
      const data = await parsePackagesCSV();
      setPackages(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading packages:', error);
      setLoading(false);
    }
  };

  const favoritePackages = packages.filter(pkg => favorites.includes(pkg.Package_ID));

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">Travel Assist</Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Favorites</h1>

        {favoritePackages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't added any favorites yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritePackages.map((pkg) => (
              <PackageCard
                key={pkg.Package_ID}
                package={pkg}
                isFavorite={true}
                onFavoriteChange={loadFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
