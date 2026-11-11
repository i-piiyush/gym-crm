import type { UserRoleType } from "@/constants/roles";

export interface ClerkPublicMetadata {
  role?: UserRoleType;
  gymId?: string;
  onboarded?: boolean;
}

export interface UserSessionContext {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: UserRoleType;
  gymId: string | null;
  status: "INVITED" | "ACTIVE" | "INACTIVE";
}

