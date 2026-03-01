
import React, { useState } from 'react';
import { Youtube, X, Zap, Info, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { replicateAesthetic } from '../services/geminiService';

interface ReferenceVideo {
  id: string;
  title: string;
  category: string;
}

const REFERENCE_VIDEOS: ReferenceVideo[] = [
  { id: 'jfKfPfyJRdk', title: 'Lofi Girl - Study Girl', category: 'Study' },
  { id: '5yx6BWVnrKY', title: 'Lofi Girl - Synthwave', category: 'Night' },
  { id: '4xDzrJKXOOY', title: 'Lofi Girl - Sleep/Chill', category: 'Sleep' },
];

interface InspirationPanelProps {
  onUseTemplate: (category: string) => void;
  onReplicate: (data: any) => void;
}

export const InspirationPanel: React.FC<InspirationPanelProps> = ({ onUseTemplate, onReplicate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(REFERENCE_VIDEOS[0]);
  const [isReplicating, setIsReplicating] = useState(false);

  const handleDeepReplicate = async () => {
    setIsReplicating(true);
    try {
      const data = await replicateAesthetic(activeVideo.category);
      onReplicate(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplicating(false);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full z-50 transition-all duration-500 flex ${isOpen ? 'w-[400px]' : 'w-0'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-[-48px] top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 p-3 rounded-l-2xl shadow-2xl hover:bg-amber-400 transition-all flex flex-col items-center space-y-2 group"
      >
        <Youtube size={20} className={isOpen ? '' : 'animate-pulse'} />
        <span className="[writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-widest py-2">
          {isOpen ? 'Close Ref' : 'Inspiration'}
        </span>
      </button>

      <div className="w-full bg-slate-900 border-l border-slate-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Youtube className="text-rose-500" size={20} />
              <span>Lofi Girl Ref</span>
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-tight font-bold">Deep Sampling Engine</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-3">
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=0&mute=1`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            <button 
              onClick={handleDeepReplicate}
              disabled={isReplicating}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 group hover:scale-[1.02] transition-all"
            >
              {isReplicating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
              <span>{isReplicating ? "Analyzing Aesthetic..." : "Replicate & Improve Beat"}</span>
            </button>
          </div>

          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Aesthetic Presets</h5>
            <div className="grid grid-cols-1 gap-2">
              {REFERENCE_VIDEOS.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    activeVideo.id === vid.id 
                    ? 'bg-amber-500/10 border-amber-500/30 text-white' 
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{vid.category} Vibes</div>
                    <div className="text-[9px] opacity-50 font-mono">Reference Channel Link</div>
                  </div>
                  <Zap size={14} className={activeVideo.id === vid.id ? 'text-amber-500' : 'text-slate-700'} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
             <div className="flex items-center space-x-2 text-blue-400">
               <Info size={14} />
               <span className="text-[10px] font-bold uppercase tracking-widest">AI Replication Info</span>
             </div>
             <p className="text-[11px] text-slate-500 leading-relaxed italic">
               "Replicate & Improve" uses Gemini Pro to deconstruct the specific sub-genre's musical hallmarks and injects modern high-fidelity production targets into your next generation.
             </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <a 
            href="https://www.youtube.com/@LofiGirl" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <span>Visit Lofi Girl YouTube</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
