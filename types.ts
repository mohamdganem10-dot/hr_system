export interface Attachment {
  id: string;
  name: string;
  file?: File;
  url?: string;
  progress?: number;
  isUploading?: boolean;
  isUploaded?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  endDate?: string;
  salary: number;
  photo?: Attachment; // Changed from photoUrl to Attachment
  attachments: Attachment[];
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  uploader: string;
  uploadDate: string;
  tags: string[];
  projectId?: string;
  attachment?: Attachment;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  manager: string;
  department: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in_progress' | 'on_hold' | 'not_started';
  progress: number;
  assignedEmployeeIds: string[];
  attachments: Attachment[];
}

export type UserRole = 'مدير' | 'مدير قسم' | 'موارد بشرية' | 'مالية' | 'مستخدم';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
}

export interface Department {
    id: string;
    name: string;
    description: string;
}