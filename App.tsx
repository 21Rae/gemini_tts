import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, MessageSquare, Volume2, AlertCircle } from 'lucide-react';
import { VoiceName } from './types';
import { generateSpeech } from './services/geminiService';
import { decodeBase64, decodeAudioData, bufferToWav } from './utils/audioUtils';
import ControlPanel from './components/ControlPanel';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyserState, setAnalyserState] = useState<AnalyserNode | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    const initAudio = () => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 24000 }); // Match Gemini sample rate
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      setAnalyserState(analyser); // For state updates to re-render visualizer
    };
    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);
    stopAudio(); // Stop any current playback

    try {
      // 1. Fetch raw PCM base64 from Gemini
      const base64Data = await generateSpeech(text, selectedVoice);

      // 2. Decode base64 to Uint8Array
      const rawBytes = decodeBase64(base64Data);

      // 3. Decode PCM to AudioBuffer
      if (audioContextRef.current) {
        const buffer = await decodeAudioData(
            rawBytes, 
            audioContextRef.current, 
            24000
        );
        setAudioBuffer(buffer);
        // Auto-play after generation
        playAudio(buffer);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate speech. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = useCallback((buffer: AudioBuffer) => {
    if (!audioContextRef.current || !analyserRef.current) return;

    // Stop previous
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // ignore
      }
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    
    // Connect Source -> Analyser -> Destination
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    source.onended = () => {
      setIsPlaying(false);
    };

    source.start(0);
    sourceNodeRef.current = source;
    setIsPlaying(true);
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
         // ignore
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleDownload = () => {
    if (!audioBuffer) return;
    const blob = bufferToWav(audioBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-speech-${selectedVoice}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePlayback = () => {
      if (isPlaying) {
          stopAudio();
      } else if (audioBuffer) {
          playAudio(audioBuffer);
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] translate-y-1/2"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Gemini Voice Studio
            </h1>
            <p className="text-sm text-slate-500">Professional Text-to-Speech Converter</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Input Area */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="relative flex-1 group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
               <div className="relative h-full bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                 <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center space-x-2 text-slate-400">
                        <MessageSquare size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">Input Text</span>
                    </div>
                    <span className="text-xs text-slate-500">{text.length} chars</span>
                 </div>
                 <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech here..."
                    className="flex-1 w-full bg-transparent p-6 text-lg leading-relaxed resize-none focus:outline-none placeholder:text-slate-600 text-slate-200 min-h-[300px]"
                 />
               </div>
            </div>
            
            {error && (
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="shrink-0 h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Visualizer Card */}
            <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-indigo-400">
                      <Volume2 size={18} />
                      <span className="text-sm font-semibold">Audio Output</span>
                  </div>
                  {audioBuffer && (
                    <button 
                        onClick={togglePlayback}
                        className="text-xs font-medium px-2 py-1 rounded bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                        {isPlaying ? 'STOP' : 'REPLAY'}
                    </button>
                  )}
               </div>
               
               <Visualizer analyser={analyserState} isPlaying={isPlaying} />
               
               <div className="mt-4 flex justify-between text-xs text-slate-500 font-mono">
                 <span>00:00</span>
                 <span>{audioBuffer ? `${audioBuffer.duration.toFixed(2)}s` : '--:--'}</span>
               </div>
            </div>

            {/* Control Panel */}
            <ControlPanel
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              canGenerate={text.trim().length > 0}
              hasAudio={!!audioBuffer}
              onDownload={handleDownload}
            />

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                 <p className="text-xs text-slate-500">
                    Powered by <span className="text-indigo-400 font-medium">Gemini 2.5 Flash</span>. 
                    Supports multiple languages and nuances automatically.
                 </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
