export type Priority = 'high' | 'medium' | 'low';

export interface TaskStep {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  subject: string;
  description: string;
  deadline: string;
  dateTimestamp?: number;
  points: number;
  priority: Priority;
  status: 'active' | 'pending' | 'completed';
  steps?: TaskStep[];
  hasSos?: boolean;
  sosMessage?: string;
  studentName?: string;
  role_source?: 'teacher' | 'parent';
  attachment?: string;
  solution?: string;
}

export interface UserProfile {
  name: string;
  level: string;
  points: number;
  totalXP: number;
  nextLevelPoints: number;
  role: 'student' | 'teacher' | 'parent';
  achievements?: string[];
}

export interface FamilyGoal {
  id: string;
  targetXP: number;
  reward: string;
}
