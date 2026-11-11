import { SendEmailOptions, SendEmailResult } from "@/types/email.types";

export interface EmailProvider {
  name: "gmail-smtp" | "gmail-oauth";
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}

