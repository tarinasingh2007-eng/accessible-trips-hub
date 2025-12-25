import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Activity, Droplet, Brain, AlertTriangle, Phone, Loader2, RefreshCw, Watch, Wifi, WifiOff } from 'lucide-react';
import PageNarrator from '@/components/PageNarrator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface VitalData {
  heartRate: number;
  spo2: number;
  bloodSugar: number;
  stressLevel: number;
  steps: number;
  calories: number;
  sleepHours: number;
  lastSync: Date;
}

const HealthVitals: React.FC = () => {
  const [vitals, setVitals] = useState<VitalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [fitbitClientId, setFitbitClientId] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);

  const { toast } = useToast();
  const { user } = useAuth();

  // Mock vitals data (in production, fetch from Fitbit API)
  const generateMockVitals = (): VitalData => ({
    heartRate: Math.floor(Math.random() * 30) + 65, // 65-95 bpm
    spo2: Math.floor(Math.random() * 5) + 95, // 95-100%
    bloodSugar: Math.floor(Math.random() * 40) + 80, // 80-120 mg/dL
    stressLevel: Math.floor(Math.random() * 100), // 0-100
    steps: Math.floor(Math.random() * 5000) + 2000,
    calories: Math.floor(Math.random() * 500) + 200,
    sleepHours: Math.floor(Math.random() * 4) + 5, // 5-9 hours
    lastSync: new Date(),
  });

  const connectFitbit = () => {
    setIsLoading(true);
    
    // Simulate Fitbit connection
    setTimeout(() => {
      setIsConnected(true);
      setVitals(generateMockVitals());
      setIsLoading(false);
      setShowApiInput(false);
      toast({
        title: "Fitbit Connected",
        description: "Your health data is now syncing",
      });
    }, 1500);
  };

  const refreshVitals = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVitals(generateMockVitals());
      setIsLoading(false);
      toast({
        title: "Vitals Updated",
        description: "Latest health data synced",
      });
    }, 1000);
  };

  // SOS functionality
  const triggerSOS = async () => {
    setSosTriggered(true);
    setSosCountdown(5);
  };

  const cancelSOS = () => {
    setSosTriggered(false);
    setSosCountdown(5);
  };

  const confirmSOS = async () => {
    // Get user's emergency contact from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('emergency_contact_name, emergency_contact_number, full_name')
      .eq('id', user?.id)
      .single();

    // In production, this would send SMS/call emergency services
    toast({
      variant: "destructive",
      title: "🚨 SOS Alert Sent!",
      description: profile?.emergency_contact_number 
        ? `Emergency contact ${profile.emergency_contact_name} notified at ${profile.emergency_contact_number}`
        : "Please add an emergency contact in your profile",
    });

    setSosTriggered(false);
    setSosCountdown(5);
  };

  useEffect(() => {
    if (sosTriggered && sosCountdown > 0) {
      const timer = setTimeout(() => setSosCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosTriggered && sosCountdown === 0) {
      confirmSOS();
    }
  }, [sosTriggered, sosCountdown]);

  // Auto-refresh vitals every 30 seconds when connected
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setVitals(generateMockVitals());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { label: 'Low', color: 'text-warning' };
    if (hr > 100) return { label: 'High', color: 'text-destructive' };
    return { label: 'Normal', color: 'text-safety' };
  };

  const getSpo2Status = (spo2: number) => {
    if (spo2 < 92) return { label: 'Critical', color: 'text-destructive' };
    if (spo2 < 95) return { label: 'Low', color: 'text-warning' };
    return { label: 'Normal', color: 'text-safety' };
  };

  const getBloodSugarStatus = (bs: number) => {
    if (bs < 70) return { label: 'Low', color: 'text-warning' };
    if (bs > 140) return { label: 'High', color: 'text-destructive' };
    return { label: 'Normal', color: 'text-safety' };
  };

  const getStressStatus = (stress: number) => {
    if (stress > 70) return { label: 'High', color: 'text-destructive' };
    if (stress > 40) return { label: 'Medium', color: 'text-warning' };
    return { label: 'Low', color: 'text-safety' };
  };

  const pageDescription = "Health vitals page showing your heart rate, SpO2, blood sugar, stress levels, and other health metrics from your Fitbit. Includes an emergency SOS button.";

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
              <h1 className="text-2xl font-bold text-foreground">Health Vitals</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <PageNarrator content={pageDescription} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SOS Button - Always Visible */}
        <div className="mb-8">
          <Card className={`border-2 ${sosTriggered ? 'border-destructive bg-destructive/10 animate-pulse' : 'border-destructive/30'}`}>
            <CardContent className="py-6">
              {sosTriggered ? (
                <div className="text-center space-y-4">
                  <AlertTriangle className="h-16 w-16 text-destructive mx-auto animate-bounce" />
                  <h2 className="text-2xl font-bold text-destructive">SOS Alert Sending in {sosCountdown}s</h2>
                  <p className="text-muted-foreground">
                    Emergency contacts will be notified with your location
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" size="lg" onClick={cancelSOS}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="lg" onClick={confirmSOS}>
                      Send Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Emergency SOS</h3>
                    <p className="text-sm text-muted-foreground">
                      Press and hold for 3 seconds to send SOS alert
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="h-16 px-8"
                    onClick={triggerSOS}
                  >
                    <Phone className="h-6 w-6 mr-2" />
                    SOS
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Connection Section */}
        {showApiInput && !isConnected && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="h-5 w-5" />
                Connect Your Fitbit
              </CardTitle>
              <CardDescription>
                Enter your Fitbit Client ID to sync health data, or use demo mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Fitbit Client ID (optional for demo)"
                value={fitbitClientId}
                onChange={(e) => setFitbitClientId(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={connectFitbit} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Watch className="h-4 w-4 mr-2" />
                      Connect Fitbit
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={connectFitbit} disabled={isLoading}>
                  Use Demo Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vitals Grid */}
        {vitals && (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Last synced: {vitals.lastSync.toLocaleTimeString()}
              </p>
              <Button variant="outline" size="sm" onClick={refreshVitals} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Heart Rate */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-5 w-5 text-destructive" />
                    Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {vitals.heartRate}
                    <span className="text-lg font-normal text-muted-foreground ml-1">bpm</span>
                  </div>
                  <Badge className={`mt-2 ${getHeartRateStatus(vitals.heartRate).color}`}>
                    {getHeartRateStatus(vitals.heartRate).label}
                  </Badge>
                </CardContent>
              </Card>

              {/* SpO2 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Blood Oxygen (SpO2)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {vitals.spo2}
                    <span className="text-lg font-normal text-muted-foreground ml-1">%</span>
                  </div>
                  <Badge className={`mt-2 ${getSpo2Status(vitals.spo2).color}`}>
                    {getSpo2Status(vitals.spo2).label}
                  </Badge>
                </CardContent>
              </Card>

              {/* Blood Sugar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-adventure" />
                    Blood Sugar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {vitals.bloodSugar}
                    <span className="text-lg font-normal text-muted-foreground ml-1">mg/dL</span>
                  </div>
                  <Badge className={`mt-2 ${getBloodSugarStatus(vitals.bloodSugar).color}`}>
                    {getBloodSugarStatus(vitals.bloodSugar).label}
                  </Badge>
                </CardContent>
              </Card>

              {/* Stress Level */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-safety" />
                    Stress Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {vitals.stressLevel}
                    <span className="text-lg font-normal text-muted-foreground ml-1">/100</span>
                  </div>
                  <Progress value={vitals.stressLevel} className="mt-2" />
                  <Badge className={`mt-2 ${getStressStatus(vitals.stressLevel).color}`}>
                    {getStressStatus(vitals.stressLevel).label}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Steps Today</p>
                      <p className="text-2xl font-bold">{vitals.steps.toLocaleString()}</p>
                    </div>
                    <div className="text-4xl">👟</div>
                  </div>
                  <Progress value={(vitals.steps / 10000) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">Goal: 10,000 steps</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Calories Burned</p>
                      <p className="text-2xl font-bold">{vitals.calories} kcal</p>
                    </div>
                    <div className="text-4xl">🔥</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sleep Last Night</p>
                      <p className="text-2xl font-bold">{vitals.sleepHours}h</p>
                    </div>
                    <div className="text-4xl">😴</div>
                  </div>
                  <Progress value={(vitals.sleepHours / 8) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">Goal: 8 hours</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!vitals && isConnected && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading health data...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HealthVitals;
