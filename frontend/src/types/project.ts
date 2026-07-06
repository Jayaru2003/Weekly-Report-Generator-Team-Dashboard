export interface Project {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
}
