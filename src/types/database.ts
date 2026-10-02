export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'student';
export type TaskType = 'assignment' | 'quiz' | 'sheet' | 'project' | 'exam';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type MaterialType =
  | 'pdf'
  | 'image'
  | 'document'
  | 'presentation'
  | 'spreadsheet'
  | 'youtube'
  | 'google_drive'
  | 'external_link';
export type EventType =
  | 'exam'
  | 'quiz'
  | 'assignment_deadline'
  | 'project_deadline'
  | 'lecture'
  | 'general';
export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  instructor: string | null;
  semester: string | null;
  academic_year: string | null;
  display_order: number;
  is_active: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  subject_id: string | null;
  type: TaskType;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  attachment_url: string | null;
  attachment_name: string | null;
  external_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface Material {
  id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  type: MaterialType;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  external_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface Announcement {
  id: string;
  subject_id: string | null;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface CalendarEvent {
  id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  type: EventType;
  location: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}
