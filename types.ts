export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  ROAST = 'ROAST',
  ROAST_INDIAN = 'ROAST_INDIAN',
  FIX = 'FIX',
  INTERVIEW = 'INTERVIEW',
  PHOTO_EDITOR = 'PHOTO_EDITOR',
  BACKGROUND_GEN = 'BACKGROUND_GEN',
  STRATEGY = 'STRATEGY',
  TRANSCRIPTION = 'TRANSCRIPTION',
  ANALYZE = 'ANALYZE'
}

export interface AnalysisResult {
  text: string;
  score?: number;
  markdown?: boolean;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export interface VideoGenerationState {
  status: 'idle' | 'generating' | 'complete' | 'error';
  videoUrl?: string;
}

export interface AtsScoreData {
  current: number;
  projected?: number;
  status: 'SAFE' | 'RISK';
}