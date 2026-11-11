import { IconType } from "react-icons";
import {
  LuLayoutDashboard,
  LuBuilding2,
  LuUsers,
  LuCreditCard,
  LuBanknote,
  LuCalendarCheck,
  LuQrCode,
  LuSettings,
  LuHourglass,
  LuClock,
} from "react-icons/lu";
import { UserRoleType } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export interface NavItem {
  title: string;
  href: string;
  icon: IconType;
  badge?: string;
}

export const ROLE_NAVIGATION: Record<UserRoleType, NavItem[]> = {
  SUPER_ADMIN: [
    {
      title: "Overview",
      href: ROUTES.SUPER_ADMIN.DASHBOARD,
      icon: LuLayoutDashboard,
    },
    {
      title: "Gyms",
      href: ROUTES.SUPER_ADMIN.GYMS,
      icon: LuBuilding2,
    },
  ],
  ADMIN: [
    {
      title: "Overview",
      href: ROUTES.ADMIN.DASHBOARD,
      icon: LuLayoutDashboard,
    },
    {
      title: "People",
      href: ROUTES.ADMIN.PEOPLE,
      icon: LuUsers,
    },
    {
      title: "Payments",
      href: ROUTES.ADMIN.PAYMENTS,
      icon: LuCreditCard,
    },
    {
      title: "Salaries",
      href: ROUTES.ADMIN.SALARIES,
      icon: LuBanknote,
    },
    {
      title: "Trials",
      href: ROUTES.ADMIN.TRIALS,
      icon: LuHourglass,
    },
    {
      title: "Subscriptions",
      href: ROUTES.ADMIN.SUBSCRIPTIONS,
      icon: LuClock,
    },
    {
      title: "Attendance",
      href: ROUTES.ADMIN.ATTENDANCE,
      icon: LuCalendarCheck,
    },
    {
      title: "Attendance QR",
      href: ROUTES.ADMIN.ATTENDANCE_QR,
      icon: LuQrCode,
    },
    {
      title: "Settings",
      href: ROUTES.ADMIN.SETTINGS,
      icon: LuSettings,
    },
  ],
  TRAINER: [
    {
      title: "Overview",
      href: ROUTES.TRAINER.DASHBOARD,
      icon: LuLayoutDashboard,
    },
    {
      title: "My Customers",
      href: ROUTES.TRAINER.CUSTOMERS,
      icon: LuUsers,
    },
    {
      title: "Attendance",
      href: ROUTES.TRAINER.ATTENDANCE,
      icon: LuCalendarCheck,
    },
    {
      title: "Salary History",
      href: ROUTES.TRAINER.SALARY,
      icon: LuBanknote,
    },
  ],
  CUSTOMER: [
    {
      title: "Overview",
      href: ROUTES.CUSTOMER.DASHBOARD,
      icon: LuLayoutDashboard,
    },
    {
      title: "Attendance",
      href: ROUTES.CUSTOMER.ATTENDANCE,
      icon: LuCalendarCheck,
    },
    {
      title: "Payments & Receipts",
      href: ROUTES.CUSTOMER.PAYMENTS,
      icon: LuCreditCard,
    },
  ],
};

