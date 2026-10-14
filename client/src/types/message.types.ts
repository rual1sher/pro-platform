export type MessageType = "TASK_COMMENT" | "ORG_CHAT";

export interface IMessageAuthor {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface IMessage {
  id: number;
  content: string;
  type: MessageType;
  taskId?: number | null;
  organizationId?: number | null;
  authorId: number;
  author: IMessageAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface IMessageRequest {
  content: string;
}
