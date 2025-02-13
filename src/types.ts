import { Conversation } from "https://deno.land/x/grammy_conversations@v1.2.0/mod.ts";
import { Context, ConversationFlavor } from "./deps.ts";
import { ObjectId } from "./deps.ts";
import { SessionFlavor } from "https://deno.land/x/grammy@v1.34.0/mod.ts";

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

export type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData>;
export type MyConversation = Conversation<MyContext>;