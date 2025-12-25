import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { parsePackagesCSV } from "@/lib/csvParser";
import type { TravelPackage } from "@/types/travel";
import PackageCard from "@/components/PackageCard";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Accessibility, Search, User, Calendar, LogOut, MapPin, Activity, Languages, ArrowLeft, ArrowRight, X } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<TravelPackage[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [accessibility, setAccessibility] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [season, setSeason] = useState("all");

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await parsePackagesCSV();
        setPackages(data);
        setFilteredPackages(data);
      } catch (error) {
        console.error("Error loading packages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('package_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.package_id) || []);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
    }
  };

  useEffect(() => {
    let filtered = packages;

    if (searchTerm) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.Package_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.Destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.Country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category !== "all") {
      filtered = filtered.filter((pkg) => pkg.Category === category);
    }

    if (accessibility !== "all") {
      filtered = filtered.filter(
        (pkg) => pkg.Accessibility_Level === accessibility
      );
    }

    if (season !== "all") {
      filtered = filtered.filter((pkg) => pkg.Season === season);
    }

    filtered = filtered.filter((pkg) => {
      const discountedPrice = pkg.Price_USD - (pkg.Price_USD * pkg.Discount_Percent / 100);
      return discountedPrice >= priceRange[0] && discountedPrice <= priceRange[1];
    });

    setFilteredPackages(filtered);
  }, [searchTerm, category, accessibility, priceRange, season, packages]);

  return (
    <div className="min-h-screen">
      {/* Browser Navigation Bar */}
      <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-2 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="Go Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)} title="Go Forward">
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex-1 bg-background rounded-md px-3 py-1.5 text-sm text-muted-foreground truncate">
          Travel Assist - Accessible Travel
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.close()} title="Close Tab">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-12 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Travel Assist</h1>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <Link to="/accessibility-map" className="flex items-center gap-1 text-foreground hover:text-primary transition-colors text-sm">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </Link>
            <Link to="/health-vitals" className="flex items-center gap-1 text-foreground hover:text-primary transition-colors text-sm">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Vitals</span>
            </Link>
            <Link to="/translation" className="flex items-center gap-1 text-foreground hover:text-primary transition-colors text-sm">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Translate</span>
            </Link>
            {user ? (
              <>
                <Link to="/favorites" className="flex items-center gap-1 text-foreground hover:text-primary transition-colors text-sm">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Favorites</span>
                </Link>
                <Link to="/bookings" className="flex items-center gap-1 text-foreground hover:text-primary transition-colors text-sm">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Bookings</span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Accessible Travel for Everyone
            </h1>
            <p className="text-xl text-foreground/90 mb-8 leading-relaxed">
              Discover inclusive travel experiences with integrated medical support. 
              Your adventure, our priority.
            </p>
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => {
                document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Search className="mr-2 h-5 w-5" />
              Explore Packages
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Accessibility className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fully Accessible</h3>
              <p className="text-muted-foreground">
                All packages rated for accessibility with detailed information
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-safety/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-safety" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Medical Support</h3>
              <p className="text-muted-foreground">
                Integrated hospital info and 24/7 emergency assistance
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Experiences</h3>
              <p className="text-muted-foreground">
                Handpicked destinations designed for inclusive travel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Discover Your Next Adventure</h2>
            <p className="text-muted-foreground">
              Browse our collection of accessible travel packages
            </p>
          </div>

          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            category={category}
            setCategory={setCategory}
            accessibility={accessibility}
            setAccessibility={setAccessibility}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            season={season}
            setSeason={setSeason}
          />

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading packages...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                No packages found matching your criteria
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg.Package_ID}
                  package={pkg}
                  isFavorite={favorites.includes(pkg.Package_ID)}
                  onFavoriteChange={loadFavorites}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Travel Assist</h3>
          <p className="text-muted-foreground mb-6">
            Making travel accessible and safe for everyone
          </p>
          <p className="text-sm text-muted-foreground">
            © 2025 Travel Assist. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
