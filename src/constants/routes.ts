export const ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  NOT_INVITED: "/not-invited",
  SUPER_ADMIN: {
    DASHBOARD: "/super-admin",
    GYMS: "/super-admin/gyms",
    GYM_NEW: "/super-admin/gyms/new",
    GYM_DETAILS: (gymId: string) => `/super-admin/gyms/${gymId}`,
  },
  ADMIN: {
    DASHBOARD: "/admin",
    PEOPLE: "/admin/people",
    PAYMENTS: "/admin/payments",
    SALARIES: "/admin/salaries",
    TRIALS: "/admin/trials",
    SUBSCRIPTIONS: "/admin/subscriptions",
    ATTENDANCE: "/admin/attendance",
    ATTENDANCE_QR: "/admin/attendance/qr",
    SETTINGS: "/admin/settings",
  },
  TRAINER: {
    DASHBOARD: "/trainer",
    CUSTOMERS: "/trainer/customers",
    ATTENDANCE: "/trainer/attendance",
    SALARY: "/trainer/salary",
  },
  CUSTOMER: {
    DASHBOARD: "/customer",
    ATTENDANCE: "/customer/attendance",
    PAYMENTS: "/customer/payments",
  },
  CHECKIN: "/checkin",
} as const;

export const ROLE_HOME_ROUTES: Record<string, string> = {
  SUPER_ADMIN: ROUTES.SUPER_ADMIN.DASHBOARD,
  ADMIN: ROUTES.ADMIN.DASHBOARD,
  TRAINER: ROUTES.TRAINER.DASHBOARD,
  CUSTOMER: ROUTES.CUSTOMER.DASHBOARD,
};

