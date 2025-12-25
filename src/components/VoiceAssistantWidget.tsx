import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Volume2, VolumeX, Settings, X, MessageCircle, Loader2 } from 'lucide-react';
import { useVoiceAssistant, SUPPORTED_LANGUAGES } from '@/hooks/useVoiceAssistant';
import { cn } from '@/lib/utils';

interface VoiceAssistantWidgetProps {
  pageContext?: string;
}

const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({ pageContext = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);

  const {
    settings,
    setSettings,
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    transcript,
    setTranscript,
    startWakeWordDetection,
    stopWakeWordDetection,
    wakeWordActive,
    supported,
  } = useVoiceAssistant();

  // Simple AI response logic (no external API needed)
  const generateResponse = useCallback((userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Travel-specific responses
    if (message.includes('accessibility') || message.includes('wheelchair')) {
      return "I can help you find accessible travel packages. Our curated packages include wheelchair-friendly accommodations, accessible transportation, and detailed accessibility information for each destination.";
    }
    if (message.includes('hospital') || message.includes('medical') || message.includes('emergency')) {
      return "For medical assistance, you can use our accessibility map to find nearby hospitals. You can also use the SOS button in our health vitals page for emergencies. Would you like me to guide you there?";
    }
    if (message.includes('book') || message.includes('booking') || message.includes('reserve')) {
      return "To book a travel package, simply browse our packages on the home page, select one you like, and click the Book Now button. You'll need to be logged in to complete your booking.";
    }
    if (message.includes('favorite') || message.includes('save')) {
      return "You can save your favorite packages by clicking the heart icon on any package card. View all your favorites from the Favorites page in the navigation menu.";
    }
    if (message.includes('profile') || message.includes('account')) {
      return "You can manage your profile, including accessibility needs and emergency contacts, from the Profile page. Click on your avatar in the top right corner to access it.";
    }
    if (message.includes('translate') || message.includes('translation') || message.includes('language')) {
      return "Our translation page supports sign language, voice translation, and text translation in multiple languages. You can access it from the navigation menu.";
    }
    if (message.includes('health') || message.includes('vitals') || message.includes('fitbit')) {
      return "The health vitals page shows your SpO2, heart rate, stress levels and more from your connected Fitbit. It also has an SOS button for emergencies.";
    }
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm Knight Guide, your travel accessibility assistant. I can help you find accessible travel packages, navigate the app, or answer questions about our services. How can I assist you today?";
    }
    if (message.includes('help') || message.includes('what can you do')) {
      return "I can help you with: finding accessible travel packages, booking trips, managing your profile, using the translation services, checking your health vitals, and finding nearby accessible facilities. Just ask!";
    }
    
    return "I'm here to help with your accessible travel needs. You can ask me about booking packages, finding wheelchair-accessible destinations, using the translation services, or navigating the app.";
  }, []);

  const handleUserMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    setConversation(prev => [...prev, { role: 'user', content: text }]);
    setIsProcessing(true);

    // Simulate processing time
    setTimeout(() => {
      const response = generateResponse(text);
      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
      speak(response);
      setIsProcessing(false);
    }, 500);

    setTranscript('');
  }, [generateResponse, speak, setTranscript]);

  const handleWakeWord = useCallback(() => {
    setIsOpen(true);
    speak("Hi! I'm Knight Guide. How can I help you today?");
  }, [speak]);

  useEffect(() => {
    if (!supported) {
      // Ensure detection is stopped when not supported
      stopWakeWordDetection();
      return;
    }

    if (wakeWordEnabled && !isOpen) {
      startWakeWordDetection(handleWakeWord);
    } else {
      stopWakeWordDetection();
    }

    return () => stopWakeWordDetection();
  }, [wakeWordEnabled, isOpen, startWakeWordDetection, stopWakeWordDetection, handleWakeWord]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        handleUserMessage(transcript);
      }
    } else {
      startListening((text) => {
        handleUserMessage(text);
      });
    }
  };

  const speakPageContent = () => {
    if (pageContext) {
      speak(pageContext);
    } else {
      speak("Welcome to Travel Assist. This app helps you find accessible travel packages tailored to your needs.");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          wakeWordActive && !isOpen && "animate-pulse ring-2 ring-primary"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-lg">Knight Guide</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={speakPageContent} title="Read Page">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} title="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!supported && (
              <div className="p-2 bg-destructive/10 text-destructive rounded-md text-sm">
                Speech recognition is not available in this browser. The voice features are disabled.
              </div>
            )}
            {/* Settings Panel */}
            {showSettings && (
              <div className="space-y-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Settings</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select
                    value={settings.gender}
                    onValueChange={(value: 'male' | 'female') => setSettings({ ...settings, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Speech Rate: {settings.rate.toFixed(1)}x</Label>
                  <Slider
                    value={[settings.rate]}
                    onValueChange={([value]) => setSettings({ ...settings, rate: value })}
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Wake Word ("Hey Knight Guide")</Label>
                  <Switch checked={wakeWordEnabled} onCheckedChange={setWakeWordEnabled} disabled={!supported} />
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={() => setShowSettings(false)}>
                    Save & Close
                  </Button>
                </div>
              </div>
            )}

            {/* Conversation */}
            <div className="h-48 overflow-y-auto space-y-2 p-2 bg-muted/50 rounded-lg">
              {conversation.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Say "Hey Knight Guide" or tap the mic to start
                </p>
              )}
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-2 rounded-lg text-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground ml-8" 
                      : "bg-card mr-8"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>

            {/* Transcript Display */}
            {isListening && transcript && (
              <div className="p-2 bg-muted rounded-lg text-sm">
                <span className="text-muted-foreground">Hearing: </span>
                {transcript}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className="rounded-full h-12 w-12"
                onClick={handleMicClick}
                disabled={!supported}
                title={!supported ? 'Speech recognition not supported in this browser' : undefined}
              >
                {!supported ? (
                  <MicOff className="h-5 w-5" />
                ) : isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              
              {isSpeaking && (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full h-12 w-12"
                  onClick={stopSpeaking}
                >
                  <VolumeX className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default VoiceAssistantWidget;
