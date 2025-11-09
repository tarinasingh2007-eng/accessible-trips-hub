import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  package_name: string;
  travel_start_date: string;
  travel_end_date: string;
  number_of_travelers: number;
  total_price: number;
  status: string;
  special_requirements: string;
  created_at: string;
}

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">You haven't made any bookings yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.package_name}</CardTitle>
                      <CardDescription>
                        Booked on {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">Travel Dates</div>
                        <div className="text-muted-foreground">
                          {format(new Date(booking.travel_start_date), 'MMM dd')} - {format(new Date(booking.travel_end_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">Travelers</div>
                        <div className="text-muted-foreground">{booking.number_of_travelers}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">Total Price</div>
                        <div className="text-muted-foreground">${booking.total_price.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {booking.special_requirements && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium mb-1">Special Requirements</div>
                      <div className="text-sm text-muted-foreground">{booking.special_requirements}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
