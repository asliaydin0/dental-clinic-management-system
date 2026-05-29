export type ToothStatus = 'healthy' | 'risk' | 'treatment' | 'completed';

export type TreatmentType = 'none' | 'dolgu' | 'kanal' | 'temizlik' | 'cekme' | 'muayene';

export interface ToothDetails {
  id: number; // 1-32 FDI tooth numbering system
  name: string;
  zone: 'upper-right' | 'upper-left' | 'lower-left' | 'lower-right';
  status: ToothStatus;
  notes: string;
  treatments: {
    type: TreatmentType;
    date: string;
    description: string;
  }[];
}

export interface BrushingLog {
  id: string;
  date: string;
  time: string;
  duration: number; // in seconds
  completed: boolean;
  score: number; // 0 - 100
}

export interface AnalysisFile {
  id: string;
  imageUrl: string;
  date: string;
  status: 'completed' | 'processing';
  score: number;
  plaqueIndex: number; // percentage
  cavitiesCount: number;
  recommendations: string[];
}
