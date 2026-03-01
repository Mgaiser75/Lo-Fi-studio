
import React from 'react';
import { Mood, AIProvider, AIModelCapability, AIModel, ModelConfig } from './types';
import { 
  CloudRain, 
  Moon, 
  Coffee, 
  Code, 
  Bed, 
  Leaf 
} from 'lucide-react';

export const MOOD_CONFIGS: Record<Mood, { icon: React.ReactNode; color: string }> = {
  [Mood.CHILL]: { icon: <Leaf className="w-4 h-4" />, color: 'bg-emerald-500/20 text-emerald-400' },
  [Mood.NIGHT]: { icon: <Moon className="w-4 h-4" />, color: 'bg-indigo-500/20 text-indigo-400' },
  [Mood.RAINY]: { icon: <CloudRain className="w-4 h-4" />, color: 'bg-blue-500/20 text-blue-400' },
  [Mood.FOCUS]: { icon: <Coffee className="w-4 h-4" />, color: 'bg-amber-500/20 text-amber-400' },
  [Mood.CODING]: { icon: <Code className="w-4 h-4" />, color: 'bg-rose-500/20 text-rose-400' },
  [Mood.SLEEP]: { icon: <Bed className="w-4 h-4" />, color: 'bg-purple-500/20 text-purple-400' },
};

export const AVAILABLE_MODELS: AIModel[] = [
  // Gemini Models
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    provider: AIProvider.GEMINI,
    capabilities: [AIModelCapability.TEXT],
    costPer1kTokens: 0.0001,
    description: 'Fast and efficient for text generation.'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: AIProvider.GEMINI,
    capabilities: [AIModelCapability.TEXT],
    costPer1kTokens: 0.00125,
    description: 'Advanced reasoning and complex text tasks.'
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    provider: AIProvider.GEMINI,
    capabilities: [AIModelCapability.IMAGE],
    costPerImage: 0.005,
    description: 'General image generation and editing.'
  },
  {
    id: 'veo-3.1-fast-generate-preview',
    name: 'Veo 3.1 Fast',
    provider: AIProvider.GEMINI, // Veo is part of Gemini family
    capabilities: [AIModelCapability.VIDEO],
    costPerVideoMinute: 0.50,
    description: 'High-quality video generation.'
  },
  {
    id: 'gemini-2.5-flash-preview-tts',
    name: 'Gemini 2.5 TTS',
    provider: AIProvider.GEMINI,
    capabilities: [AIModelCapability.AUDIO],
    costPer1kTokens: 0.0005,
    description: 'Text-to-speech generation.'
  },
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: AIProvider.OPENAI,
    capabilities: [AIModelCapability.TEXT],
    costPer1kTokens: 0.005,
    description: 'High-performance multimodal model.'
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: AIProvider.OPENAI,
    capabilities: [AIModelCapability.IMAGE],
    costPerImage: 0.04,
    description: 'State-of-the-art image generation.'
  },
  // Mistral
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    provider: AIProvider.MISTRAL,
    capabilities: [AIModelCapability.TEXT],
    costPer1kTokens: 0.002,
    description: 'Mistral\'s top-tier reasoning model.'
  },
  // DeepSeek
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: AIProvider.DEEPSEEK,
    capabilities: [AIModelCapability.TEXT],
    costPer1kTokens: 0.0002,
    description: 'Highly efficient chat model.'
  },
  // Ollama (Local)
  {
    id: 'llama3',
    name: 'Llama 3 (Local)',
    provider: AIProvider.OLLAMA,
    capabilities: [AIModelCapability.TEXT],
    costPer1kTokens: 0,
    description: 'Run locally via Ollama.'
  }
];

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  textModelId: 'gemini-3-flash-preview',
  imageModelId: 'gemini-2.5-flash-image',
  videoModelId: 'veo-3.1-fast-generate-preview',
  audioModelId: 'gemini-2.5-flash-preview-tts',
  apiKeys: {}
};

export const STORAGE_KEYS = {
  TRACKS: 'lofi_studio_tracks',
  MIXES: 'lofi_studio_mixes',
  USER: 'lofi_studio_user',
  MODEL_CONFIG: 'lofi_studio_model_config'
};

export const INITIAL_USER = {
  id: 'user_123',
  email: 'creator@lofi.studio',
  createdAt: new Date().toISOString()
};
