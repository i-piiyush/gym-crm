import nodemailer from "nodemailer";
import { EmailProvider } from "./email.provider";
import { SendEmailOptions, SendEmailResult } from "@/types/email.types";

export class GmailSmtpProvider implements EmailProvider {
  name = "gmail-smtp" as const;

  private getTransporter() {
    const user = process.env.GMAIL_SMTP_USER;
    const pass = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s+/g, "");

    if (!user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user,
        pass,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const transporter = this.getTransporter();
    const fromName = options.fromName || process.env.EMAIL_FROM_NAME_DEFAULT || "Gym CRM";
    const fromUser = process.env.GMAIL_SMTP_USER || "noreply@gymcrm.com";

    // If SMTP credentials not provided (e.g. in test or dev without credentials)
    if (!transporter) {
      console.log("ℹ️ [Dev Mailer Simulated Send]");
      console.log(`   To: ${options.to}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Attachments: ${options.attachments?.length || 0} file(s)`);
      return {
        success: true,
        messageId: `simulated_msg_${Date.now()}`,
      };
    }

    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromUser}>`,
        to: options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "SMTP transport error";
      console.error("Gmail SMTP Send Failure:", errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}

export const gmailSmtpProvider = new GmailSmtpProvider();

