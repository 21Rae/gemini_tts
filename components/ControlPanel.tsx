import React from 'react';
import { Mic, Play, Loader2, Download, RotateCcw } from 'lucide-react';
import { VoiceName, VOICE_OPTIONS, VoiceOption } from '../types';

interface ControlPanelProps {
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
  hasAudio: boolean;
  onDownload: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedVoice,
  onVoiceChange,
  onGenerate,
  isGenerating,
  canGenerate,
  hasAudio,
  onDownload
}) => {
  return (
    <div className="flex flex-col space-y-6 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Select Voice
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VOICE_OPTIONS.map((voice: VoiceOption) => (
            <button
              key={voice.id}
              onClick={() => onVoiceChange(voice.id)}
              className={`relative flex items-center p-3 rounded-xl border transition-all duration-200 text-left group
                ${
                  selectedVoice === voice.id
                    ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                }
              `}
            >
              <div className={`p-2 rounded-full mr-3 ${selectedVoice === voice.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                <Mic size={18} />
              </div>
              <div>
                <div className={`text-sm font-semibold ${selectedVoice === voice.id ? 'text-indigo-400' : 'text-slate-200'}`}>
                  {voice.name}
                </div>
                <div className="text-xs text-slate-500">
                  {voice.gender} • {voice.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-2 border-t border-slate-700/50">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200
            ${
              !canGenerate || isGenerating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" />
              <span>Generate Speech</span>
            </>
          )}
        </button>

        {hasAudio && (
          <button
            onClick={onDownload}
            className="flex items-center justify-center p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Download WAV"
          >
            <Download size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
