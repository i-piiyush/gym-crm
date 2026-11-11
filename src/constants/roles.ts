export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TRAINER: "TRAINER",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  TRAINER: 2,
  CUSTOMER: 1,
};

