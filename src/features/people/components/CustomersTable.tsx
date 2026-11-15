"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CustomerListItem, TrainerOption } from "@/types/person.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  reassignTrainerAction,
  removePersonAction,
} from "@/actions/person.actions";
import { toast } from "sonner";
import {
  Search,
  MoreHorizontal,
  UserRound,
  UserCheck,
  Trash2,
  CreditCard,
  Users,
} from "lucide-react";
import { format } from "date-fns";
export function CustomersTable({
  customers: initialCustomers,
  trainers,
}: {
  customers: CustomerListItem[];
  trainers: TrainerOption[];
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [reassigning, setReassigning] = useState<CustomerListItem | null>(null);
  const [targetTrainerId, setTargetTrainerId] = useState("");
  const [deleting, setDeleting] = useState<CustomerListItem | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);
  const filtered = customers.filter(
    (c) =>
      `${c.name} ${c.email} ${c.phone || ""} ${c.trainerName}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "ALL" || c.status === filter),
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 10)),
  );
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const date = (d: Date | null) =>
    d ? format(new Date(d), "dd MMM yyyy") : "—";
  const reassign = async () => {
    if (!reassigning || !targetTrainerId || busy) return;
    setBusy(true);
    try {
      const res = await reassignTrainerAction({
        customerId: reassigning.id,
        newTrainerId: targetTrainerId,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === reassigning.id
            ? {
                ...c,
                trainerId: targetTrainerId,
                trainerName:
                  trainers.find((t) => t.id === targetTrainerId)?.name ||
                  c.trainerName,
              }
            : c,
        ),
      );
      toast.success("Coach assignment updated.");
      setReassigning(null);
    } catch {
      toast.error("Could not update the coach. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      const res = await removePersonAction({ userId: deleting.id });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setCustomers((prev) => prev.filter((c) => c.id !== deleting.id));
      setDeleting(null);
      toast.success("Member removed.");
    } catch {
      toast.error("Could not remove the member. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-[340px]">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-dim" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, or phone…"
            aria-label="Search members"
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            aria-label="Filter membership status"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-card px-3 text-xs"
          >
            <option value="ALL">All memberships</option>
            {["ACTIVE", "TRIAL", "EXPIRED", "CANCELLED"].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <span className="text-xs text-dim">{filtered.length} members</span>
        </div>
      </div>
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[900px] text-left text-[13px]">
            <TableHeader className="border-b border-border bg-muted text-xs text-dim">
              <TableRow>
                {[
                  "Member",
                  "Membership",
                  "Contact",
                  "Joined",
                  "Expires",
                  "Status",
                  "",
                ].map((x, i) => (
                  <TableHead key={i} scope="col" className="px-5 py-4">
                    {x || <span className="sr-only">Actions</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/70">
              {visible.length ? (
                visible.map((c, i) => (
                  <TableRow key={c.id} className="hover:bg-muted">
                    <TableCell className="px-5 py-4">
                      <Link
                        href={`/admin/people/${c.id}`}
                        className="flex items-center gap-3"
                      >
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${i % 3 === 0 ? "bg-honeydew/55" : i % 3 === 1 ? "bg-desert/40" : "bg-sand/45"}`}
                        >
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <p className="font-medium hover:underline">
                            {c.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-dim">
                            Coach: {c.trainerName}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {c.planName ||
                        (c.status === "TRIAL" ? "Trial membership" : "No plan")}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <p className="text-xs text-dim">{c.email}</p>
                      <p className="mt-1 text-xs text-dim">{c.phone || "—"}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-5 py-4 text-xs text-dim">
                      {date(c.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-5 py-4 text-xs text-dim">
                      {date(
                        c.status === "TRIAL" ? c.trialEndsAt : c.membershipEnd,
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${c.name}`}
                            className="size-8"
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/people/${c.id}`}>
                              <UserRound />
                              View profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/people/${c.id}?renew=true`}>
                              <CreditCard />
                              Renew membership
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setReassigning(c);
                              setTargetTrainerId(c.trainerId);
                            }}
                          >
                            <UserCheck />
                            Assign coach
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/5"
                            onSelect={() => setDeleting(c)}
                          >
                            <Trash2 />
                            Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-14 text-center">
                    <Users className="mx-auto mb-3 size-6 text-dim/60" />
                    <p className="text-sm font-medium">
                      {search || filter !== "ALL"
                        ? "No matching members."
                        : "No members yet."}
                    </p>
                    <p className="mt-2 text-xs text-dim">
                      {search || filter !== "ALL"
                        ? "Try a different search or membership filter."
                        : "Your member list will appear here once you add your first member."}
                    </p>
                    {!customers.length && (
                      <Button asChild size="sm" className="mt-5">
                        <Link href="/admin/people?add=true">
                          Add your first member
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          page={currentPage}
          total={filtered.length}
          onChange={setPage}
        />
      </div>
      <ConfirmDialog
        isOpen={!!reassigning}
        title="Assign a coach"
        description={`Choose who will support ${reassigning?.name || "this member"}.`}
        variant="primary"
        confirmLabel="Save assignment"
        isLoading={busy}
        onConfirm={reassign}
        onCancel={() => setReassigning(null)}
      >
        <label
          htmlFor="assign-coach"
          className="mb-2 block text-xs font-medium"
        >
          Coach
        </label>
        <select
          id="assign-coach"
          value={targetTrainerId}
          onChange={(e) => setTargetTrainerId(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="">Select a coach</option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </ConfirmDialog>
      <ConfirmDialog
        isOpen={!!deleting}
        title="Remove this member?"
        description={`This permanently removes ${deleting?.name || "this member"} and their associated records. This cannot be undone.`}
        confirmLabel="Remove member"
        isLoading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
