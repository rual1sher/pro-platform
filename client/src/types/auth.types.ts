import type { IOrganization } from "./organization.types";

export interface IRegister {
  name: string;
  email: string;
  password: string;
  remember?: boolean;
}

export interface ILogin {
  email: string;
  password: string;
  remember?: boolean;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
  organizations?: IOrganization[];
}
