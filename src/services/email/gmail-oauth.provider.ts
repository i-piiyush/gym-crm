import { EmailProvider } from "./email.provider";
import { SendEmailOptions, SendEmailResult } from "@/types/email.types";

/**
 * STUB: Gmail OAuth Provider for Future Per-Owner Direct Gmail API Integration
 *
 * Requirements & Documentation:
 * 1. Requires Google Cloud Console Project with Gmail API enabled.
 * 2. Scope required: https://www.googleapis.com/auth/gmail.send
 * 3. IMPORTANT SECURITY NOTICE:
 *    - Apps using the gmail.send scope require Google Security Assessment / App Verification.
 *    - In "Testing" mode on Google Cloud Console, OAuth refresh tokens expire automatically
 *      after exactly 7 days, requiring the gym owner to re-authenticate weekly.
 *    - To maintain continuous production sending, the OAuth consent screen must be verified by Google.
 * 4. User sends email encoded as base64url RFC 2822 raw email string via:
 *    POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
 */
export class GmailOAuthProvider implements EmailProvider {
  name = "gmail-oauth" as const;

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    console.warn(
      "GmailOAuthProvider is currently a stub. To send transactional receipts, set EMAIL_PROVIDER=gmail-smtp."
    );

    return {
      success: false,
      error: "Gmail OAuth Provider is not yet configured for production sending.",
    };
  }
}

export const gmailOAuthProvider = new GmailOAuthProvider();

