import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRightLeft, Mic, MicOff, Volume2, Hand, Loader2 } from 'lucide-react';
import { useVoiceAssistant, SUPPORTED_LANGUAGES } from '@/hooks/useVoiceAssistant';
import PageNarrator from '@/components/PageNarrator';

// Sign language hand gesture images (using Unicode signs as placeholders)
const SIGN_LANGUAGE_GESTURES: Record<string, string[]> = {
  'hello': ['👋'],
  'thank you': ['🙏'],
  'please': ['🤲'],
  'yes': ['👍'],
  'no': ['👎'],
  'help': ['🆘', '👐'],
  'i love you': ['🤟'],
  'good': ['👌'],
  'bad': ['👎'],
  'sorry': ['😔', '🙏'],
  'goodbye': ['👋', '😊'],
  'name': ['👆', '✍️'],
  'water': ['💧', '🤲'],
  'food': ['🍽️', '👄'],
  'bathroom': ['🚻'],
  'hospital': ['🏥', '➡️'],
  'emergency': ['🚨', '🆘'],
  'wheelchair': ['♿'],
};

const Translation: React.FC = () => {
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [signLanguageOutput, setSignLanguageOutput] = useState<string[]>([]);
  const [currentGestureIndex, setCurrentGestureIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    speak,
    startListening,
    stopListening,
    isListening,
    transcript,
    setTranscript,
    settings,
    setSettings,
  } = useVoiceAssistant();

  // Simple translation using browser's built-in (fallback to mock)
  const translateText = useCallback(async (text: string, from: string, to: string): Promise<string> => {
    setIsTranslating(true);
    
    // Simulate translation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock translations for demo (in production, use Google Translate API)
    const mockTranslations: Record<string, Record<string, string>> = {
      'hello': { 'es-ES': 'hola', 'fr-FR': 'bonjour', 'de-DE': 'hallo', 'it-IT': 'ciao', 'ja-JP': 'こんにちは', 'zh-CN': '你好', 'hi-IN': 'नमस्ते' },
      'thank you': { 'es-ES': 'gracias', 'fr-FR': 'merci', 'de-DE': 'danke', 'it-IT': 'grazie', 'ja-JP': 'ありがとう', 'zh-CN': '谢谢', 'hi-IN': 'धन्यवाद' },
      'help': { 'es-ES': 'ayuda', 'fr-FR': 'aide', 'de-DE': 'hilfe', 'it-IT': 'aiuto', 'ja-JP': '助けて', 'zh-CN': '帮助', 'hi-IN': 'मदद' },
      'where is the hospital': { 'es-ES': '¿Dónde está el hospital?', 'fr-FR': 'Où est l\'hôpital?', 'de-DE': 'Wo ist das Krankenhaus?', 'it-IT': 'Dov\'è l\'ospedale?', 'ja-JP': '病院はどこですか？', 'zh-CN': '医院在哪里？', 'hi-IN': 'अस्पताल कहाँ है?' },
      'i need wheelchair access': { 'es-ES': 'Necesito acceso para silla de ruedas', 'fr-FR': 'J\'ai besoin d\'un accès en fauteuil roulant', 'de-DE': 'Ich brauche Rollstuhlzugang', 'it-IT': 'Ho bisogno di accesso per sedie a rotelle' },
    };

    const lowerText = text.toLowerCase();
    const translation = mockTranslations[lowerText]?.[to];
    
    setIsTranslating(false);
    return translation || `[${to.split('-')[0].toUpperCase()}] ${text}`;
  }, []);

  // Convert text to sign language gestures
  const textToSignLanguage = useCallback((text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    const gestures: string[] = [];
    
    // Check for known phrases first
    for (const [phrase, signs] of Object.entries(SIGN_LANGUAGE_GESTURES)) {
      if (text.toLowerCase().includes(phrase)) {
        gestures.push(...signs);
      }
    }
    
    // If no matches, show letter-by-letter fingerspelling concept
    if (gestures.length === 0) {
      // Show hand emoji for each word as placeholder
      words.forEach(() => gestures.push('✋'));
    }
    
    return gestures;
  }, []);

  // Animate sign language gestures
  useEffect(() => {
    if (signLanguageOutput.length > 0 && isAnimating) {
      const timer = setInterval(() => {
        setCurrentGestureIndex(prev => {
          if (prev >= signLanguageOutput.length - 1) {
            setIsAnimating(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [signLanguageOutput.length, isAnimating]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    const result = await translateText(sourceText, sourceLanguage, targetLanguage);
    setTranslatedText(result);
  };

  const handleSignLanguageTranslate = () => {
    if (!sourceText.trim()) return;
    
    const gestures = textToSignLanguage(sourceText);
    setSignLanguageOutput(gestures);
    setCurrentGestureIndex(0);
    setIsAnimating(true);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setSourceText(transcript);
        setTranscript('');
      }
    } else {
      setSettings({ ...settings, language: sourceLanguage });
      startListening((text) => {
        setSourceText(text);
      });
    }
  };

  const handleSwapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const speakTranslation = () => {
    if (translatedText) {
      setSettings({ ...settings, language: targetLanguage });
      speak(translatedText);
    }
  };

  const pageDescription = "Translation page for sign language, voice, and text translation in multiple languages.";

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
              <h1 className="text-2xl font-bold text-foreground">Translation Services</h1>
            </div>
            <PageNarrator content={pageDescription} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="text" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text Translation</TabsTrigger>
            <TabsTrigger value="voice">Voice Translation</TabsTrigger>
            <TabsTrigger value="sign">Sign Language</TabsTrigger>
          </TabsList>

          {/* Text Translation */}
          <TabsContent value="text" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Text Translation</CardTitle>
                <CardDescription>Translate text between multiple languages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language Selectors */}
                <div className="flex items-center gap-4">
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="flex-1">
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

                  <Button variant="ghost" size="icon" onClick={handleSwapLanguages}>
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>

                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="flex-1">
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

                {/* Input/Output */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Enter text to translate..."
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      className="min-h-32"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVoiceInput}
                      className={isListening ? 'bg-destructive text-destructive-foreground' : ''}
                    >
                      {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {isListening ? 'Stop' : 'Voice Input'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Translation will appear here..."
                      value={translatedText}
                      readOnly
                      className="min-h-32 bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={speakTranslation}
                      disabled={!translatedText}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Listen
                    </Button>
                  </div>
                </div>

                <Button onClick={handleTranslate} disabled={!sourceText || isTranslating} className="w-full">
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Translate'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Translation */}
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voice Translation</CardTitle>
                <CardDescription>Speak in one language, hear in another</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language Selectors */}
                <div className="flex items-center gap-4">
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="flex-1">
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

                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />

                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="flex-1">
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

                {/* Voice Controls */}
                <div className="flex flex-col items-center gap-6 py-8">
                  <Button
                    size="lg"
                    className={`h-24 w-24 rounded-full ${isListening ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : ''}`}
                    onClick={handleVoiceInput}
                  >
                    {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </Button>
                  <p className="text-muted-foreground">
                    {isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
                  </p>

                  {transcript && (
                    <Card className="w-full">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">You said:</p>
                        <p className="font-medium">{transcript}</p>
                      </CardContent>
                    </Card>
                  )}

                  {translatedText && (
                    <Card className="w-full">
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Translation:</p>
                          <p className="font-medium">{translatedText}</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={speakTranslation}>
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Language */}
          <TabsContent value="sign" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hand className="h-5 w-5" />
                  Sign Language Translation
                </CardTitle>
                <CardDescription>Convert text to sign language gestures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter text to convert to sign language... (Try: hello, thank you, help, hospital, emergency)"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="min-h-24"
                />

                <Button onClick={handleSignLanguageTranslate} disabled={!sourceText} className="w-full">
                  <Hand className="h-4 w-4 mr-2" />
                  Convert to Sign Language
                </Button>

                {/* Sign Language Display */}
                {signLanguageOutput.length > 0 && (
                  <div className="space-y-4">
                    {/* Animated Current Gesture */}
                    <div className="flex justify-center items-center min-h-48 bg-muted rounded-lg">
                      <div className="text-center">
                        <span className="text-8xl animate-bounce" key={currentGestureIndex}>
                          {signLanguageOutput[currentGestureIndex]}
                        </span>
                        <p className="text-sm text-muted-foreground mt-4">
                          Gesture {currentGestureIndex + 1} of {signLanguageOutput.length}
                        </p>
                      </div>
                    </div>

                    {/* All Gestures */}
                    <div className="flex flex-wrap gap-4 justify-center p-4 bg-muted/50 rounded-lg">
                      {signLanguageOutput.map((gesture, index) => (
                        <div
                          key={index}
                          className={`text-4xl p-4 rounded-lg transition-all ${
                            index === currentGestureIndex 
                              ? 'bg-primary text-primary-foreground scale-125' 
                              : 'bg-card'
                          }`}
                        >
                          {gesture}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentGestureIndex(0);
                          setIsAnimating(true);
                        }}
                      >
                        Replay Animation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAnimating(!isAnimating)}
                      >
                        {isAnimating ? 'Pause' : 'Play'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Common Phrases */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Quick Phrases</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Hello', 'Thank you', 'Help', 'Hospital', 'Emergency', 'Wheelchair', 'Bathroom'].map((phrase) => (
                      <Button
                        key={phrase}
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSourceText(phrase);
                          const gestures = textToSignLanguage(phrase);
                          setSignLanguageOutput(gestures);
                          setCurrentGestureIndex(0);
                          setIsAnimating(true);
                        }}
                      >
                        {phrase}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Translation;
