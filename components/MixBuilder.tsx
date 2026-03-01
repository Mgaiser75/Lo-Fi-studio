
import React, { useState, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { Track, Mix, Mood, VisualTheme, ExportData } from '../types';
import { getTracks, saveMix, getMixes } from '../lib/storage';
import { MOOD_CONFIGS, INITIAL_USER } from '../constants';
import { generateLofiBackground, ensureApiKeySelected } from '../services/videoService';
import { generateRadioIntro } from '../services/geminiService';
import { MixPlayer } from './MixPlayer';
import { InspirationPanel } from './InspirationPanel';
import { 
  Plus, 
  Minus, 
  X,
  Layers,
  Sparkles,
  Video,
  Loader2,
  Music2,
  Download,
  Copy,
  Check,
  Mic2,
  AudioLines,
  Palette,
  Monitor,
  Zap,
  Settings2,
  Cpu,
  Tv,
  Key,
  FileArchive
} from 'lucide-react';

const THEME_ICONS: Record<VisualTheme, React.ReactNode> = {
  [VisualTheme.CLASSIC_ANIME]: <Monitor size={16} />,
  [VisualTheme.CYBERPUNK]: <Zap size={16} />,
  [VisualTheme.WATERCOLOR]: <Palette size={16} />,
  [VisualTheme.RETRO_VHS]: <Video size={16} />,
  [VisualTheme.MODERN_3D]: <Sparkles size={16} />
};

export const MixBuilder: React.FC = () => {
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [mixName, setMixName] = useState('LoFi Radio: Vol. 1');
  const [mixMood, setMixMood] = useState(Mood.CHILL);
  const [visualTheme, setVisualTheme] = useState<VisualTheme>(VisualTheme.CLASSIC_ANIME);
  const [crossfade, setCrossfade] = useState(5);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
  // New Export Settings
  const [exportResolution, setExportResolution] = useState<'720p' | '1080p'>('720p');
  const [exportAudioFormat, setExportAudioFormat] = useState<'WAV' | 'MP3' | 'AAC'>('WAV');

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('Girl studying at a desk with a coffee mug, city skyline through the window');

  const [introAudioUrl, setIntroAudioUrl] = useState<string | null>(null);
  const [isIntroGenerating, setIsIntroGenerating] = useState(false);
  const [introPrompt, setIntroPrompt] = useState('Chill radio host welcoming the listeners to the midnight session');

  const [hasSelectedKey, setHasSelectedKey] = useState(false);

  useEffect(() => {
    setAvailableTracks(getTracks());
    const checkKey = async () => {
      if (typeof window.aistudio !== 'undefined') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasSelectedKey(selected);
      }
    };
    checkKey();
  }, []);

  const mixTracks = useMemo(() => 
    selectedTrackIds.map(id => availableTracks.find(t => t.id === id)).filter(Boolean) as Track[]
  , [selectedTrackIds, availableTracks]);

  const totalDurationSeconds = useMemo(() => {
    if (mixTracks.length === 0) return 0;
    const baseDuration = mixTracks.reduce((acc, t) => acc + t.durationSeconds, 0);
    const fadeReductions = (mixTracks.length - 1) * crossfade;
    return Math.max(0, baseDuration - fadeReductions);
  }, [mixTracks, crossfade]);

  const handleUseTemplate = (category: string) => {
    const visualTemplates: Record<string, { prompt: string; theme: VisualTheme }> = {
      'Study': { prompt: 'Anime girl studying at desk, cat sleeping on books, heavy rain on large apartment window', theme: VisualTheme.CLASSIC_ANIME },
      'Night': { prompt: 'Futuristic cyberpunk bedroom, character looking out at neon Tokyo skyline', theme: VisualTheme.CYBERPUNK },
      'Sleep': { prompt: 'Cozy attic bedroom at midnight, full moon visible through skylight', theme: VisualTheme.WATERCOLOR }
    };
    if (visualTemplates[category]) {
      setVideoPrompt(visualTemplates[category].prompt);
      setVisualTheme(visualTemplates[category].theme);
    }
  };

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    setHasSelectedKey(true);
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    
    // Explicit key check before starting Veo render
    const ok = await ensureApiKeySelected();
    if (!ok) return;

    setIsVideoGenerating(true);
    try {
      const url = await generateLofiBackground(videoPrompt, visualTheme, mixMood.toLowerCase(), '16:9', exportResolution);
      setVideoUrl(url);
    } catch (err) {
      // Error handled in service (prompts key selection on 403)
      console.error(err);
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const handleGenerateIntro = async () => {
    setIsIntroGenerating(true);
    try {
      const url = await generateRadioIntro(introPrompt);
      setIntroAudioUrl(url);
    } catch (err) {
      alert("Voice generation failed.");
    } finally {
      setIsIntroGenerating(false);
    }
  };

  const handleSaveMixProject = () => {
    let currentStartTime = 0;
    const timestamps: string[] = [];
    mixTracks.forEach((track) => {
      const h = Math.floor(currentStartTime / 3600);
      const m = Math.floor((currentStartTime % 3600) / 60);
      const s = Math.floor(currentStartTime % 60);
      const stamp = h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      timestamps.push(`${stamp} ${track.title}`);
      currentStartTime += (track.durationSeconds - crossfade);
    });

    const bundle: ExportData = {
      timestampList: timestamps.join('\n'),
      youtubeDescription: `✨ ${mixName} ✨\n\nTracklist:\n${timestamps.join('\n')}\n\nProduced with LoFi Studio AI. Style: ${visualTheme}. Technical Specs: ${exportResolution} Video / ${exportAudioFormat} Audio.`,
      m3uContent: "#EXTM3U\n" + mixTracks.map(t => `#EXTINF:${t.durationSeconds},${t.title}\n${t.audioUrl}`).join('\n'),
      jsonConfig: JSON.stringify({ mixName, totalDurationSeconds, crossfade, theme: visualTheme, resolution: exportResolution, format: exportAudioFormat }),
      titleSuggestion: `lofi hip hop radio - beats to study/relax to [${Math.floor(totalDurationSeconds/3600)} HOUR MIX]`,
      thumbnailPrompt: videoPrompt,
      videoResolution: exportResolution,
      audioFormat: exportAudioFormat
    };

    const newMix: Mix = {
      id: `mix_${Date.now()}`,
      userId: INITIAL_USER.id,
      name: mixName,
      mood: mixMood,
      visualTheme: visualTheme,
      totalDurationSeconds,
      crossfadeDuration: crossfade,
      trackIds: selectedTrackIds,
      videoUrl: videoUrl,
      introAudioUrl: introAudioUrl,
      exportData: bundle,
      createdAt: new Date().toISOString(),
      isPublished: false
    };

    saveMix(newMix);
    setExportData(bundle);
    setShowExportModal(true);
  };

  const handleDownloadArchive = async () => {
    if (!exportData) return;
    setIsArchiving(true);

    try {
      const zip = new JSZip();
      
      // 1. Add Video
      if (videoUrl) {
        const videoResponse = await fetch(videoUrl);
        const videoBlob = await videoResponse.blob();
        zip.file(`${mixName.replace(/\s+/g, '_')}_Loop.mp4`, videoBlob);
      }

      // 2. Add Metadata
      const metadataContent = `
TITLE:
${exportData.titleSuggestion}

DESCRIPTION:
${exportData.youtubeDescription}

TRACKLIST:
${exportData.timestampList}

TECHNICAL:
${exportData.videoResolution} VIDEO
${exportData.audioFormat} AUDIO
      `.trim();
      
      zip.file("production_metadata.txt", metadataContent);

      // 3. Generate and Download ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${mixName.replace(/\s+/g, '_')}_Bundle.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setIsArchiving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <InspirationPanel onUseTemplate={handleUseTemplate} onReplicate={() => {}} />
      
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white mb-1 tracking-tight">Channel Architect</h2>
          <p className="text-slate-400 text-sm">Assemble beats and render visual loops for your next Volume.</p>
        </div>
        <div className="flex items-center space-x-3">
          {!hasSelectedKey && (
            <button 
              onClick={handleSelectKey}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-all"
            >
              <Key size={14} />
              <span>Connect Paid API Key</span>
            </button>
          )}
          <button 
            onClick={handleSaveMixProject} 
            disabled={mixTracks.length === 0}
            className="px-8 py-4 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/10 disabled:opacity-50 transition-all active:scale-95"
          >
            Finalize Production Bundle
          </button>
        </div>
      </header>

      <MixPlayer tracks={mixTracks} crossfade={crossfade} videoUrl={videoUrl} introAudioUrl={introAudioUrl} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2 px-1">
            <Music2 size={14} /> <span>Audio Vault</span>
          </h3>
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] h-[550px] overflow-y-auto p-5 space-y-2">
            {availableTracks.map(track => (
              <div key={track.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all group">
                <div>
                  <div className="text-xs font-bold text-slate-100 truncate">{track.title}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">{track.bpm} BPM</div>
                </div>
                <button onClick={() => setSelectedTrackIds(p => [...p, track.id])} className="p-2 bg-slate-800 rounded-lg text-amber-500 opacity-0 group-hover:opacity-100 transition-all"><Plus size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col space-y-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2 px-1">
            <Layers size={14} /> <span>Timeline Assembly</span>
          </h3>
          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] h-[550px] overflow-y-auto p-5 space-y-2 shadow-inner">
            {mixTracks.map((track, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 group">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">{index + 1}</div>
                <div className="text-xs font-bold text-white truncate flex-1">{track.title}</div>
                <button onClick={() => { const n = [...selectedTrackIds]; n.splice(index, 1); setSelectedTrackIds(n); }} className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Minus size={16} /></button>
              </div>
            ))}
            {mixTracks.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-700">
                  <Layers size={24} />
                </div>
                <p className="text-xs text-slate-600 font-medium">Timeline is empty.<br/>Add tracks from your vault.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
           {/* Technical Export Specs */}
           <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-4 shadow-xl flex flex-col">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                <Settings2 size={14} className="text-amber-500" /> <span>Production Settings</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center space-x-1">
                    <Tv size={10} /> <span>Video Resolution</span>
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['720p', '1080p'] as const).map(res => (
                      <button 
                        key={res} 
                        onClick={() => setExportResolution(res)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${exportResolution === res ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center space-x-1">
                    <Cpu size={10} /> <span>Audio Format</span>
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['WAV', 'MP3', 'AAC'] as const).map(fmt => (
                      <button 
                        key={fmt} 
                        onClick={() => setExportAudioFormat(fmt)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${exportAudioFormat === fmt ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
           </div>

           {/* Visual Style Architect */}
           <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-4 shadow-xl flex flex-col">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                <Palette size={14} className="text-amber-500" /> <span>Visual Style Architect</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                {Object.values(VisualTheme).map(theme => (
                  <button 
                    key={theme}
                    onClick={() => setVisualTheme(theme)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      visualTheme === theme 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-lg shadow-amber-500/10' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {THEME_ICONS[theme]}
                    <span className="text-[8px] font-bold uppercase tracking-tight mt-1">{theme}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col space-y-3">
                <textarea 
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs outline-none focus:border-amber-500/50 min-h-[100px] resize-none leading-relaxed"
                  placeholder="Describe the character, desk items, and what's outside the window..."
                />
                
                <div className="space-y-2">
                  {!hasSelectedKey && (
                    <p className="text-[10px] text-amber-500 font-bold bg-amber-500/5 p-2 rounded-lg border border-amber-500/20 flex items-center space-x-2">
                      <Key size={10} /> <span>Paid API Key required for Veo Video Generation.</span>
                    </p>
                  )}
                  <button 
                    onClick={handleGenerateVideo} 
                    disabled={isVideoGenerating} 
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all border border-slate-700"
                  >
                    {isVideoGenerating ? <Loader2 className="animate-spin text-amber-500" size={18} /> : <Sparkles className="text-amber-500" size={18} />}
                    <span>{isVideoGenerating ? `Rendering ${exportResolution} Loop...` : `Generate ${exportResolution} Video Loop`}</span>
                  </button>
                </div>
              </div>
           </div>

           {/* Intro Voice Section (Smaller) */}
           <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-3 shadow-xl flex flex-col">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                <Mic2 size={14} className="text-amber-500" /> <span>Radio Voice ID</span>
              </h3>
              <div className="flex space-x-3">
                <input 
                  value={introPrompt}
                  onChange={(e) => setIntroPrompt(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-amber-500/50"
                  placeholder="Intro script..."
                />
                <button 
                  onClick={handleGenerateIntro} 
                  disabled={isIntroGenerating} 
                  className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl font-bold flex items-center justify-center transition-all border border-amber-500/20"
                >
                  {isIntroGenerating ? <Loader2 className="animate-spin" size={16} /> : <AudioLines size={16} />}
                </button>
              </div>
              {introAudioUrl && <div className="text-[9px] text-emerald-500 font-bold flex items-center space-x-1"><Check size={10}/> <span>ID Ready</span></div>}
           </div>
        </div>
      </div>

      {showExportModal && exportData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <div>
                <h3 className="text-2xl font-black text-white">Production Bundle Ready</h3>
                <p className="text-sm text-slate-500 mt-1">Copy these details into your YouTube Studio upload.</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Video Title Suggestion</label>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-sm font-bold text-white leading-relaxed">
                      {exportData.titleSuggestion}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Aesthetic Tag</label>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-sm font-bold text-slate-400">
                      lofi, beats, {mixMood.toLowerCase()}, {visualTheme.toLowerCase()}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Technical Pipeline</label>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-[10px] font-bold text-amber-500 font-mono">
                      {exportData.videoResolution} VIDEO • {exportData.audioFormat} AUDIO
                    </div>
                 </div>
               </div>

               <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 relative">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest">YouTube Description & Timestamps</h4>
                    <button 
                      onClick={() => copyToClipboard(exportData.youtubeDescription)}
                      className="flex items-center space-x-2 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    {exportData.youtubeDescription}
                  </pre>
               </div>
            </div>
            <div className="p-10 border-t border-slate-800 flex justify-between items-center bg-slate-950/30">
               <button 
                onClick={handleDownloadArchive}
                disabled={isArchiving}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
               >
                 {isArchiving ? <Loader2 className="animate-spin" size={16} /> : <FileArchive size={16} />}
                 <span>{isArchiving ? "Packaging..." : "Download Bundle (.zip)"}</span>
               </button>
               <button onClick={() => setShowExportModal(false)} className="px-10 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-500/20">
                 Done
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
