"use client";

import { useState } from "react";
import { CustomerListItem, TrainerOption } from "@/types/person.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { reassignTrainerAction, removePersonAction } from "@/actions/person.actions";
import { toast } from "sonner";
import { LuUserCheck, LuTrash2, LuCalendar, LuSearch } from "react-icons/lu";
import { format } from "date-fns";

interface CustomersTableProps {
  customers: CustomerListItem[];
  trainers: TrainerOption[];
}

export function CustomersTable({
  customers: initialCustomers,
  trainers,
}: CustomersTableProps) {
  const [customers, setCustomers] = useState<CustomerListItem[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [reassigningCustomer, setReassigningCustomer] = useState<CustomerListItem | null>(null);
  const [targetTrainerId, setTargetTrainerId] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState<CustomerListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.trainerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleReassign = async () => {
    if (!reassigningCustomer || !targetTrainerId) return;

    setIsLoading(true);
    try {
      const res = await reassignTrainerAction({
        customerId: reassigningCustomer.id,
        newTrainerId: targetTrainerId,
      });

      if (res.success) {
        const newTrainer = trainers.find((t) => t.id === targetTrainerId);
        toast.success(
          `Reassigned ${reassigningCustomer.name} to ${newTrainer?.name || "new trainer"}`
        );
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === reassigningCustomer.id
              ? {
                  ...c,
                  trainerId: targetTrainerId,
                  trainerName: newTrainer?.name || c.trainerName,
                }
              : c
          )
        );
        setReassigningCustomer(null);
        setTargetTrainerId("");
      } else {
        toast.error(res.error || "Failed to reassign trainer.");
      }
    } catch {
      toast.error("An error occurred during reassignment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    setIsLoading(true);
    try {
      const res = await removePersonAction({
        userId: customerToDelete.id,
      });

      if (res.success) {
        toast.success(`Removed customer ${customerToDelete.name}`);
        setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
        setCustomerToDelete(null);
      } else {
        toast.error(res.error || "Failed to remove customer.");
      }
    } catch {
      toast.error("An error occurred while removing customer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or trainer..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length} of {customers.length} members
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Assigned Trainer</th>
                <th className="px-6 py-4">Plan / Validity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {search ? "No customers match your search." : "No customers enrolled yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  let validityText = "—";
                  if (customer.status === "TRIAL" && customer.trialEndsAt) {
                    validityText = `Trial ends ${format(new Date(customer.trialEndsAt), "dd MMM yyyy")}`;
                  } else if (customer.membershipEnd) {
                    validityText = `Valid until ${format(new Date(customer.membershipEnd), "dd MMM yyyy")}`;
                  }

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                        {customer.phone && (
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {customer.phone}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {customer.trainerName}
                          </span>
                          <button
                            onClick={() => {
                              setReassigningCustomer(customer);
                              setTargetTrainerId(customer.trainerId);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                            title="Reassign to another trainer"
                          >
                            <LuUserCheck className="h-3 w-3" />
                            <span>Change</span>
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-xs text-foreground">
                          {customer.planName || (customer.status === "TRIAL" ? "Free Trial" : "Custom")}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <LuCalendar className="h-3 w-3" />
                          <span>{validityText}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={customer.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setCustomerToDelete(customer)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Remove Customer"
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Trainer Modal */}
      {reassigningCustomer && (
        <ConfirmDialog
          isOpen={true}
          title={`Reassign Trainer for ${reassigningCustomer.name}`}
          description={`Select a new trainer to take over coaching and attendance oversight for ${reassigningCustomer.name}.`}
          confirmLabel="Update Assignment"
          variant="primary"
          isLoading={isLoading}
          onConfirm={handleReassign}
          onCancel={() => {
            setReassigningCustomer(null);
            setTargetTrainerId("");
          }}
        >
          <div className="mt-3">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Select New Trainer
            </label>
            <select
              value={targetTrainerId}
              onChange={(e) => setTargetTrainerId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>
        </ConfirmDialog>
      )}

      {/* Delete Customer Confirmation */}
      {customerToDelete && (
        <ConfirmDialog
          isOpen={true}
          title={`Remove Customer: ${customerToDelete.name}`}
          description={`Are you sure you want to remove ${customerToDelete.name}? This will archive their membership and attendance records.`}
          confirmLabel="Remove Customer"
          variant="destructive"
          isLoading={isLoading}
          onConfirm={handleDelete}
          onCancel={() => setCustomerToDelete(null)}
        />
      )}
    </div>
  );
}

