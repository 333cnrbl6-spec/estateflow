// Audio notification system with compliance-themed sounds
export const audioNotifications = {
  // Loading/Processing
  processing: () => playTone(440, 0.1, 0.1), // A4 tone for processing start
  
  // Success/Completion
  success: () => {
    playTone(523.25, 0.15, 0.1); // C5
    setTimeout(() => playTone(659.25, 0.15, 0.1), 150); // E5
    setTimeout(() => playTone(783.99, 0.2, 0.15), 300); // G5 (compliance chime)
  },
  
  // Warning/Threat
  threat: () => {
    playTone(392, 0.2, 0.15); // G4 (lower, warning)
    setTimeout(() => playTone(392, 0.2, 0.15), 200);
  },
  
  // Compliance Alert
  complianceAlert: () => {
    playTone(659.25, 0.15, 0.1); // E5
    setTimeout(() => playTone(523.25, 0.15, 0.1), 150); // C5
    setTimeout(() => playTone(659.25, 0.15, 0.1), 300); // E5
  },
  
  // Task Complete
  taskComplete: () => {
    playTone(659.25, 0.1, 0.08);
    setTimeout(() => playTone(783.99, 0.1, 0.08), 100);
  },
};

function playTone(frequency, duration, volume = 0.3) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Audio context not available or user has disabled audio
    console.debug('Audio unavailable');
  }
}

export function enableAudioFeedback() {
  localStorage.setItem('premiso_audio_enabled', 'true');
}

export function disableAudioFeedback() {
  localStorage.setItem('premiso_audio_enabled', 'false');
}

export function isAudioEnabled() {
  return localStorage.getItem('premiso_audio_enabled') !== 'false';
}