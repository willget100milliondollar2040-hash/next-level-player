
export enum UserGoal {
  SCHOOL_TEAM = 'School Team',
  ACADEMY = 'Professional Academy',
  CASUAL = 'Street/Casual'
}

export enum Position {
  FWD = 'Forward',
  MID = 'Midfielder',
  DEF = 'Defender',
  GK = 'Goalkeeper'
}

export interface UserStats {
  technical: number;
  physical: number;
  tactical: number;
  mental: number;
  speed: number;
  stamina: number;
}

export interface AssessmentResults {
  date: string;
  sprint100m: number;
  juggling: number;
  dribbling: number;
  plank: number;
}

export interface Exercise {
  phase: 'Khởi động' | 'Tập chính' | 'Tập bổ trợ' | 'Thể lực';
  name: string;
  reps: string;
  description: string;
  youtubeQuery: string;
  completed: boolean;
}

export interface TrainingSession {
  id: string;
  title: string;
  type: 'technical' | 'physical' | 'recovery';
  duration: number;
  difficulty: number;
  completed: boolean;
  exercises: Exercise[];
}

export interface UserProfile {
  name: string;
  age: number;
  position: Position;
  goal: UserGoal;
  weaknesses: string;
  hoursPerWeek: number;
  sessionsPerWeek: number;
  stats: UserStats;
  statsHistory: { date: string; overall: number; technical: number; physical: number }[];
  assessment?: AssessmentResults;
  assessmentHistory: AssessmentResults[];
  evaluation?: string;
  streak: number;
  level: number;
  xp: number;
  currentWeek: number;
  currentSessions?: TrainingSession[]; // Thêm để lưu giáo án tuần hiện tại
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
