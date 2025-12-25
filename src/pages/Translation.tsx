import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRightLeft, Mic, MicOff, Volume2, Hand, Loader2, Play, ExternalLink } from 'lucide-react';
import { useVoiceAssistant, SUPPORTED_LANGUAGES } from '@/hooks/useVoiceAssistant';
import PageNarrator from '@/components/PageNarrator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ASL sign language with YouTube video links for each sign
const ASL_SIGNS: Record<string, { emoji: string; videoUrl: string; description: string }> = {
  'hello': { emoji: '👋', videoUrl: 'https://www.youtube.com/watch?v=HYIlNPQT3Ek', description: 'Wave hand near forehead' },
  'hi': { emoji: '👋', videoUrl: 'https://www.youtube.com/watch?v=HYIlNPQT3Ek', description: 'Wave hand near forehead' },
  'thank you': { emoji: '🙏', videoUrl: 'https://www.youtube.com/watch?v=fxnPfKgF5E8', description: 'Touch chin, move hand forward' },
  'thanks': { emoji: '🙏', videoUrl: 'https://www.youtube.com/watch?v=fxnPfKgF5E8', description: 'Touch chin, move hand forward' },
  'please': { emoji: '🤲', videoUrl: 'https://www.youtube.com/watch?v=0LKvpMBwJzw', description: 'Circular motion on chest' },
  'yes': { emoji: '👍', videoUrl: 'https://www.youtube.com/watch?v=pKsVbQbqjn0', description: 'Fist nodding up and down' },
  'no': { emoji: '👎', videoUrl: 'https://www.youtube.com/watch?v=KWYNGLhXh-k', description: 'Index and middle finger tap thumb' },
  'help': { emoji: '🆘', videoUrl: 'https://www.youtube.com/watch?v=6x3kcG0tWJU', description: 'Thumb up on palm, lift up' },
  'i love you': { emoji: '🤟', videoUrl: 'https://www.youtube.com/watch?v=1ihOFRxJwZQ', description: 'Pinky, index, thumb extended' },
  'love': { emoji: '❤️', videoUrl: 'https://www.youtube.com/watch?v=8eW_-cMq7vs', description: 'Cross arms over chest' },
  'good': { emoji: '👌', videoUrl: 'https://www.youtube.com/watch?v=3xNp8KzflNg', description: 'Touch chin, move hand down' },
  'bad': { emoji: '👎', videoUrl: 'https://www.youtube.com/watch?v=MZlnrlPGUuM', description: 'Touch chin, flip hand down' },
  'sorry': { emoji: '😔', videoUrl: 'https://www.youtube.com/watch?v=8sAEoQz4xDk', description: 'Fist circles on chest' },
  'excuse me': { emoji: '🙏', videoUrl: 'https://www.youtube.com/watch?v=PB8v6eLpKAU', description: 'Brush fingers across palm' },
  'goodbye': { emoji: '👋', videoUrl: 'https://www.youtube.com/watch?v=Xp0LTdgVqpM', description: 'Open-close hand wave' },
  'bye': { emoji: '👋', videoUrl: 'https://www.youtube.com/watch?v=Xp0LTdgVqpM', description: 'Open-close hand wave' },
  'name': { emoji: '✍️', videoUrl: 'https://www.youtube.com/watch?v=L1fGMHB4TqE', description: 'Tap two fingers together' },
  'my name': { emoji: '✍️', videoUrl: 'https://www.youtube.com/watch?v=L1fGMHB4TqE', description: 'Point to self, then tap fingers' },
  'what': { emoji: '❓', videoUrl: 'https://www.youtube.com/watch?v=OJqEfW0DT_c', description: 'Shake index finger side to side' },
  'where': { emoji: '📍', videoUrl: 'https://www.youtube.com/watch?v=wq1zQDlVfhU', description: 'Point index finger, shake' },
  'when': { emoji: '⏰', videoUrl: 'https://www.youtube.com/watch?v=H_LfuLLIhWE', description: 'Circle index around other index' },
  'who': { emoji: '👤', videoUrl: 'https://www.youtube.com/watch?v=l-zRYr1g8X4', description: 'Circle thumb near chin' },
  'why': { emoji: '🤔', videoUrl: 'https://www.youtube.com/watch?v=7tN_EkpAlZA', description: 'Touch forehead, Y handshape' },
  'how': { emoji: '❓', videoUrl: 'https://www.youtube.com/watch?v=J_2rIU0_jsA', description: 'Knuckles together, roll forward' },
  'water': { emoji: '💧', videoUrl: 'https://www.youtube.com/watch?v=PjLvS-MJNkE', description: 'W shape taps chin' },
  'food': { emoji: '🍽️', videoUrl: 'https://www.youtube.com/watch?v=DlMgkLdqFZI', description: 'Fingertips to mouth' },
  'eat': { emoji: '🍽️', videoUrl: 'https://www.youtube.com/watch?v=DlMgkLdqFZI', description: 'Fingertips to mouth' },
  'drink': { emoji: '🥤', videoUrl: 'https://www.youtube.com/watch?v=vYl2eo3OSBU', description: 'Thumb to mouth, tilt hand' },
  'bathroom': { emoji: '🚻', videoUrl: 'https://www.youtube.com/watch?v=hWSB9d5VbnA', description: 'Shake T handshape' },
  'restroom': { emoji: '🚻', videoUrl: 'https://www.youtube.com/watch?v=hWSB9d5VbnA', description: 'Shake T handshape' },
  'toilet': { emoji: '🚻', videoUrl: 'https://www.youtube.com/watch?v=hWSB9d5VbnA', description: 'Shake T handshape' },
  'hospital': { emoji: '🏥', videoUrl: 'https://www.youtube.com/watch?v=CY0E1CzLVBQ', description: 'Draw cross on upper arm' },
  'doctor': { emoji: '👨‍⚕️', videoUrl: 'https://www.youtube.com/watch?v=RLXz_IA-5zA', description: 'Tap wrist with fingers' },
  'nurse': { emoji: '👩‍⚕️', videoUrl: 'https://www.youtube.com/watch?v=iVNmR5Y-lJw', description: 'N shape on wrist pulse' },
  'medicine': { emoji: '💊', videoUrl: 'https://www.youtube.com/watch?v=cJVp_Fm97ZY', description: 'Middle finger circles palm' },
  'pain': { emoji: '😣', videoUrl: 'https://www.youtube.com/watch?v=XmxQYUZlZ8Y', description: 'Index fingers point, twist' },
  'hurt': { emoji: '🤕', videoUrl: 'https://www.youtube.com/watch?v=XmxQYUZlZ8Y', description: 'Index fingers point, twist' },
  'sick': { emoji: '🤒', videoUrl: 'https://www.youtube.com/watch?v=QeOsmwKHgEs', description: 'Middle fingers touch head and stomach' },
  'emergency': { emoji: '🚨', videoUrl: 'https://www.youtube.com/watch?v=k_4n8Z6Wh2w', description: 'E handshape, shake side to side' },
  'call': { emoji: '📞', videoUrl: 'https://www.youtube.com/watch?v=3y8q7TnHGGE', description: 'Y hand to ear' },
  'phone': { emoji: '📱', videoUrl: 'https://www.youtube.com/watch?v=3y8q7TnHGGE', description: 'Y hand to ear' },
  'wheelchair': { emoji: '♿', videoUrl: 'https://www.youtube.com/watch?v=5wjb4LGqnLc', description: 'Bent fingers move forward' },
  'deaf': { emoji: '🧏', videoUrl: 'https://www.youtube.com/watch?v=rCXRVNDXmMQ', description: 'Point to ear, then mouth' },
  'blind': { emoji: '👁️', videoUrl: 'https://www.youtube.com/watch?v=mME87fL6vgE', description: 'V fingers from eyes down' },
  'friend': { emoji: '🤝', videoUrl: 'https://www.youtube.com/watch?v=N_YnuJuMf5M', description: 'Hook index fingers together' },
  'family': { emoji: '👨‍👩‍👧‍👦', videoUrl: 'https://www.youtube.com/watch?v=bDJ-cC8IQZY', description: 'F handshapes circle forward' },
  'mother': { emoji: '👩', videoUrl: 'https://www.youtube.com/watch?v=d3Kc9Gw0-q4', description: 'Open 5 hand, thumb on chin' },
  'mom': { emoji: '👩', videoUrl: 'https://www.youtube.com/watch?v=d3Kc9Gw0-q4', description: 'Open 5 hand, thumb on chin' },
  'father': { emoji: '👨', videoUrl: 'https://www.youtube.com/watch?v=PV1P8NGWm3Q', description: 'Open 5 hand, thumb on forehead' },
  'dad': { emoji: '👨', videoUrl: 'https://www.youtube.com/watch?v=PV1P8NGWm3Q', description: 'Open 5 hand, thumb on forehead' },
  'home': { emoji: '🏠', videoUrl: 'https://www.youtube.com/watch?v=M5u8R8mOFhw', description: 'Flat O to cheek, then jaw' },
  'work': { emoji: '💼', videoUrl: 'https://www.youtube.com/watch?v=u3qCgIQ4ZzI', description: 'Tap fist on other fist' },
  'school': { emoji: '🏫', videoUrl: 'https://www.youtube.com/watch?v=ORq8sHSFlNE', description: 'Clap hands twice' },
  'learn': { emoji: '📚', videoUrl: 'https://www.youtube.com/watch?v=x3n4_Yb8m6Q', description: 'Grab from palm to forehead' },
  'understand': { emoji: '💡', videoUrl: 'https://www.youtube.com/watch?v=Fg6X2-hc3pU', description: 'Flick index finger up near temple' },
  'dont understand': { emoji: '❌', videoUrl: 'https://www.youtube.com/watch?v=HmgQ8N57FHI', description: 'Flick down near temple' },
  'again': { emoji: '🔄', videoUrl: 'https://www.youtube.com/watch?v=6wqAJGmG9yQ', description: 'Bent hand arcs to flat palm' },
  'more': { emoji: '➕', videoUrl: 'https://www.youtube.com/watch?v=cAZN-2_7-ug', description: 'Flat O hands tap together' },
  'stop': { emoji: '🛑', videoUrl: 'https://www.youtube.com/watch?v=h7_1WpI0W6Y', description: 'Flat hand chops other palm' },
  'wait': { emoji: '⏳', videoUrl: 'https://www.youtube.com/watch?v=nIIYRr8n1IM', description: 'Wiggle fingers of both hands' },
  'slow': { emoji: '🐢', videoUrl: 'https://www.youtube.com/watch?v=uQ2lKB3mLAI', description: 'Slide hand slowly up arm' },
  'fast': { emoji: '⚡', videoUrl: 'https://www.youtube.com/watch?v=4YJFvQlw1rE', description: 'Pull hands back quickly' },
  'happy': { emoji: '😊', videoUrl: 'https://www.youtube.com/watch?v=cNVhPMFxCqk', description: 'Brush chest upward twice' },
  'sad': { emoji: '😢', videoUrl: 'https://www.youtube.com/watch?v=nJMVYJG0TaM', description: 'Drag hands down face' },
  'tired': { emoji: '😴', videoUrl: 'https://www.youtube.com/watch?v=GShYHTZrOjg', description: 'Bent hands drop from chest' },
  'hungry': { emoji: '😋', videoUrl: 'https://www.youtube.com/watch?v=Vj8U0aYpZpY', description: 'C hand moves down from throat' },
  'thirsty': { emoji: '🥵', videoUrl: 'https://www.youtube.com/watch?v=rN6OiR9xMvQ', description: 'Index traces down throat' },
  'hot': { emoji: '🥵', videoUrl: 'https://www.youtube.com/watch?v=kF8Zn7TLQRA', description: 'Claw hand from mouth, twist away' },
  'cold': { emoji: '🥶', videoUrl: 'https://www.youtube.com/watch?v=Qf7NB7EqMv8', description: 'Fists shake like shivering' },
  'big': { emoji: '📏', videoUrl: 'https://www.youtube.com/watch?v=_kMRYk-A0u4', description: 'L hands move apart' },
  'small': { emoji: '🤏', videoUrl: 'https://www.youtube.com/watch?v=3P8pWLqNIQY', description: 'Flat hands move closer' },
  'money': { emoji: '💰', videoUrl: 'https://www.youtube.com/watch?v=kOxTN-N5o8s', description: 'Tap back of hand on palm' },
  'time': { emoji: '⏰', videoUrl: 'https://www.youtube.com/watch?v=Kj7w0SvyKQo', description: 'Tap wrist with index finger' },
  'today': { emoji: '📅', videoUrl: 'https://www.youtube.com/watch?v=4J9J-RKJM-U', description: 'Y hands drop down together' },
  'tomorrow': { emoji: '📆', videoUrl: 'https://www.youtube.com/watch?v=k3xmLOPR1nY', description: 'Thumb on cheek, arc forward' },
  'yesterday': { emoji: '📆', videoUrl: 'https://www.youtube.com/watch?v=VdC-cD4-M6w', description: 'Thumb to cheek, arc back' },
  'now': { emoji: '👇', videoUrl: 'https://www.youtube.com/watch?v=Nx9LvQOWvHw', description: 'Y hands drop down together' },
  'later': { emoji: '🕐', videoUrl: 'https://www.youtube.com/watch?v=dZxE6iBXiYw', description: 'L hand tilts forward' },
};

