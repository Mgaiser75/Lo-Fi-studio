
import React, { useMemo } from 'react';
import { getTracks, getMixes } from '../lib/storage';
import { Music, Clock, Layers, Star, Plus, Youtube, CheckCircle2, ArrowRight, Play, Layout, Zap, Sparkles, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOOD_CONFIGS } from '../constants';

export const Dashboard: React.FC = () => {
  const tracks = getTracks();
  const mixes = getMixes();

  const stats = useMemo(() => ({
    totalTracks: tracks.length,
    totalPlaytime: Math.round(tracks.reduce((acc, t) => acc + t.durationSeconds, 0) / 60),
    readyToPublish: mixes.filter(m => !!m.exportData).length,
    favorites: tracks.filter(t => t.isFavorite).length
  }), [tracks, mixes]);

  const readyMixes = mixes.filter(m => m.exportData);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Channel Command</h2>
          <p className="text-slate-400">Streamlining your 24/7 Lo-Fi broadcast pipeline.</p>
        </div>
        <div className="flex space-x-3">
          <Link 
            to="/cloner" 
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-5 py-3 rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.05]"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Instant Spawn</span>
          </Link>
          <Link 
            to="/mixes" 
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl font-bold transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create Episode</span>
          </Link>
        </div>
      </header>

      {/* Hero Announcement */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 text-indigo-400 group-hover:scale-110 transition-transform duration-700">
           <Sparkles size={160} />
        </div>
        <div className="space-y-4 max-w-xl relative z-10">
          <h3 className="text-2xl font-black text-white">Scale your Lofi Empire</h3>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">
            The automated <b>Channel Spawner</b> is now online. Create a fully-stocked YouTube channel with 3 unique volumes in minutes. Improved audio DNA, custom AI visuals, and auto-generated metadata.
          </p>
          <Link to="/cloner" className="inline-flex items-center space-x-2 text-amber-500 font-bold hover:underline">
            <span>Launch the production factory</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-6 rounded-[2.5rem] flex items-center space-x-6">
             <div className="flex -space-x-3">
               <div className="w-12 h-12 rounded-full bg-rose-500 border-4 border-slate-950 flex items-center justify-center"><Monitor size={20} className="text-white" /></div>
               <div className="w-12 h-12 rounded-full bg-blue-500 border-4 border-slate-950 flex items-center justify-center"><Sparkles size={20} className="text-white" /></div>
               <div className="w-12 h-12 rounded-full bg-amber-500 border-4 border-slate-950 flex items-center justify-center"><Music size={20} className="text-slate-950" /></div>
             </div>
             <div>
               <div className="text-xs font-black text-white uppercase tracking-widest">Available Presets</div>
               <div className="text-[10px] text-slate-500 font-mono mt-1">STUDY • NIGHT • SLEEP</div>
             </div>
          </div>
        </div>
      </div>

      {/* Production Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Music size={80} />
          </div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Step 1: Raw Assets</div>
          <div className="text-3xl font-black text-white mb-4">{stats.totalTracks} <span className="text-lg font-medium text-slate-500">Beats</span></div>
          <Link to="/tracks" className="text-amber-500 text-xs font-bold flex items-center space-x-1 hover:underline">
            <span>Generate more</span> <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Layout size={80} />
          </div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Step 2: Assemblies</div>
          <div className="text-3xl font-black text-white mb-4">{mixes.length} <span className="text-lg font-medium text-slate-500">Drafts</span></div>
          <Link to="/mixes" className="text-amber-500 text-xs font-bold flex items-center space-x-1 hover:underline">
            <span>Assemble mix</span> <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[2rem] relative overflow-hidden group ring-1 ring-amber-500/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
            <Youtube size={80} />
          </div>
          <div className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-1">Step 3: Ready for YT</div>
          <div className="text-3xl font-black text-white mb-4">{stats.readyToPublish} <span className="text-lg font-medium text-slate-500">Volumes</span></div>
          <div className="text-amber-500/60 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 size={12} />
            <span>Metadata & Videos generated</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Publication Ready Queue */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm flex flex-col">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
            <div>
              <h3 className="text-xl font-bold text-white">Upload Queue</h3>
              <p className="text-xs text-slate-500 mt-1">Volumes ready for YouTube deployment</p>
            </div>
            <Youtube className="text-rose-500" />
          </div>
          <div className="p-6 space-y-4 flex-1">
            {readyMixes.length > 0 ? readyMixes.map(mix => (
              <div key={mix.id} className="group p-5 rounded-3xl bg-slate-950/50 border border-slate-800 hover:border-amber-500/30 transition-all flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className="w-20 aspect-video bg-slate-800 rounded-lg overflow-hidden relative">
                    {mix.videoUrl ? <video src={mix.videoUrl} className="w-full h-full object-cover" muted /> : <div className="w-full h-full flex items-center justify-center text-slate-600"><Plus size={16} /></div>}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-amber-500 transition-colors">{mix.name}</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                      {Math.round(mix.totalDurationSeconds / 60)} MINS • {mix.trackIds.length} TRACKS
                    </div>
                  </div>
                </div>
                <Link to="/mixes" className="p-3 bg-slate-800 rounded-xl text-slate-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <Play size={16} fill="currentColor" />
                </Link>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 bg-slate-900 rounded-full text-slate-700">
                  <Youtube size={32} />
                </div>
                <div className="max-w-[200px]">
                  <p className="text-sm font-bold text-slate-400">Nothing to Upload</p>
                  <p className="text-xs text-slate-600 mt-2">Finish a mix and generate video to see it here.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Favorite Asset Vault */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm flex flex-col">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
            <div>
              <h3 className="text-xl font-bold text-white">Top Tier Assets</h3>
              <p className="text-xs text-slate-500 mt-1">Favorited beats for future volumes</p>
            </div>
            <Star className="text-amber-500" />
          </div>
          <div className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
            {tracks.filter(t => t.isFavorite).map(track => (
              <div key={track.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/30 border border-slate-800/50 hover:bg-slate-800/20 transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-xl ${MOOD_CONFIGS[track.mood].color}`}>
                    {MOOD_CONFIGS[track.mood].icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{track.title}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{track.bpm} BPM • {track.provider}</div>
                  </div>
                </div>
                <div className="text-slate-700 text-[10px] font-bold">
                  {new Date(track.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {tracks.filter(t => t.isFavorite).length === 0 && (
              <p className="text-center py-20 text-slate-600 text-sm italic">No favorites yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
