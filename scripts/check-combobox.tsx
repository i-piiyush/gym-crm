import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Controller, useForm } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";
import { recordPaymentSchema } from "@/schemas/payment.schema";
import { addPersonSchema } from "@/schemas/person.schema";

const members = [
  { value: "", label: "Choose a member" },
  { value: "member-001", label: "Alice & Co (alice@example.test)" },
  { value: "member-002", label: "Bob (bob@example.test)" },
];
const plans = [
  { value: "", label: "No membership plan" },
  { value: "plan-annual", label: "Annual (365 days) — ₹18,000" },
];

function FormFixture({
  customerId = "member-001",
  planId = "plan-annual",
  disabled = false,
}: {
  customerId?: string;
  planId?: string | null;
  disabled?: boolean;
}) {
  const { control } = useForm<{ customerId: string; planId: string | null }>({
    defaultValues: { customerId, planId },
  });
  return (
    <form>
      <Controller
        name="customerId"
        control={control}
        render={({ field }) => (
          <Combobox
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value}
            onValueChange={field.onChange}
            options={members}
            disabled={disabled}
            aria-label="Member"
          />
        )}
      />
      <Controller
        name="planId"
        control={control}
        render={({ field }) => (
          <Combobox
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value || ""}
            onValueChange={field.onChange}
            options={plans}
            disabled={disabled}
            aria-label="Membership plan"
          />
        )}
      />
    </form>
  );
}

function hiddenFields(html: string) {
  return Object.fromEntries(
    [...html.matchAll(/<input\b[^>]*>/g)]
      .map(([tag]) => [tag.match(/name="([^"]+)"/)?.[1], tag.match(/value="([^"]*)"/)?.[1]])
      .filter(([name]) => name),
  );
}

const form = renderToStaticMarkup(<FormFixture />);
assert.deepEqual(hiddenFields(form), { customerId: "member-001", planId: "plan-annual" });
assert.match(form, /Alice &amp; Co \(alice@example.test\)/);
assert.match(form, /Annual \(365 days\) — ₹18,000/);
assert.equal([...form.matchAll(/role="combobox"/g)].length, 2);
assert.ok([...form.matchAll(/<button\b[^>]*>/g)].every(([tag]) => tag.includes('type="button"')));
assert.ok(recordPaymentSchema.safeParse(hiddenFields(form)).success);

const otherMember = renderToStaticMarkup(<FormFixture customerId="member-002" />);
assert.equal(hiddenFields(otherMember).customerId, "member-002");
assert.match(otherMember, /Bob \(bob@example.test\)/);

const cleared = renderToStaticMarkup(<FormFixture customerId="" planId={null} />);
assert.deepEqual(hiddenFields(cleared), { customerId: "", planId: "" });
assert.match(cleared, /Choose a member/);
assert.match(cleared, /No membership plan/);
assert.equal(recordPaymentSchema.safeParse(hiddenFields(cleared)).success, false);
assert.ok(addPersonSchema.safeParse({
  role: "CUSTOMER", name: "Test Member", email: "member@example.test",
  trainerId: "trainer-001", planId: hiddenFields(cleared).planId,
}).success);

const disabled = renderToStaticMarkup(<FormFixture disabled />);
assert.ok([...disabled.matchAll(/<(?:button|input)\b[^>]*>/g)].every(([tag]) => /\bdisabled=""/.test(tag)));

const invalid = renderToStaticMarkup(
  <Combobox
    id="invalid-member"
    value=""
    options={[]}
    onValueChange={() => {}}
    placeholder="Choose a member"
    aria-invalid
    aria-describedby="member-error"
  />,
);
assert.match(invalid, /id="invalid-member"/);
assert.match(invalid, /aria-invalid="true"/);
assert.match(invalid, /aria-describedby="member-error"/);
assert.match(invalid, /Choose a member/);

let migrated = 0;
function checkSource(directory: string) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) checkSource(file);
    else if (entry.name.endsWith(".tsx")) {
      const source = readFileSync(file, "utf8");
      assert.doesNotMatch(source, /<select\b|<datalist\b/, `Native dropdown remains in ${file}`);
      migrated += [...source.matchAll(/<Combobox\b/g)].length;
    }
  }
}
checkSource(join(process.cwd(), "src"));
assert.ok(migrated >= 11, "Expected all existing selection controls to use the combobox");
console.log(`Passed combobox SSR/form checks and migration coverage (${migrated} selection controls).`);
