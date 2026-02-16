export interface IRegister {
  name: string;
  email: string;
  password: string;
  remember: boolean;
}

export interface ILogin {
  email: string;
  password: string;
  remember: boolean;
}

// task interface
export interface ITaskResponce {
  id: number;
  title: string;
  description: string;
  preority: string;
  order: string;
  date: string;
  user_id?: number;
}

export interface ITaskRequest {
  title: string;
  description: string;
  preority: string;
  order: string;
  date: string;
  user_id?: number;
}

// user interface
export interface IUser {
  id: number;
  name: string;
  email: string;
}
