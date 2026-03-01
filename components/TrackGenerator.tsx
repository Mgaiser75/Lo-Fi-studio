
import React, { useState, useEffect, useRef } from 'react';
import { Mood, Track, MusicProvider } from '../types';
import { MOOD_CONFIGS } from '../constants';
import { getAIAssistantParams } from '../services/geminiService';
import { batchGenerateTracks } from '../services/musicService';
import { saveTrack, getTracks, deleteTrack, toggleFavorite } from '../lib/storage';
import { InspirationPanel } from './InspirationPanel';
import { Sparkles, Loader2, Play, Pause, Trash2, Heart, Music, Activity, Info, CheckCircle2 } from 'lucide-react';

export const TrackGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [form, setForm] = useState({
    mood: Mood.CHILL,
    provider: MusicProvider.BEATOVEN,
    bpmMin: 70,
    bpmMax: 90,
    duration: 180,
    count: 3,
    titleBase: 'Lofi Vibes'
  });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    setTracks(getTracks());
    const audio = audioRef.current;
    const handleEnded = () => setPlayingId(null);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleAiAssist = async () => {
    if (!prompt.trim()) return;
    setIsAiLoading(true);
    setImprovements([]);
    try {
      const result = await getAIAssistantParams(prompt);
      setForm({ ...form, mood: result.mood, bpmMin: result.bpmRange.min, bpmMax: result.bpmRange.max, duration: result.suggestedDuration, titleBase: result.suggestedTitle });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleReplication = (data: any) => {
    setForm({
      ...form,
      mood: data.mood,
      bpmMin: data.bpmRange.min,
      bpmMax: data.bpmRange.max,
      duration: data.suggestedDuration,
      titleBase: `Improved ${data.suggestedTitle}`
    });
    setImprovements(data.improvementSuggestions || []);
    setPrompt(`Replicating ${data.suggestedTitle} vibe with improvements.`);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newTracks = await batchGenerateTracks(form.count, {
        mood: form.mood,
        provider: form.provider,
        bpmMin: form.bpmMin,
        bpmMax: form.bpmMax,
        durationSeconds: form.duration,
        titleBase: form.titleBase
      });
      newTracks.forEach(saveTrack);
      setTracks(getTracks());
    } catch (err) {
      alert("Error generating tracks.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = (track: Track) => {
    const audio = audioRef.current;
    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      setIsAudioLoading(true);
      audio.src = track.audioUrl;
      audio.play().catch(() => setIsAudioLoading(false));
      setPlayingId(track.id);
    }
  };

  return (
    <div className="relative space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <InspirationPanel onUseTemplate={() => {}} onReplicate={handleReplication} />
      
      <header>
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Track Lab</h2>
        <p className="text-slate-400 text-sm lg:text-base">Use "Replicate & Improve" in the Inspiration Studio to clone Lofi Girl vibes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Aesthetic Improvements Alert */}
          {improvements.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl animate-in fade-in zoom-in duration-500">
               <div className="flex items-center space-x-2 text-amber-500 mb-2">
                 <Sparkles size={16} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Aesthetic Upgrades Found</span>
               </div>
               <ul className="space-y-1.5">
                 {improvements.map((imp, i) => (
                   <li key={i} className="text-[11px] text-slate-300 flex items-start space-x-2">
                     <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                     <span>{imp}</span>
                   </li>
                 ))}
               </ul>
            </div>
          )}

          <section className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-500">
                <Activity className="w-5 h-5" />
                <h3 className="font-bold">Production Seed</h3>
              </div>
            </div>
            <textarea 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:border-amber-500/50 outline-none min-h-[80px]"
              placeholder="Analysis prompt will appear here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              onClick={handleAiAssist}
              disabled={isAiLoading || !prompt.trim()}
              className="w-full py-3 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-700"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Refine Manually'}
            </button>
          </section>

          <form onSubmit={handleGenerate} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-5">
            <button type="submit" disabled={isGenerating} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-bold flex items-center justify-center space-x-2">
              {isGenerating ? <Loader2 className="animate-spin" /> : <Activity />}
              <span>{isGenerating ? 'Synthesizing DNA...' : 'Generate Improved Mix'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl h-full flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Music size={20} className="text-amber-500" />
                <span>Audio Repository</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {tracks.map(track => (
                <div key={track.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 group transition-all">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => handlePlay(track)} className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-amber-500 transition-colors">
                      {playingId === track.id ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-slate-100">{track.title}</div>
                      <div className="text-[10px] text-slate-500">{track.mood} • {track.bpm} BPM</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => toggleFavorite(track.id)} className="p-2 text-slate-600 hover:text-rose-500"><Heart size={14} /></button>
                    <button onClick={() => { deleteTrack(track.id); setTracks(getTracks()); }} className="p-2 text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
