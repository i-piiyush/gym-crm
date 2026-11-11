import { UserRoleType } from "@/constants/roles";
import { UserStatus, CustomerStatus } from "@/constants/status";

export interface TrainerListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: (typeof UserStatus)[keyof typeof UserStatus];
  monthlySalary: number;
  salaryDueDay: number;
  joinedAt: Date;
  assignedCustomersCount: number;
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: (typeof CustomerStatus)[keyof typeof CustomerStatus];
  trainerId: string;
  trainerName: string;
  planId: string | null;
  planName: string | null;
  membershipStart: Date | null;
  membershipEnd: Date | null;
  trialDays: number | null;
  trialEndsAt: Date | null;
  createdAt: Date;
}

export interface TrainerOption {
  id: string;
  name: string;
  email: string;
}

export interface PlanOption {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

export interface PendingInviteItem {
  id: string;
  email: string;
  role: UserRoleType;
  createdAt: Date;
}

