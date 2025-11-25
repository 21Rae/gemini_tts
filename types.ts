export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: 'Male' | 'Female';
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: VoiceName.Puck, name: 'Puck', gender: 'Male', description: 'Deep, resonant, and calm' },
  { id: VoiceName.Charon, name: 'Charon', gender: 'Male', description: 'Authoritative and clear' },
  { id: VoiceName.Kore, name: 'Kore', gender: 'Female', description: 'Warm, soothing, and natural' },
  { id: VoiceName.Fenrir, name: 'Fenrir', gender: 'Male', description: 'Energetic and bold' },
  { id: VoiceName.Zephyr, name: 'Zephyr', gender: 'Female', description: 'Soft, airy, and gentle' },
];

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffer: AudioBuffer | null;
}
