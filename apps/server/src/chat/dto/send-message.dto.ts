export type ChatMode = "ask" | "build" | "plan";

export class SendMessageDto {
  content: string;
  mode?: ChatMode;
  attachments?: string[];
}
