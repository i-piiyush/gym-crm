import { InfoPage } from "@/components/shared/InfoPage";
import Link from "next/link";
export default function HelpPage() {
  return (
    <InfoPage
      title="A little help, when you need it."
      description="Simple answers to keep your gym moving."
    >
      <section>
        <h2>Getting into your workspace</h2>
        <p>
          Your gym administrator sends an invitation to your email. Follow that
          invitation to activate your access, then <Link href="/sign-in">sign in</Link> with the same email. Your
          assigned role determines the workspace you can access. If you don’t
          see a gym, ask reception to check your invitation.
        </p>
      </section>
      <section>
        <h2>Members and memberships</h2>
        <p>
          Open Members to add a member or coach. Members require an assigned
          active coach. Open a member’s profile to see membership details,
          payment history, and attendance. Renew a membership by recording a
          payment against an active plan. Configure plans in Settings.
        </p>
      </section>
      <section>
        <h2>Attendance</h2>
        <p>
          Open the check-in station at reception. Members scan the rotating QR
          code using Check in in their own workspace. Camera and location access
          are required for verified check-ins. If a scan fails, check your
          device permissions and try again at the gym. Attendance shows daily
          check-ins and monthly consistency.
        </p>
      </section>
      <section>
        <h2>Payments and receipts</h2>
        <p>
          The current payment provider is a demo: it records a simulated payment
          and updates the membership. It does not charge a real card or bank
          account. Recorded payments have downloadable receipts. You can retry
          receipt email delivery from Payments when needed.
        </p>
      </section>
      <section>
        <h2>What is supported today?</h2>
        <p>
          Member and coach invitations, trials and conversions, memberships and
          renewals, QR attendance, payment records, receipts, trainer payroll,
          and reports from current records are available. Class scheduling, a
          full sales pipeline, saved member notes, and historical retention
          tracking are not yet supported.
        </p>
      </section>
      <section>
        <h2>Need help with your account?</h2>
        <p>
          Contact your gym manager for invitations, membership questions, and
          account access. Use the profile menu for account preferences and
          signing out.
        </p>
      </section>
    </InfoPage>
  );
}
