import { GymStatus } from "@/constants/status";

export interface GymListItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  attendanceRadiusMeters: number;
  timezone: string;
  maxCustomers: number;
  status: (typeof GymStatus)[keyof typeof GymStatus];
  receiptPrefix: string;
  customerCount: number;
  pendingCustomerInvitesCount: number;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
  pendingOwnerEmail: string | null;
  createdAt: Date;
}

export interface GymDetailsView {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  attendanceRadiusMeters: number;
  timezone: string;
  maxCustomers: number;
  status: (typeof GymStatus)[keyof typeof GymStatus];
  receiptPrefix: string;
  ownerUserId: string | null;
  pendingOwnerEmail: string | null;
  ownerName?: string;
  ownerEmail?: string;
}

