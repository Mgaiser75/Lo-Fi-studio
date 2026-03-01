
export enum Mood {
  CHILL = 'Chill',
  NIGHT = 'Night',
  RAINY = 'Rainy',
  FOCUS = 'Focus',
  CODING = 'Coding',
  SLEEP = 'Sleep'
}

export enum VisualTheme {
  CLASSIC_ANIME = 'Classic Anime',
  CYBERPUNK = 'Cyberpunk',
  WATERCOLOR = 'Watercolor',
  RETRO_VHS = 'Retro VHS',
  MODERN_3D = 'Modern 3D'
}

export enum MusicProvider {
  BEATOVEN = 'Beatoven.ai',
  SOUNDRAW = 'SOUNDRAW',
  MUBERT = 'Mubert',
  SOUNDFUL = 'Soundful'
}

export interface Track {
  id: string;
  userId: string;
  title: string;
  mood: Mood;
  bpm: number;
  durationSeconds: number;
  audioUrl: string;
  isFavorite: boolean;
  provider: MusicProvider;
  createdAt: string;
}

export interface ExportData {
  timestampList: string;
  youtubeDescription: string;
  m3uContent: string;
  jsonConfig: string;
  titleSuggestion: string;
  seoTitle?: string;
  tags?: string[];
  thumbnailPrompt: string;
  videoResolution?: '720p' | '1080p';
  audioFormat?: 'WAV' | 'MP3' | 'AAC';
}

export interface Mix {
  id: string;
  userId: string;
  name: string;
  mood: Mood;
  visualTheme?: VisualTheme;
  totalDurationSeconds: number;
  crossfadeDuration: number;
  trackIds: string[]; // Ordered list of track IDs
  videoUrl?: string | null;
  introAudioUrl?: string | null; // New field for generated radio voice
  exportData?: ExportData | null;
  createdAt: string;
  isPublished: boolean;
}

export interface AIPromptResult {
  mood: Mood;
  bpmRange: { min: number; max: number };
  suggestedDuration: number;
  suggestedTitle: string;
  reasoning: string;
}

export enum AIProvider {
  GEMINI = 'Gemini',
  OPENAI = 'OpenAI',
  MISTRAL = 'Mistral',
  DEEPSEEK = 'DeepSeek',
  QWEN = 'Qwen',
  OLLAMA = 'Ollama'
}

export enum AIModelCapability {
  TEXT = 'Text',
  IMAGE = 'Image',
  VIDEO = 'Video',
  AUDIO = 'Audio'
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  capabilities: AIModelCapability[];
  costPer1kTokens?: number;
  costPerImage?: number;
  costPerVideoMinute?: number;
  description: string;
}

export interface ModelConfig {
  textModelId: string;
  imageModelId: string;
  videoModelId: string;
  audioModelId: string;
  apiKeys: Partial<Record<AIProvider, string>>;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
