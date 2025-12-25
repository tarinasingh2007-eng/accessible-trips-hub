import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { parsePackagesCSV, parseHospitalsCSV } from "@/lib/csvParser";
import type { TravelPackage, Hospital } from "@/types/travel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Star,
  Accessibility,
  Plane,
  Home,
  Utensils,
  Phone,
  Hospital as HospitalIcon,
  Clock,
  Navigation,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookingDialog from "@/components/BookingDialog";

const PackageDetails = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [packages, hospitalData] = await Promise.all([
          parsePackagesCSV(),
          parseHospitalsCSV(),
        ]);

        const packageId = parseInt(id || "0");
        const foundPackage = packages.find((p) => p.Package_ID === packageId);
        const relatedHospitals = hospitalData.filter(
          (h) => h.Package_ID === packageId
        );

        setPkg(foundPackage || null);
        setHospitals(relatedHospitals);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error loading data:", error);
        }
        toast({
          title: "Error",
          description: "Failed to load package details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Package Not Found</h2>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const discountedPrice = pkg.Price_USD - (pkg.Price_USD * pkg.Discount_Percent / 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Packages
            </Link>
          </Button>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{pkg.Package_Name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-5 w-5" />
                        <span>{pkg.Destination}, {pkg.Country}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-warning text-warning" />
                        <span className="font-medium">{pkg.Rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{pkg.Category}</Badge>
                  <Badge variant="outline">{pkg.Season}</Badge>
                  <Badge className={
                    pkg.Accessibility_Level === "High" ? "bg-safety" :
                    pkg.Accessibility_Level === "Medium" ? "bg-warning" : "bg-muted"
                  }>
                    <Accessibility className="w-3 h-3 mr-1" />
                    {pkg.Accessibility_Level} Accessibility
                  </Badge>
                  {pkg.Guide_Included === "Yes" && (
                    <Badge variant="secondary">Guide Included</Badge>
                  )}
                  {pkg.Meals_Included === "Yes" && (
                    <Badge variant="secondary">Meals Included</Badge>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>About This Package</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {pkg.Description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Package Details</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{pkg.Duration_Days} Days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Available Slots</p>
                      <p className="font-medium">{pkg.Available_Slots} Spots</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Plane className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transport</p>
                      <p className="font-medium">{pkg.Transport_Mode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Accommodation</p>
                      <p className="font-medium">{pkg.Accommodation_Type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{new Date(pkg.Start_Date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{new Date(pkg.End_Date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {hospitals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HospitalIcon className="h-5 w-5 text-safety" />
                      Nearby Medical Facilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hospitals.map((hospital) => (
                      <div key={hospital.Hospital_ID} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold mb-1">{hospital.Hospital_Name}</h4>
                            <Badge variant="outline">{hospital.Hospital_Type}</Badge>
                          </div>
                          {hospital["24x7_Service"] === "Yes" && (
                            <Badge className="bg-safety">24/7 Service</Badge>
                          )}
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{hospital.Address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {hospital.Distance_km_From_Destination.toFixed(1)} km away
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${hospital.Emergency_Number}`} className="text-primary hover:underline">
                              {hospital.Emergency_Number}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {hospital.SOS_Response_Time_Min} min response
                            </span>
                          </div>
                        </div>
                        
                        {hospital.Ambulance_Available === "Yes" && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-safety">
                            <AlertCircle className="h-4 w-4" />
                            <span>Ambulance Available</span>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          Languages: {hospital.Languages_Supported}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="md:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      {pkg.Discount_Percent > 0 && (
                        <span className="text-lg text-muted-foreground line-through">
                          ${pkg.Price_USD}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-primary">
                        ${discountedPrice.toFixed(0)}
                      </span>
                    </div>
                    {pkg.Discount_Percent > 0 && (
                      <Badge className="bg-secondary">
                        Save {pkg.Discount_Percent}%
                      </Badge>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      <span>Meals {pkg.Meals_Included === "Yes" ? "Included" : "Not Included"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Guide {pkg.Guide_Included === "Yes" ? "Included" : "Not Included"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${pkg.Contact_Number}`} className="text-primary hover:underline">
                        {pkg.Contact_Number}
                      </a>
                    </div>
                  </div>

                  <BookingDialog package={pkg} />
                  
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    {pkg.Available_Slots} slots remaining
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
