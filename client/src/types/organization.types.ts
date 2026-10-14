export interface IOrganization {
  id: number;
  name: string;
  description?: string | null;
  role?: string;
  memberCount?: number;
  taskCount?: number;
  createdAt?: string;
}

export interface IOrganizationMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: string; // OWNER, ADMIN, MEMBER
  joinedAt?: string;
}
