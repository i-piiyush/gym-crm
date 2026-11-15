"use client";

import { useState } from "react";
import { CustomerListItem, TrainerOption } from "@/types/person.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { reassignTrainerAction, removePersonAction } from "@/actions/person.actions";
import { toast } from "sonner";
import {
  Search,
  UserCheck,
  Trash2,
  Calendar,
  X,
  CreditCard,
  Mail,
  Phone,
  User,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedMember, setSelectedMember] = useState<CustomerListItem | null>(null);
  const [reassigningCustomer, setReassigningCustomer] = useState<CustomerListItem | null>(null);
  const [targetTrainerId, setTargetTrainerId] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState<CustomerListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.trainerName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

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
        const updatedList = customers.map((c) =>
          c.id === reassigningCustomer.id
            ? {
                ...c,
                trainerId: targetTrainerId,
                trainerName: newTrainer?.name || c.trainerName,
              }
            : c
        );
        setCustomers(updatedList);
        if (selectedMember && selectedMember.id === reassigningCustomer.id) {
          setSelectedMember({
            ...selectedMember,
            trainerId: targetTrainerId,
            trainerName: newTrainer?.name || selectedMember.trainerName,
          });
        }
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
        if (selectedMember && selectedMember.id === customerToDelete.id) {
          setSelectedMember(null);
        }
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
      {/* -------------------------------------------------------------------- */}
      {/* SEARCH BAR & STATUS FILTER PILLS */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#858585]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or trainer..."
            className="w-full rounded-full border border-[rgba(40,40,40,0.08)] bg-white pl-9 pr-4 py-1.5 text-xs text-[#242424] placeholder:text-[#858585] focus:border-[#242424] focus:outline-none focus:ring-1 focus:ring-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "ACTIVE", "TRIAL", "EXPIRED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                statusFilter === status
                  ? "bg-[#242424] text-white shadow-sm"
                  : "bg-white text-[#71697a] border border-[rgba(40,40,40,0.08)] hover:bg-stone-50 hover:text-[#242424]"
              }`}
            >
              {status === "ALL" ? "All Members" : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
          <span className="ml-2 text-xs text-[#71697a]">
            {filtered.length} {filtered.length === 1 ? "member" : "members"}
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPLE-STYLE CLEAN DATA TABLE */}
      {/* -------------------------------------------------------------------- */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(40,40,40,0.08)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
              <tr>
                <th className="px-5 py-3.5">Member</th>
                <th className="px-5 py-3.5">Membership</th>
                <th className="px-5 py-3.5">Assigned Coach</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5">Expiry Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#71697a]">
                    {search ? "No members match your search." : "No members enrolled yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  let expiryText = "—";
                  if (customer.status === "TRIAL" && customer.trialEndsAt) {
                    expiryText = `Trial: ${format(new Date(customer.trialEndsAt), "dd MMM yyyy")}`;
                  } else if (customer.membershipEnd) {
                    expiryText = format(new Date(customer.membershipEnd), "dd MMM yyyy");
                  }

                  const initials = customer.name
                    ? customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "M";

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedMember(customer)}
                      className="cursor-pointer transition-colors hover:bg-stone-50/70"
                    >
                      {/* 1. Member Avatar & Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f6d0] text-xs font-semibold text-[#242424]">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#242424] hover:underline">
                              {customer.name}
                            </p>
                            <p className="text-[11px] text-[#71697a]">{customer.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Membership */}
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-[#242424]">
                          {customer.planName || (customer.status === "TRIAL" ? "Free Trial" : "Custom Pass")}
                        </span>
                      </td>

                      {/* 3. Assigned Coach */}
                      <td className="px-5 py-3.5">
                        <span className="text-[#71697a]">
                          {customer.trainerName}
                        </span>
                      </td>

                      {/* 4. Joined Date */}
                      <td className="px-5 py-3.5 text-[#71697a] font-mono text-[11px]">
                        {customer.createdAt
                          ? format(new Date(customer.createdAt), "dd MMM yyyy")
                          : "—"}
                      </td>

                      {/* 5. Expiry Date */}
                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#71697a]">
                        {expiryText}
                      </td>

                      {/* 6. Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={customer.status} />
                      </td>

                      {/* 7. Actions */}
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedMember(customer)}
                            className="apple-button-press inline-flex items-center gap-1 rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-2.5 py-1 text-[11px] font-medium text-[#242424] hover:bg-stone-50"
                          >
                            <span>Profile</span>
                            <ChevronRight className="h-3 w-3 text-[#71697a]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReassigningCustomer(customer);
                              setTargetTrainerId(customer.trainerId);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#71697a] hover:bg-stone-100"
                            title="Reassign Trainer"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCustomerToDelete(customer)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Remove Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPLE-STYLE SLIDE-OUT MEMBER PROFILE SHEET */}
      {/* -------------------------------------------------------------------- */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedMember(null)}
          />

          {/* Slide-out Sheet Panel */}
          <div className="relative flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-[rgba(40,40,40,0.1)] p-6 overflow-y-auto">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-[rgba(40,40,40,0.06)] pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#71697a]">
                Member Profile
              </span>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#71697a] hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Avatar & Identity */}
            <div className="mt-6 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f2f6d0] text-xl font-semibold text-[#242424] shadow-sm">
                {selectedMember.name
                  ? selectedMember.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "M"}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#242424]">
                {selectedMember.name}
              </h3>
              <p className="text-xs text-[#71697a]">{selectedMember.email}</p>
              <div className="mt-2.5">
                <StatusBadge status={selectedMember.status} />
              </div>
            </div>

            {/* Membership Details Section */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#71697a]">
                Membership Details
              </h4>
              <div className="rounded-xl border border-[rgba(40,40,40,0.07)] bg-[#FAFAF8] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#71697a]">Current Plan</span>
                  <span className="font-semibold text-[#242424]">
                    {selectedMember.planName || (selectedMember.status === "TRIAL" ? "Free Trial" : "Custom")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#71697a]">Joined On</span>
                  <span className="font-mono text-[#242424]">
                    {selectedMember.createdAt
                      ? format(new Date(selectedMember.createdAt), "dd MMMM yyyy")
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#71697a]">Expiration Date</span>
                  <span className="font-mono font-medium text-[#242424]">
                    {selectedMember.membershipEnd
                      ? format(new Date(selectedMember.membershipEnd), "dd MMMM yyyy")
                      : selectedMember.trialEndsAt
                      ? `Trial ends ${format(new Date(selectedMember.trialEndsAt), "dd MMM yyyy")}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Coach Section */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#71697a]">
                  Assigned Coaching Staff
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setReassigningCustomer(selectedMember);
                    setTargetTrainerId(selectedMember.trainerId);
                  }}
                  className="text-xs font-medium text-[#242424] hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[rgba(40,40,40,0.07)] bg-[#FAFAF8] p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-[#242424]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#242424]">
                    {selectedMember.trainerName}
                  </p>
                  <p className="text-[11px] text-[#71697a]">Dedicated personal trainer</p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#71697a]">
                Contact Information
              </h4>
              <div className="rounded-xl border border-[rgba(40,40,40,0.07)] bg-[#FAFAF8] p-4 space-y-3">
                <div className="flex items-center gap-3 text-xs">
                  <Mail className="h-4 w-4 text-[#71697a]" />
                  <span className="text-[#242424]">{selectedMember.email}</span>
                </div>
                {selectedMember.phone && (
                  <div className="flex items-center gap-3 text-xs">
                    <Phone className="h-4 w-4 text-[#71697a]" />
                    <span className="font-mono text-[#242424]">{selectedMember.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Member Action CTAs */}
            <div className="mt-8 pt-4 border-t border-[rgba(40,40,40,0.07)] space-y-2.5">
              <Link
                href={`/admin/payments`}
                className="apple-button-press flex w-full items-center justify-center gap-2 rounded-full bg-[#242424] py-2.5 text-xs font-medium text-white shadow-sm hover:bg-[#383838]"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Record Payment / Renew Pass</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setCustomerToDelete(selectedMember);
                }}
                className="apple-button-press flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50/50 py-2.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Customer Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* REASSIGN TRAINER MODAL */}
      {/* -------------------------------------------------------------------- */}
      {reassigningCustomer && (
        <ConfirmDialog
          isOpen={true}
          title={`Reassign Coach for ${reassigningCustomer.name}`}
          description={`Select a new coach to oversee attendance and workout plans for ${reassigningCustomer.name}.`}
          confirmLabel="Update Coach"
          variant="primary"
          isLoading={isLoading}
          onConfirm={handleReassign}
          onCancel={() => {
            setReassigningCustomer(null);
            setTargetTrainerId("");
          }}
        >
          <div className="mt-3">
            <label className="block text-xs font-medium text-[#242424] mb-1.5">
              Choose New Trainer
            </label>
            <select
              value={targetTrainerId}
              onChange={(e) => setTargetTrainerId(e.target.value)}
              className="w-full rounded-xl border border-[rgba(40,40,40,0.1)] bg-white px-3 py-2 text-xs text-[#242424] focus:border-[#242424] focus:outline-none"
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

      {/* -------------------------------------------------------------------- */}
      {/* DELETE CUSTOMER CONFIRMATION */}
      {/* -------------------------------------------------------------------- */}
      {customerToDelete && (
        <ConfirmDialog
          isOpen={true}
          title={`Remove Member: ${customerToDelete.name}`}
          description={`Are you sure you want to remove ${customerToDelete.name}? This will archive their membership and check-in history.`}
          confirmLabel="Remove Member"
          variant="destructive"
          isLoading={isLoading}
          onConfirm={handleDelete}
          onCancel={() => setCustomerToDelete(null)}
        />
      )}
    </div>
  );
}
