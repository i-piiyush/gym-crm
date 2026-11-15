import { InfoPage } from "@/components/shared/InfoPage";
export default function PrivacyPage() {
  return (
    <InfoPage
      title="Your information, clearly explained."
      description="How the current GYM-OS application handles gym and account information."
    >
      <section>
        <h2>Account and gym information</h2>
        <p>
          Account authentication is provided by Clerk. Gym records include
          names, email addresses, phone numbers, assigned roles, membership
          details, payment records, and attendance history. Access is restricted
          by account role and gym workspace.
        </p>
      </section>
      <section>
        <h2>Attendance and location</h2>
        <p>
          When you check in, the application requests your device location to
          verify proximity to the gym. Attendance records store the submitted
          coordinates, accuracy, distance, time, and verification result.
          Check-in requests may also record an IP address for auditing. Camera
          access is used to scan the reception QR code.
        </p>
      </section>
      <section>
        <h2>Payments and receipts</h2>
        <p>
          Payment records include the member, membership plan, amount, status,
          provider reference, and receipt number. Receipt delivery records
          include the destination email and delivery status. The currently
          implemented demo provider does not collect card details or charge a
          financial account.
        </p>
      </section>
      <section>
        <h2>Questions about your records</h2>
        <p>
          Contact your gym administrator to ask about the information stored in
          your workspace, its accuracy, and the gym’s retention practices. Your
          gym’s own privacy notice should explain its business-specific
          obligations and policies.
        </p>
      </section>
    </InfoPage>
  );
}
