export interface TaskQueryParams {
  status?: string;
  order?: string;
  priority?: string;
  preority?: string;
  assigneeId?: number;
  user_id?: number;
  organizationId?: number;
  search?: string;
}

export interface ITaskResponce {
  id: number;
  title: string;
  description: string;
  preority: string;
  priority?: string;
  order: string;
  status?: string;
  date: string;
  dueDate?: string;
  user_id?: number;
  assigneeId?: number;
  organizationId: number;
  assignee?: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITaskRequest {
  title: string;
  description?: string;
  preority?: string;
  priority?: string;
  order?: string;
  status?: string;
  date?: string;
  dueDate?: string;
  user_id?: number;
  assigneeId?: number;
  organizationId?: number;
}
