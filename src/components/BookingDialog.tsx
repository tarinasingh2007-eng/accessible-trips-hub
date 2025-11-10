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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const bookingFormSchema = z.object({
  travelers: z.number()
    .int('Must be a whole number')
    .positive('Must be at least 1 traveler')
    .min(1, 'Must be at least 1 traveler'),
  startDate: z.string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Start date must be today or in the future'),
  endDate: z.string()
    .min(1, 'End date is required'),
  specialRequirements: z.string()
    .max(1000, 'Special requirements must be less than 1000 characters')
    .optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingDialogProps {
  package: TravelPackage;
}

export default function BookingDialog({ package: pkg }: BookingDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema.refine((data) => {
      return data.travelers <= pkg.Available_Slots;
    }, {
      message: `Maximum ${pkg.Available_Slots} travelers available`,
      path: ['travelers'],
    })),
    defaultValues: {
      travelers: 1,
      startDate: pkg.Start_Date,
      endDate: pkg.End_Date,
      specialRequirements: '',
    },
  });

  const travelers = form.watch('travelers');
  const finalPrice = pkg.Price_USD * (1 - pkg.Discount_Percent / 100) * travelers;

  const handleBooking = async (values: BookingFormValues) => {
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
        travel_start_date: values.startDate,
        travel_end_date: values.endDate,
        number_of_travelers: values.travelers,
        total_price: finalPrice,
        status: 'pending',
        special_requirements: values.specialRequirements || null,
      });

      if (error) throw error;

      toast({
        title: 'Booking Successful!',
        description: 'Your booking has been created. Check your bookings page for details.',
      });
      setOpen(false);
      form.reset();
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleBooking)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="travelers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Travelers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={pkg.Available_Slots}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any accessibility needs, dietary restrictions, etc. (max 1000 characters)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Base Price (per person)</span>
                <span className="text-sm">${pkg.Price_USD.toLocaleString()}</span>
              </div>
              {pkg.Discount_Percent > 0 && (
                <div className="flex justify-between items-center mb-2 text-success">
                  <span className="text-sm">Discount ({pkg.Discount_Percent}%)</span>
                  <span className="text-sm">-${((pkg.Price_USD * pkg.Discount_Percent / 100) * travelers).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Travelers</span>
                <span className="text-sm">×{travelers}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">${finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
