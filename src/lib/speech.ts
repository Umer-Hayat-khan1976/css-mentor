// Web Speech API Helper for CSS Mentor

export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
};

export const getSpeechRecognition = (): any => {
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  // Use English with a touch of Pakistani-friendly accent or standard English
  recognition.lang = 'en-US'; 
  return recognition;
};

// Simple text-to-speech speak function
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakText = (text: string, onEnd?: () => void, onStart?: () => void): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip Markdown characters for cleaner speech synthesis
  const cleanText = text
    .replace(/[*#_`~]/g, '') // strip markdown markers
    .replace(/\[.*?\]\(.*?\)/g, '') // strip links
    .replace(/[•-]\s+/g, '') // strip list bullet points
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;

  // Find a nice natural English voice if possible
  const voices = window.speechSynthesis.getVoices();
  // Prefer natural sounding English voices
  const preferredVoice = voices.find(v => 
    v.name.includes('Natural') && v.lang.startsWith('en')
  ) || voices.find(v => 
    v.lang.startsWith('en-GB') // elegant sounding British/academic english
  ) || voices.find(v => 
    v.lang.startsWith('en')
  );

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  // Set parameters for polite, friendly senior mentor tone
  utterance.pitch = 1.05; // Slightly warmer/friendly pitch
  utterance.rate = 0.95;  // Calm, reassuring pace (not rushed)

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.error("Speech Synthesis Error:", e);
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
