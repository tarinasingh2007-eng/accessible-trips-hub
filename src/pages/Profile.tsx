import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  full_name: string;
  phone_number: string;
  country: string;
  city: string;
  age: number | null;
  gender: string;
  disability_type: string;
  accessibility_needs: string;
  preferred_transport: string;
  preferred_accommodation: string;
  medical_conditions: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone_number: '',
    country: '',
    city: '',
    age: null,
    gender: '',
    disability_type: '',
    accessibility_needs: '',
    preferred_transport: '',
    preferred_accommodation: '',
    medical_conditions: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profile,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={profile.phone_number}
                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disability_type">Disability Type (if any)</Label>
                <Input
                  id="disability_type"
                  value={profile.disability_type}
                  onChange={(e) => setProfile({ ...profile, disability_type: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessibility_needs">Accessibility Needs</Label>
                <Textarea
                  id="accessibility_needs"
                  value={profile.accessibility_needs}
                  onChange={(e) => setProfile({ ...profile, accessibility_needs: e.target.value })}
                  placeholder="Describe any accessibility requirements..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_transport">Preferred Transport</Label>
                  <Input
                    id="preferred_transport"
                    value={profile.preferred_transport}
                    onChange={(e) => setProfile({ ...profile, preferred_transport: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_accommodation">Preferred Accommodation</Label>
                  <Input
                    id="preferred_accommodation"
                    value={profile.preferred_accommodation}
                    onChange={(e) => setProfile({ ...profile, preferred_accommodation: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_conditions">Medical Conditions</Label>
                <Textarea
                  id="medical_conditions"
                  value={profile.medical_conditions}
                  onChange={(e) => setProfile({ ...profile, medical_conditions: e.target.value })}
                  placeholder="List any medical conditions we should be aware of..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={profile.emergency_contact_name}
                    onChange={(e) => setProfile({ ...profile, emergency_contact_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
                  <Input
                    id="emergency_contact_number"
                    value={profile.emergency_contact_number}
                    onChange={(e) => setProfile({ ...profile, emergency_contact_number: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
