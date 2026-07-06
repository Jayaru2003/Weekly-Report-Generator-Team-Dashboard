export interface ProjectMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'MEMBER' | 'MANAGER';
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  members?: ProjectMember[];
}

export interface ProjectRequest {
  name: string;
  description?: string;
}
