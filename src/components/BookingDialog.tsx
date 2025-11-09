import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TravelPackage } from '@/types/travel';
import { Calendar } from 'lucide-react';

interface BookingDialogProps {
  package: TravelPackage;
}

export default function BookingDialog({ package: pkg }: BookingDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    travelers: 1,
    startDate: pkg.Start_Date,
    endDate: pkg.End_Date,
    specialRequirements: '',
  });

  const finalPrice = pkg.Price_USD * (1 - pkg.Discount_Percent / 100) * formData.travelers;

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        package_id: pkg.Package_ID,
        package_name: pkg.Package_Name,
        travel_start_date: formData.startDate,
        travel_end_date: formData.endDate,
        number_of_travelers: formData.travelers,
        total_price: finalPrice,
        status: 'pending',
        special_requirements: formData.specialRequirements,
      });

      if (error) throw error;

      toast({
        title: 'Booking Successful!',
        description: 'Your booking has been created. Check your bookings page for details.',
      });
      setOpen(false);
      navigate('/bookings');
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Calendar className="mr-2 h-4 w-4" />
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {pkg.Package_Name}</DialogTitle>
          <DialogDescription>
            Complete the details below to book your travel package.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="travelers">Number of Travelers</Label>
            <Input
              id="travelers"
              type="number"
              min="1"
              max={pkg.Available_Slots}
              value={formData.travelers}
              onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Special Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="Any accessibility needs, dietary restrictions, etc."
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Base Price (per person)</span>
              <span className="text-sm">${pkg.Price_USD.toLocaleString()}</span>
            </div>
            {pkg.Discount_Percent > 0 && (
              <div className="flex justify-between items-center mb-2 text-success">
                <span className="text-sm">Discount ({pkg.Discount_Percent}%)</span>
                <span className="text-sm">-${((pkg.Price_USD * pkg.Discount_Percent / 100) * formData.travelers).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Travelers</span>
              <span className="text-sm">×{formData.travelers}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">${finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleBooking} disabled={loading} className="w-full">
            {loading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
