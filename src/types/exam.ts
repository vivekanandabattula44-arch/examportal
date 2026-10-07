export type Category = 'Java' | 'Data Structures' | 'Python Basics' | 'General Knowledge';

export interface Question {
  id: string;
  category: Category;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  category: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  status: 'in_progress' | 'submitted' | 'timed_out';
  score: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number>; // questionId -> selectedIndex
  startedAt: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  channel: string;
  channelUrl: string;
  url: string;
  category: Category | 'All';
  description: string;
  thumbnailBadge: string;
  topics: string[];
}
