import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PageNarratorProps {
  content: string;
  buttonLabel?: string;
  autoPlay?: boolean;
  className?: string;
}

const PageNarrator: React.FC<PageNarratorProps> = ({
  content,
  buttonLabel = "Read aloud",
  autoPlay = false,
  className = "",
}) => {
  const { speak, stopSpeaking, isSpeaking } = useVoiceAssistant();

  useEffect(() => {
    if (autoPlay && content) {
      speak(content);
    }
    return () => stopSpeaking();
  }, [autoPlay, content, speak, stopSpeaking]);

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          className={className}
          aria-label={isSpeaking ? "Stop reading" : buttonLabel}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 mr-2" />
              {buttonLabel}
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isSpeaking ? "Stop narration" : "Listen to page content"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default PageNarrator;
