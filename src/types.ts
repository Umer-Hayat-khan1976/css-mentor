export type TargetExam = 'CSS' | 'PMS';

export interface UserProfile {
  uid: string;
  name: string;
  targetExam: TargetExam;
  optionalSubjects: string[];
  voiceEnabled: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'study_buddy';
  text: string;
  timestamp: number;
}

export interface UserStats {
  streak: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalMinutes: number;
  topicsReviewed: number;
}
