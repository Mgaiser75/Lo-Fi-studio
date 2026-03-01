
import { Track, Mix, User, Mood, MusicProvider, ModelConfig } from '../types';
import { STORAGE_KEYS, INITIAL_USER, DEFAULT_MODEL_CONFIG } from '../constants';

export const getModelConfig = (): ModelConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG);
  if (!data) return DEFAULT_MODEL_CONFIG;
  return { ...DEFAULT_MODEL_CONFIG, ...JSON.parse(data) };
};

export const saveModelConfig = (config: ModelConfig) => {
  localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(config));
};

export const getTracks = (): Track[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRACKS);
  if (!data) return seedTracks();
  return JSON.parse(data);
};

export const saveTrack = (track: Track) => {
  const tracks = getTracks();
  localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify([track, ...tracks]));
};

export const deleteTrack = (id: string) => {
  const tracks = getTracks().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
};

export const toggleFavorite = (id: string) => {
  const tracks = getTracks().map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t);
  localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
};

export const getMixes = (): Mix[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MIXES);
  if (!data) return [];
  return JSON.parse(data);
};

export const saveMix = (mix: Mix) => {
  const mixes = getMixes();
  localStorage.setItem(STORAGE_KEYS.MIXES, JSON.stringify([mix, ...mixes]));
};

export const updateMix = (updatedMix: Mix) => {
  const mixes = getMixes();
  const updatedMixes = mixes.map(m => m.id === updatedMix.id ? updatedMix : m);
  localStorage.setItem(STORAGE_KEYS.MIXES, JSON.stringify(updatedMixes));
};

const seedTracks = (): Track[] => {
  const seeds: Track[] = [
    {
      id: 't1',
      userId: INITIAL_USER.id,
      title: 'Midnight Coding',
      mood: Mood.CODING,
      bpm: 85,
      durationSeconds: 185,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      isFavorite: true,
      provider: MusicProvider.BEATOVEN,
      createdAt: new Date().toISOString()
    },
    {
      id: 't2',
      userId: INITIAL_USER.id,
      title: 'Rainy Window',
      mood: Mood.RAINY,
      bpm: 72,
      durationSeconds: 210,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      isFavorite: false,
      provider: MusicProvider.SOUNDRAW,
      createdAt: new Date().toISOString()
    },
    {
      id: 't3',
      userId: INITIAL_USER.id,
      title: 'Summer Breeze',
      mood: Mood.CHILL,
      bpm: 90,
      durationSeconds: 195,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      isFavorite: true,
      provider: MusicProvider.MUBERT,
      createdAt: new Date().toISOString()
    },
    {
      id: 't4',
      userId: INITIAL_USER.id,
      title: 'Focus Session',
      mood: Mood.FOCUS,
      bpm: 82,
      durationSeconds: 240,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      isFavorite: false,
      provider: MusicProvider.SOUNDFUL,
      createdAt: new Date().toISOString()
    },
    {
      id: 't5',
      userId: INITIAL_USER.id,
      title: 'Deep Sleep',
      mood: Mood.SLEEP,
      bpm: 65,
      durationSeconds: 300,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      isFavorite: false,
      provider: MusicProvider.BEATOVEN,
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(seeds));
  return seeds;
};
