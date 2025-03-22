import {
  Context,
  Conversation,
  ConversationFlavor,
  ObjectId,
  SessionFlavor,
} from "./deps.ts";

export interface User {
  _id: ObjectId;
  telegramId: number;
  firstName: string;
  lastName: string;
  class: string;
}

export interface Valentine {
  _id: ObjectId;
  senderId: number;
  recipientId: number;
  messageId: string;
  timestamp: Date;
}

export interface UserStats {
  firstName: string;
  lastName: string;
  class: string;
  count: number;
}

export interface SessionData {
  step?: "choosing_class" | "choosing_recipient" | "entering_message";
  selectedClass?: string;
  selectedUser?: User;
  classesPage?: number;
  usersPage?: number;
}

export type CallbackAction = "show_id";

export interface CallbackData {
  action: CallbackAction;
  messageId: string;
}

export type MyContext =
  & ConversationFlavor<Context>
  & SessionFlavor<SessionData>;

export type MyConversationContext = Context & SessionFlavor<SessionData>;

export type MyConversation = Conversation<MyContext, MyConversationContext>;
