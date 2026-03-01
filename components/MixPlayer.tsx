
import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../types';
import { Play, Pause, Volume2, Loader2, Maximize2, Mic2 } from 'lucide-react';

interface MixPlayerProps {
  tracks: Track[];
  crossfade: number;
  videoUrl?: string | null;
  introAudioUrl?: string | null;
}

export const MixPlayer: React.FC<MixPlayerProps> = ({ tracks, crossfade, videoUrl, introAudioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerRef.current.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;
      ctx.fillStyle = `rgba(245, 158, 11, ${barHeight / 100})`; // Amber color theme
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }

    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  };

  const updateProgress = () => {
    if (!isPlaying || !audioContextRef.current || !currentSourceRef.current?.buffer) return;
    
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    const duration = currentSourceRef.current.buffer.duration;
    setProgress((elapsed / duration) * 100);
    
    // We don't need a separate animation frame for progress if we have the visualizer one, 
    // but keeping it simple for now.
  };

  const stopAll = () => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e) {}
      currentSourceRef.current = null;
    }
    cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    setIsIntroPlaying(false);
    setProgress(0);
  };

  const playAudio = async (url: string, onEnd?: () => void) => {
    setIsLoading(true);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      
      gainNodeRef.current.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);
      
      drawVisualizer();
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNodeRef.current!);
      
      currentSourceRef.current = source;
      startTimeRef.current = audioContextRef.current.currentTime;
      source.start(0);
      setIsPlaying(true);
      
      source.onended = () => {
        if (onEnd) onEnd();
      };
    } catch (err) {
      console.error("Playback error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startMix = async () => {
    if (introAudioUrl && currentIndex === 0 && !isIntroPlaying) {
      setIsIntroPlaying(true);
      await playAudio(introAudioUrl, () => {
        setIsIntroPlaying(false);
        playTrack(0);
      });
    } else {
      playTrack(currentIndex);
    }
  };

  const playTrack = async (index: number) => {
    if (!tracks[index]) return;
    setCurrentIndex(index);
    await playAudio(tracks[index].audioUrl, () => {
      const nextIndex = (index + 1) % tracks.length;
      playTrack(nextIndex);
    });
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAll();
    } else {
      if (tracks.length > 0) {
        startMix();
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(updateProgress, 100);
    return () => {
      clearInterval(interval);
      stopAll();
    };
  }, [isPlaying]);

  return (
    <div className="relative group rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50 backdrop-blur-xl">
      {/* Visual Background - The "Live Stream" look */}
      <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            autoPlay 
            loop 
            muted 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 lofi-screen"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
             <div className="w-20 h-20 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin-slow" />
             <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">Awaiting Visual Assets</p>
          </div>
        )}
        
        {/* CRT Overlay Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 lofi-scanlines" />

        {/* Audio Visualizer Overlay */}
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={200} 
          className="absolute bottom-0 left-0 w-full h-1/4 pointer-events-none opacity-40" 
        />
        
        {/* Stream Overlay Info */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Stream Preview</span>
            </div>
            <div className="flex space-x-2">
              {introAudioUrl && (
                <div className="bg-amber-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center space-x-2 text-amber-500">
                  <Mic2 size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Radio Intro Ready</span>
                </div>
              )}
              <button className="p-2 bg-slate-950/50 rounded-lg text-slate-400 pointer-events-auto hover:text-white transition-colors">
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 w-fit max-w-[80%] transition-transform duration-500 translate-y-0 group-hover:-translate-y-2">
            <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1 flex items-center space-x-2">
               {isIntroPlaying ? <Mic2 size={10} className="animate-pulse" /> : <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
               <span>{isIntroPlaying ? "Broadcasting Voice Intro" : "Now Playing"}</span>
            </div>
            <div className="text-sm font-bold text-white truncate">
              {isIntroPlaying ? "Lofi Radio ID" : (tracks[currentIndex]?.title || "Radio Offline")}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{isIntroPlaying ? "Vocal Channel Active" : `${tracks[currentIndex]?.bpm} BPM • Auto-Transition`}</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 flex items-center space-x-4 bg-slate-900/80 border-t border-slate-800">
        <button 
          onClick={togglePlay}
          disabled={tracks.length === 0 || isLoading}
          className="p-3 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 active:scale-90"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isPlaying ? <Pause size={20} /> : <Play size={20} />)}
        </button>
        
        <div className="flex-1">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-500 bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-800">
          <Volume2 size={16} />
          <div className="w-16 h-1 bg-slate-800 rounded-full relative overflow-hidden">
            <div className="w-3/4 h-full bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>
      
      <style>{`
        .lofi-scanlines {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 4px, 3px 100%;
          z-index: 10;
        }
        .lofi-screen {
          filter: contrast(1.1) brightness(0.9) saturate(0.8);
        }
        @keyframes flicker {
          0% { opacity: 0.97; }
          5% { opacity: 0.95; }
          10% { opacity: 0.9; }
          15% { opacity: 0.95; }
          20% { opacity: 0.98; }
          25% { opacity: 0.95; }
          30% { opacity: 0.9; }
          100% { opacity: 0.98; }
        }
        .lofi-screen {
          animation: flicker 0.15s infinite;
        }
      `}</style>
    </div>
  );
};
