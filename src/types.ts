/**
 * Types and interfaces for the Biblioteca Sagrada application.
 */

export type TabType = 'home' | 'oracoes' | 'salmos' | 'audios' | 'novenas' | 'personalizado' | 'comunidade';

export interface CommunityPrayer {
  id: string;
  name: string;
  request: string;
  prayersCount: number;
  createdAt: string;
  category: 'protecao' | 'prosperidade' | 'cura_interior' | 'restauracao' | 'fortalecimento' | 'outros';
}

export interface Prayer {
  id: string;
  title: string;
  category: 'protecao' | 'prosperidade' | 'cura_interior' | 'restauracao' | 'fortalecimento';
  text: string[];
  intro?: string;
  source?: string;
}

export interface Psalm {
  id: string;
  number: number;
  title: string;
  theme: string;
  verses: { number: number; text: string }[];
  reflection: string;
}

export interface GuidedAudio {
  id: string;
  title: string;
  duration: string;
  description: string;
  focus: string;
  audioMode: 'anxiety' | 'sleep' | 'protection' | 'inner_peace';
}

export interface Novena {
  id: string;
  title: string;
  description: string;
  target: string;
  days: {
    dayNum: number;
    title: string;
    prayer: string;
    contemplation: string;
  }[];
}

export interface SavedPrayer {
  id: string;
  timestamp: string;
  title: string;
  greeting: string;
  prayerParagraphs: string[];
  bibleVerse: string;
  bibleText: string;
  spiritualExercise: string;
  feeling: string;
  situation?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  devotionalFocus: 'protecao' | 'prosperidade' | 'cura_interior' | 'restauracao' | 'fortalecimento' | 'paz_geral';
}