// Get all available phrases for display
const AVAILABLE_PHRASES = Object.keys(ASL_SIGNS).sort();

const Translation: React.FC = () => {
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [signLanguageOutput, setSignLanguageOutput] = useState<Array<{ word: string; emoji: string; videoUrl: string; description: string }>>([]);
  const [currentGestureIndex, setCurrentGestureIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ word: string; url: string } | null>(null);

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

  // Real translation using Lovable AI
  const translateText = useCallback(async (text: string, from: string, to: string): Promise<string> => {
    setIsTranslating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, sourceLanguage: from, targetLanguage: to }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.translation;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Translation error:', error);
      }
      toast.error('Translation failed. Please try again.');
      return '';
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Convert text to sign language with video links
  const textToSignLanguage = useCallback((text: string) => {
    const words = text.toLowerCase().trim();
    const results: Array<{ word: string; emoji: string; videoUrl: string; description: string }> = [];
    
    // First check for exact phrase matches
    const sortedPhrases = Object.keys(ASL_SIGNS).sort((a, b) => b.length - a.length);
    let remainingText = words;
    
    for (const phrase of sortedPhrases) {
      if (remainingText.includes(phrase)) {
        const sign = ASL_SIGNS[phrase];
        results.push({
          word: phrase,
          emoji: sign.emoji,
          videoUrl: sign.videoUrl,
          description: sign.description
        });
        remainingText = remainingText.replace(phrase, '').trim();
      }
    }
    
    // Check individual words that weren't matched
    const remainingWords = remainingText.split(/\s+/).filter(w => w.length > 0);
    for (const word of remainingWords) {
      if (ASL_SIGNS[word]) {
        const sign = ASL_SIGNS[word];
        results.push({
          word,
          emoji: sign.emoji,
          videoUrl: sign.videoUrl,
          description: sign.description
        });
      }
    }
    
    return results;
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
      }, 1500);
      
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
    if (gestures.length === 0) {
      toast.info('No matching signs found. Try common words like: hello, thank you, help, hospital, emergency');
    }
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

  const openVideoInNewTab = (videoUrl: string) => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
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
                <CardDescription>Translate text between multiple languages using AI</CardDescription>
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

                  {sourceText && !isListening && (
                    <Button onClick={handleTranslate} disabled={isTranslating} className="w-full max-w-md">
                      {isTranslating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        'Translate'
                      )}
                    </Button>
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
                  ASL Sign Language Translation
                </CardTitle>
                <CardDescription>Convert text to American Sign Language with video demonstrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter text to convert to sign language..."
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
                      <div className="text-center space-y-2">
                        <span className="text-8xl animate-bounce block" key={currentGestureIndex}>
                          {signLanguageOutput[currentGestureIndex]?.emoji}
                        </span>
                        <p className="text-xl font-semibold text-foreground">
                          "{signLanguageOutput[currentGestureIndex]?.word}"
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {signLanguageOutput[currentGestureIndex]?.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openVideoInNewTab(signLanguageOutput[currentGestureIndex]?.videoUrl)}
                          className="mt-2"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Video
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                          Sign {currentGestureIndex + 1} of {signLanguageOutput.length}
                        </p>
                      </div>
                    </div>

                    {/* All Gestures Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
                      {signLanguageOutput.map((gesture, index) => (
                        <Card
                          key={index}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            index === currentGestureIndex 
                              ? 'ring-2 ring-primary bg-primary/10' 
                              : ''
                          }`}
                          onClick={() => {
                            setCurrentGestureIndex(index);
                            setIsAnimating(false);
                          }}
                        >
                          <CardContent className="p-3 text-center space-y-1">
                            <span className="text-3xl block">{gesture.emoji}</span>
                            <p className="text-sm font-medium truncate">{gesture.word}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                openVideoInNewTab(gesture.videoUrl);
                              }}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Video
                            </Button>
                          </CardContent>
                        </Card>
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

                {/* Available Phrases */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Available ASL Signs ({AVAILABLE_PHRASES.length})</CardTitle>
                    <CardDescription>Click any phrase to see its sign language video</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                      {AVAILABLE_PHRASES.map((phrase) => (
                        <Button
                          key={phrase}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setSourceText(phrase);
                            const sign = ASL_SIGNS[phrase];
                            setSignLanguageOutput([{
                              word: phrase,
                              emoji: sign.emoji,
                              videoUrl: sign.videoUrl,
                              description: sign.description
                            }]);
                            setCurrentGestureIndex(0);
                          }}
                        >
                          {ASL_SIGNS[phrase].emoji} {phrase}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Translation;
