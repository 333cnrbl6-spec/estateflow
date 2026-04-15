import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { isAudioEnabled, enableAudioFeedback, disableAudioFeedback, audioNotifications } from '@/lib/audioNotifications';

export default function AudioToggle() {
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    setAudioEnabled(isAudioEnabled());
  }, []);

  const handleToggle = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    if (newState) {
      enableAudioFeedback();
      audioNotifications.success();
    } else {
      disableAudioFeedback();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={audioEnabled ? 'Disable audio feedback' : 'Enable audio feedback'}
      className="h-8 w-8"
    >
      {audioEnabled ? (
        <Volume2 className="w-4 h-4 text-muted-foreground" />
      ) : (
        <VolumeX className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );
}