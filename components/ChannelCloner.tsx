
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { replicateAesthetic } from '../services/geminiService';
import { batchGenerateTracks } from '../services/musicService';
import { generateLofiBackground, ensureApiKeySelected } from '../services/videoService';
import { saveTrack, saveMix, getMixes, updateMix } from '../lib/storage';
import { Mood, MusicProvider, Mix, ExportData, Track, VisualTheme } from '../types';
import { INITIAL_USER } from '../constants';
import { 
  Zap, 
  Loader2, 
  CheckCircle2, 
  Play, 
  Youtube, 
  Layers, 
  Sparkles, 
  Monitor, 
  Music, 
  ChevronRight,
  AlertCircle,
  Dna,
  Cpu,
  Video,
  PackageCheck,
  Terminal,
  Copy,
  Check,
  X,
  Search,
  ExternalLink,
  Archive,
  Key,
  RefreshCw,
  Wand2,
  FileArchive,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CHANNEL_blueprints = [
  { category: 'Study', mood: Mood.FOCUS, title: 'The Modern Scholar', tracks: 4 },
  { category: 'Night', mood: Mood.NIGHT, title: 'Neon Pulse Synthwave', tracks: 4 },
  { category: 'Sleep', mood: Mood.SLEEP, title: 'Midnight Dreamer', tracks: 4 },
];

type ProductionSubStep = 'idle' | 'analyzing' | 'audio' | 'visual' | 'packaging';

export const ChannelCloner: React.FC = () => {
  const navigate = useNavigate();
  const [isProducing, setIsProducing] = useState(false);
  const [activeVolumeIndex, setActiveVolumeIndex] = useState<number | null>(null);
  const [subStep, setSubStep] = useState<ProductionSubStep>('idle');
  const [audioProgress, setAudioProgress] = useState({ current: 0, total: 0 });
  const [completedVolumes, setCompletedVolumes] = useState<Mix[]>([]);
  const [statusLog, setStatusLog] = useState<string[]>(["System initialized. Awaiting production command..."]);
  const [selectedMixBundle, setSelectedMixBundle] = useState<Mix | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hasSelectedKey, setHasSelectedKey] = useState(false);

  // Video Regeneration & Archive States
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [isRegeneratingVideo, setIsRegeneratingVideo] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window.aistudio !== 'undefined') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasSelectedKey(selected);
      }
    };
    checkKey();
    
    // Load existing mixes that match blueprints to populate the vault if they exist
    const savedMixes = getMixes();
    const relevantMixes = savedMixes.filter(m => CHANNEL_blueprints.some(bp => bp.title === m.name));
    if (relevantMixes.length > 0) {
      setCompletedVolumes(relevantMixes);
    }
  }, []);

  useEffect(() => {
    if (selectedMixBundle) {
      setRevisionPrompt(selectedMixBundle.exportData?.thumbnailPrompt || '');
    }
  }, [selectedMixBundle]);

  const addLog = (msg: string) => {
    setStatusLog(prev => [msg, ...prev].slice(0, 5));
  };

  const processProduction = async () => {
    await ensureApiKeySelected();

    setIsProducing(true);
    setCompletedVolumes([]);
    setStatusLog(["Initiating content replication protocol..."]);
    
    try {
      for (let i = 0; i < CHANNEL_blueprints.length; i++) {
        const blueprint = CHANNEL_blueprints[i];
        setActiveVolumeIndex(i);
        
        setSubStep('analyzing');
        addLog(`[CLONE] Decoding Lofi Girl '${blueprint.category}' DNA...`);
        const aestheticData = await replicateAesthetic(blueprint.category);
        
        setSubStep('audio');
        setAudioProgress({ current: 0, total: blueprint.tracks });
        addLog(`[NEURAL] Synthesizing ${blueprint.tracks} upgraded tracks...`);
        
        const tracks: Track[] = [];
        for (let tIdx = 0; tIdx < blueprint.tracks; tIdx++) {
            addLog(`[AUDIO] Mastering neural layer ${tIdx + 1}/${blueprint.tracks}...`);
            const batch = await batchGenerateTracks(1, {
              mood: aestheticData.mood,
              provider: MusicProvider.BEATOVEN,
              bpmMin: aestheticData.bpmRange.min,
              bpmMax: aestheticData.bpmRange.max,
              durationSeconds: aestheticData.suggestedDuration,
              titleBase: `${blueprint.title} Pt.${tIdx + 1}`
            });
            tracks.push(...batch);
            setAudioProgress(p => ({ ...p, current: tIdx + 1 }));
        }
        tracks.forEach(saveTrack);

        setSubStep('visual');
        addLog(`[RENDER] Generating HD loop: ${aestheticData.mood}...`);
        const visualPrompt = `Improved version of Lofi Girl ${blueprint.category.toLowerCase()} scene, ${aestheticData.reasoning}`;
        const videoUrl = await generateLofiBackground(
          visualPrompt, 
          VisualTheme.CLASSIC_ANIME,
          aestheticData.mood.toLowerCase()
        );

        setSubStep('packaging');
        addLog(`[PACK] Compiling SEO bundle and timestamps...`);
        const totalDuration = tracks.reduce((acc, t) => acc + t.durationSeconds, 0);
        let currentStartTime = 0;
        const timestamps = tracks.map(t => {
          const m = Math.floor(currentStartTime / 60);
          const s = currentStartTime % 60;
          const stamp = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          currentStartTime += t.durationSeconds - 5;
          return `${stamp} ${t.title}`;
        }).join('\n');

        const bundle: ExportData = {
          timestampList: timestamps,
          youtubeDescription: `✨ ${blueprint.title} - Improved Volume ✨\n\nTracklist:\n${timestamps}\n\nProduced with LoFi Studio AI. \nImprovements: ${aestheticData.improvementSuggestions.join(', ')}`,
          m3uContent: "",
          jsonConfig: "",
          titleSuggestion: aestheticData.seoTitle,
          tags: aestheticData.tags,
          thumbnailPrompt: visualPrompt
        };

        const newMix: Mix = {
          id: `spawn_${Date.now()}_${i}`,
          userId: INITIAL_USER.id,
          name: blueprint.title,
          mood: aestheticData.mood,
          totalDurationSeconds: totalDuration,
          crossfadeDuration: 5,
          trackIds: tracks.map(t => t.id),
          videoUrl: videoUrl,
          exportData: bundle,
          createdAt: new Date().toISOString(),
          isPublished: false
        };
        
        saveMix(newMix);
        setCompletedVolumes(prev => [...prev, newMix]);
        addLog(`[READY] '${blueprint.title}' bundle saved to vault.`);
      }
      
      setSubStep('idle');
      addLog("Production cycle finished. Channel is broadcast-ready.");
    } catch (err) {
      console.error(err);
      addLog("[CRITICAL] Replication pipeline interrupted.");
      setIsProducing(false);
    } finally {
      setIsProducing(false);
      setActiveVolumeIndex(null);
    }
  };

  const handleRegenerateVideo = async () => {
    if (!selectedMixBundle || !revisionPrompt.trim()) return;
    
    await ensureApiKeySelected();
    setIsRegeneratingVideo(true);
    addLog(`[REVISION] Regenerating video for '${selectedMixBundle.name}'...`);

    try {
      const videoUrl = await generateLofiBackground(
        revisionPrompt, 
        selectedMixBundle.visualTheme || VisualTheme.CLASSIC_ANIME,
        selectedMixBundle.mood.toLowerCase()
      );

      const updatedMix = {
        ...selectedMixBundle,
        videoUrl: videoUrl,
        exportData: {
          ...selectedMixBundle.exportData!,
          thumbnailPrompt: revisionPrompt
        }
      };

      updateMix(updatedMix);
      setSelectedMixBundle(updatedMix);
      setCompletedVolumes(prev => prev.map(m => m.id === updatedMix.id ? updatedMix : m));
      addLog(`[REVISION] Video loop updated in vault.`);
    } catch (err) {
      console.error(err);
      addLog("[REVISION] Failed to regenerate video loop.");
    } finally {
      setIsRegeneratingVideo(false);
    }
  };

  const handleDownloadArchive = async () => {
    if (!selectedMixBundle || !selectedMixBundle.exportData) return;
    setIsArchiving(true);
    addLog(`[ARCHIVE] Building production ZIP for '${selectedMixBundle.name}'...`);

    try {
      const zip = new JSZip();
      
      // 1. Add Video
      if (selectedMixBundle.videoUrl) {
        const videoResponse = await fetch(selectedMixBundle.videoUrl);
        const videoBlob = await videoResponse.blob();
        zip.file(`${selectedMixBundle.name.replace(/\s+/g, '_')}_Loop.mp4`, videoBlob);
      }

      // 2. Add Metadata Text File
      const metadataContent = `
TITLE:
${selectedMixBundle.exportData.titleSuggestion}

DESCRIPTION:
${selectedMixBundle.exportData.youtubeDescription}

TRACKLIST:
${selectedMixBundle.exportData.timestampList}

TAGS:
${selectedMixBundle.exportData.tags?.join(', ')}

GENERATION PROMPT:
${selectedMixBundle.exportData.thumbnailPrompt}
      `.trim();
      
      zip.file("youtube_metadata.txt", metadataContent);

      // 3. Generate and Download ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedMixBundle.name.replace(/\s+/g, '_')}_Bundle.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addLog(`[ARCHIVE] Production archive downloaded successfully.`);
    } catch (err) {
      console.error(err);
      addLog("[ARCHIVE] Failed to build production archive.");
    } finally {
      setIsArchiving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    setHasSelectedKey(true);
  };

  const overallProgress = (completedVolumes.length / CHANNEL_blueprints.length) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 mb-4">
          <Zap size={14} className={isProducing ? "animate-pulse" : ""} />
          <span className="text-[10px] font-black uppercase tracking-widest">Aesthetic Replication Engine</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight italic">Channel Spawn Engine</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Clone the Lo-Fi Girl ecosystem and inject next-gen audio improvements. Automatic YouTube production bundling.
        </p>
      </header>

      {isProducing && (
        <div className="w-full bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] space-y-3 shadow-2xl">
          <div className="flex justify-between items-end">
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multi-Volume Sequence Progress</div>
             <div className="text-xl font-black text-amber-500">{Math.round(overallProgress)}%</div>
          </div>
          <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
             <div 
               className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
               style={{ width: `${overallProgress}%` }} 
             />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CHANNEL_blueprints.map((bp, i) => {
          const isActive = activeVolumeIndex === i;
          const isDone = completedVolumes.some(m => m.name === bp.title);
          const mix = completedVolumes.find(m => m.name === bp.title);
          
          return (
            <div 
              key={bp.category}
              className={`relative p-8 rounded-[3rem] border transition-all duration-500 flex flex-col space-y-6 ${
                isActive 
                  ? 'bg-amber-500/5 border-amber-500 shadow-2xl scale-[1.02] z-10' 
                  : isDone
                    ? 'bg-slate-900 border-emerald-500/30'
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isActive ? 'bg-amber-500 text-slate-950 animate-pulse' : isDone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'
                }`}>
                   {bp.category === 'Study' && <Monitor size={24} />}
                   {bp.category === 'Night' && <Sparkles size={24} />}
                   {bp.category === 'Sleep' && <Music size={24} />}
                </div>
                {isDone && (
                  <button 
                    onClick={() => setSelectedMixBundle(mix || null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-amber-500 transition-all flex items-center space-x-2"
                  >
                    <PackageCheck size={16} />
                    <span className="text-[9px] font-black uppercase">Get SEO Pack</span>
                  </button>
                )}
              </div>

              <div>
                <h3 className="font-bold text-xl text-white tracking-tight">{bp.title}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Status: {isDone ? 'Bundle Finalized' : isActive ? 'Replicating DNA' : 'Waiting in queue'}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800/50">
                <div className={`flex items-center space-x-3 text-xs ${isActive && subStep === 'analyzing' ? 'text-amber-500' : isDone || (isActive && ['audio', 'visual', 'packaging'].includes(subStep)) ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {isActive && subStep === 'analyzing' ? <Loader2 size={14} className="animate-spin" /> : <Dna size={14} />}
                  <span className="font-bold">Aesthetic Cloning</span>
                </div>
                <div className={`flex items-center justify-between text-xs ${isActive && subStep === 'audio' ? 'text-amber-500' : isDone || (isActive && ['visual', 'packaging'].includes(subStep)) ? 'text-emerald-500' : 'text-slate-600'}`}>
                  <div className="flex items-center space-x-3">
                    {isActive && subStep === 'audio' ? <Loader2 size={14} className="animate-spin" /> : <Cpu size={14} />}
                    <span className="font-bold">Neural Audio Upgrade</span>
                  </div>
                  {isActive && subStep === 'audio' && (
                    <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full">{audioProgress.current}/{audioProgress.total}</span>
                  )}
                </div>
                <div className={`flex items-center space-x-3 text-xs ${isActive && subStep === 'visual' ? 'text-amber-500' : isDone || (isActive && ['packaging'].includes(subStep)) ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {isActive && subStep === 'visual' ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
                  <span className="font-bold">Visual Rendering</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
           <div className="flex items-center space-x-3 text-slate-400">
             <Terminal size={18} />
             <h4 className="text-[10px] font-black uppercase tracking-widest">Broadcast Pipeline Status</h4>
           </div>
           <div className="space-y-3 font-mono text-[11px]">
             {statusLog.map((log, idx) => (
               <div key={idx} className={`p-3 rounded-xl border transition-all ${idx === 0 ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'}`}>
                 <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
                 {log}
               </div>
             ))}
           </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center space-y-4 relative z-10 text-center">
            {isProducing ? (
              <div className="w-24 h-24 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin" />
            ) : (
              <div className="p-8 bg-slate-950 rounded-full border border-slate-800">
                 <Zap className="w-12 h-12 text-amber-500" />
              </div>
            )}
            <h4 className="text-2xl font-black text-white">{isProducing ? "Executing Replication" : "One-Click Channel Launch"}</h4>
            <p className="text-slate-500 text-sm max-w-sm">Automatically generate 3 full YouTube-ready volumes with improved audio DNA and HD visuals.</p>
            {!hasSelectedKey && !isProducing && (
              <p className="text-[10px] text-amber-500 font-bold bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 max-w-sm">
                Veo Video models require a paid API key selected from your AI Studio account.
              </p>
            )}
          </div>

          {!isProducing && (
            <div className="flex flex-col space-y-3 w-full max-w-sm">
               {!hasSelectedKey && (
                <button 
                  onClick={handleSelectKey}
                  className="w-full px-12 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-[2rem] font-bold text-sm border border-slate-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Key size={18} />
                  <span>Connect Paid Key</span>
                </button>
              )}
              <button 
                onClick={processProduction}
                className="group px-12 py-6 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center space-x-4"
              >
                <span>Initialize Production Batch</span>
                <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}

          <div className="flex items-start space-x-3 max-w-lg p-6 bg-slate-950/50 rounded-3xl border border-slate-800">
             <AlertCircle className="text-blue-400 shrink-0 mt-1" size={18} />
             <p className="text-[11px] text-slate-500 leading-relaxed italic">
               This will result in 12+ tracks and 3 HD video loops. The metadata generated includes titles and tags optimized for YouTube's Lo-Fi algorithm. <b>Billing documentation: ai.google.dev/gemini-api/docs/billing</b>
             </p>
          </div>
        </div>
      </div>

      {/* Production Vault Modal */}
      {selectedMixBundle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 lg:p-10 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <div className="flex items-center space-x-4">
                 <div className="p-4 bg-amber-500 rounded-2xl text-slate-950"><Archive size={24} /></div>
                 <div>
                    <h3 className="text-2xl font-black text-white">YouTube SEO Pack</h3>
                    <p className="text-sm text-slate-500">Copy these assets to your YouTube Studio upload.</p>
                 </div>
              </div>
              <button onClick={() => setSelectedMixBundle(null)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10">
               {/* Video Section */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Video Asset (HD Loop)</label>
                      <div className="aspect-video bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative group">
                        {isRegeneratingVideo ? (
                          <div className="absolute inset-0 z-20 bg-slate-950/80 flex flex-col items-center justify-center space-y-4">
                             <Loader2 className="animate-spin text-amber-500" size={40} />
                             <p className="text-xs font-black text-white uppercase tracking-widest animate-pulse">Neural Re-Rendering...</p>
                          </div>
                        ) : null}
                        <video src={selectedMixBundle.videoUrl || ''} className="w-full h-full object-cover" autoPlay loop muted />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10">
                            <a href={selectedMixBundle.videoUrl || ''} download={`${selectedMixBundle.name}_Loop.mp4`} className="px-6 py-3 bg-white text-slate-950 rounded-full font-bold flex items-center space-x-2">
                                <ExternalLink size={16} />
                                <span>Download Loop</span>
                            </a>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 space-y-4 shadow-inner">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                          <Wand2 size={12} className="text-amber-500" />
                          <span>Video Revision Prompt</span>
                        </label>
                        {isRegeneratingVideo && <span className="text-[10px] font-bold text-amber-500 animate-pulse">Processing...</span>}
                      </div>
                      <textarea 
                        value={revisionPrompt}
                        onChange={(e) => setRevisionPrompt(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 outline-none focus:border-amber-500/50 min-h-[80px] resize-none leading-relaxed"
                        placeholder="Make changes to the video aesthetic..."
                      />
                      <button 
                        onClick={handleRegenerateVideo}
                        disabled={isRegeneratingVideo || !revisionPrompt.trim()}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-amber-500 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 border border-amber-500/10 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {isRegeneratingVideo ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                        <span>{isRegeneratingVideo ? "Re-Rendering..." : "Regenerate Video Loop"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Suggested AI Title</label>
                      <div className="flex bg-slate-950 p-5 rounded-3xl border border-slate-800 justify-between items-center group/field">
                        <span className="text-sm font-bold text-white">{selectedMixBundle.exportData?.titleSuggestion}</span>
                        <button onClick={() => copyToClipboard(selectedMixBundle.exportData?.titleSuggestion || '', 'title')} className="p-2 text-slate-500 hover:text-amber-500 transition-colors">
                            {copiedField === 'title' ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Optimized Description & Timestamps</label>
                      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 relative group/field">
                        <button 
                          onClick={() => copyToClipboard(selectedMixBundle.exportData?.youtubeDescription + '\n\n' + selectedMixBundle.exportData?.timestampList, 'desc')}
                          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-amber-500 z-10"
                        >
                            {copiedField === 'desc' ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono h-[300px] overflow-y-auto pr-4 scrollbar-hide leading-relaxed">
                          {selectedMixBundle.exportData?.youtubeDescription}
                          {"\n\nTRACKLIST:\n"}
                          {selectedMixBundle.exportData?.timestampList}
                        </pre>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Tags Section */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">SEO Tags (Comma Separated)</label>
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-wrap gap-2 relative">
                     <button 
                      onClick={() => copyToClipboard(selectedMixBundle.exportData?.tags?.join(', ') || '', 'tags')}
                      className="absolute top-4 right-4 p-2 text-slate-500 hover:text-amber-500"
                     >
                        {copiedField === 'tags' ? <Check size={16} /> : <Copy size={16} />}
                     </button>
                     {selectedMixBundle.exportData?.tags?.map((tag, i) => (
                       <span key={i} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400">
                         #{tag.replace(/\s/g, '')}
                       </span>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-8 lg:p-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950/20">
               <div className="flex items-center space-x-3 text-emerald-500">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Production Ready</span>
               </div>
               
               <div className="flex items-center space-x-4 w-full md:w-auto">
                 <button 
                  onClick={handleDownloadArchive}
                  disabled={isArchiving}
                  className="flex-1 md:flex-none px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-3 border border-slate-700 transition-all active:scale-[0.98] disabled:opacity-50"
                 >
                   {isArchiving ? <Loader2 className="animate-spin" size={18} /> : <FileArchive size={18} />}
                   <span>{isArchiving ? "Packaging Archive..." : "Download Full Bundle (.zip)"}</span>
                 </button>
                 
                 <button onClick={() => setSelectedMixBundle(null)} className="flex-1 md:flex-none px-12 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-amber-500/10">
                   Close Vault
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
