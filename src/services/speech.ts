import { Language } from '../types';

export function getLanguageCode(lang: Language): string {
  switch (lang) {
    case 'Hindi':
      return 'hi-IN';
    case 'Gujarati':
      return 'gu-IN';
    case 'English':
    default:
      return 'en-US';
  }
}

export type SpeechVisualState = 'ready' | 'listening' | 'processing' | 'success' | 'error';

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onAudioStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string, isPermissionError?: boolean) => void;
  onEnd?: () => void;
}

export class SpeechService {
  private activeRecognition: any = null;
  private isListening = false;
  private audioStream: MediaStream | null = null;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public async requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { granted: false, error: 'Audio capture API is not supported in this browser.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release tracks immediately after verifying permission
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return {
          granted: false,
          error: 'Microphone permission was denied. Please allow microphone access in your browser address bar settings.',
        };
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        return {
          granted: false,
          error: 'No microphone hardware found. Please connect a microphone or use keyboard input.',
        };
      }
      return {
        granted: false,
        error: err.message || 'Could not access audio hardware.',
      };
    }
  }

  public async startListening(
    language: Language,
    handlers: SpeechRecognitionHandlers
  ): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      handlers.onError?.(
        'Speech Recognition is not supported by your browser. Please type your query in the text box below.',
        false
      );
      return false;
    }

    // Stop any existing session
    this.stopListening();

    // Verify microphone hardware permission first
    const perm = await this.requestMicrophonePermission();
    if (!perm.granted) {
      handlers.onError?.(perm.error || 'Microphone access denied.', true);
      return false;
    }

    try {
      // Create a fresh instance for every listening session to prevent InvalidStateError
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getLanguageCode(language);
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListening = true;
        handlers.onStart?.();
      };

      recognition.onaudiostart = () => {
        handlers.onAudioStart?.();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);
        handlers.onResult?.(currentText, isFinal);
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        let message = 'Microphone speech recognition encountered an error.';
        let isPerm = false;

        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            message = 'Microphone permission blocked. Please enable microphone permissions in your browser.';
            isPerm = true;
            break;
          case 'no-speech':
            message = 'No speech detected. Please speak closer to your microphone or retry.';
            break;
          case 'network':
            message = 'Network speech service unavailable. (Browser speech-to-text requires internet or on-device offline pack). Please use text input.';
            break;
          case 'audio-capture':
            message = 'Audio capture hardware error. Please check your microphone connection.';
            break;
          case 'aborted':
            // Intentional cancel, don't show alarming error
            return;
          default:
            message = `Speech recognition error: ${event.error}`;
        }

        handlers.onError?.(message, isPerm);
      };

      recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd?.();
      };

      this.activeRecognition = recognition;
      recognition.start();
      return true;
    } catch (err: any) {
      console.warn('SpeechRecognition launch error:', err);
      handlers.onError?.(err?.message || 'Failed to start microphone recognition.', false);
      this.isListening = false;
      return false;
    }
  }

  public stopListening(): void {
    this.isListening = false;
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch (e) {
        try {
          this.activeRecognition.abort();
        } catch (e2) {
          // ignore
        }
      }
      this.activeRecognition = null;
    }
  }

  public speak(text: string, language: Language, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/[#*_`$]/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .slice(0, 350);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = getLanguageCode(language);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = getLanguageCode(language).slice(0, 2);
      const matched = voices.find((v) => v.lang.startsWith(langPrefix));
      if (matched) {
        utterance.voice = matched;
      }

      utterance.onend = () => {
        onEnd?.();
      };
      utterance.onerror = () => {
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      onEnd?.();
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const speechService = new SpeechService();
