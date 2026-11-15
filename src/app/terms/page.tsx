import { InfoPage } from "@/components/shared/InfoPage";
export default function TermsPage() {
  return (
    <InfoPage
      title="Using GYM-OS."
      description="A practical guide to account access and the current product’s capabilities."
    >
      <section>
        <h2>Workspace access</h2>
        <p>
          Workspaces are invitation-based. Use your own account and the email
          invited by your gym administrator. Your role determines the gym
          records and operations you can access. Do not share account
          credentials or use another member’s attendance identity.
        </p>
      </section>
      <section>
        <h2>Gym operations</h2>
        <p>
          Your gym administers memberships, plan prices, attendance
          requirements, and staff assignments. Questions about gym services,
          membership cancellation, refunds, or billing arrangements should be
          directed to your gym.
        </p>
      </section>
      <section>
        <h2>Current payment capabilities</h2>
        <p>
          The current demo payment provider simulates payments, creates receipt
          records, and updates memberships. A demo transaction does not charge a
          bank account or payment card. Real payment processing is not yet
          implemented.
        </p>
      </section>
      <section>
        <h2>Product and business policies</h2>
        <p>
          This page describes current product behavior. Any service agreement,
          commercial terms, or gym membership contract must be provided
          separately by the relevant operator.
        </p>
      </section>
    </InfoPage>
  );
}
