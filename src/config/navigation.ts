import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Banknote,
  CalendarCheck2,
  QrCode,
  Settings,
  Hourglass,
  Clock,
  LucideIcon,
  HelpCircle,
  ChartNoAxesCombined,
  Dumbbell,
} from "lucide-react";
import { UserRoleType } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  section?: "OVERVIEW" | "MANAGEMENT" | "OPERATIONS" | "SYSTEM";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.ADMIN.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        title: "Members",
        href: ROUTES.ADMIN.PEOPLE,
        icon: Users,
      },
      {
        title: "Leads & trials",
        href: ROUTES.ADMIN.TRIALS,
        icon: Hourglass,
      },
      {
        title: "Attendance",
        href: ROUTES.ADMIN.ATTENDANCE,
        icon: CalendarCheck2,
      },
      {
        title: "Memberships",
        href: ROUTES.ADMIN.SUBSCRIPTIONS,
        icon: Clock,
      },
      {
        title: "Payments",
        href: ROUTES.ADMIN.PAYMENTS,
        icon: CreditCard,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { title: "Staff", href: "/admin/staff", icon: Dumbbell },
      { title: "Reports", href: "/admin/reports", icon: ChartNoAxesCombined },
      {
        title: "Attendance QR",
        href: ROUTES.ADMIN.ATTENDANCE_QR,
        icon: QrCode,
      },
      {
        title: "Trainer Payroll",
        href: ROUTES.ADMIN.SALARIES,
        icon: Banknote,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        title: "Settings",
        href: ROUTES.ADMIN.SETTINGS,
        icon: Settings,
      },
    ],
  },
];

export const ROLE_NAVIGATION: Record<UserRoleType, NavItem[]> = {
  SUPER_ADMIN: [
    {
      title: "Overview",
      href: ROUTES.SUPER_ADMIN.DASHBOARD,
      icon: LayoutDashboard,
      section: "OVERVIEW",
    },
    {
      title: "Gyms",
      href: ROUTES.SUPER_ADMIN.GYMS,
      icon: Building2,
      section: "MANAGEMENT",
    },
  ],
  ADMIN: ADMIN_NAV_SECTIONS.flatMap((s) => s.items),
  TRAINER: [
    {
      title: "Overview",
      href: ROUTES.TRAINER.DASHBOARD,
      icon: LayoutDashboard,
      section: "OVERVIEW",
    },
    {
      title: "My Customers",
      href: ROUTES.TRAINER.CUSTOMERS,
      icon: Users,
      section: "MANAGEMENT",
    },
    {
      title: "Attendance",
      href: ROUTES.TRAINER.ATTENDANCE,
      icon: CalendarCheck2,
      section: "OPERATIONS",
    },
    {
      title: "Salary History",
      href: ROUTES.TRAINER.SALARY,
      icon: Banknote,
      section: "OPERATIONS",
    },
  ],
  CUSTOMER: [
    {
      title: "Overview",
      href: ROUTES.CUSTOMER.DASHBOARD,
      icon: LayoutDashboard,
      section: "OVERVIEW",
    },
    {
      title: "My Attendance",
      href: ROUTES.CUSTOMER.ATTENDANCE,
      icon: CalendarCheck2,
      section: "OPERATIONS",
    },
    {
      title: "Payments",
      href: ROUTES.CUSTOMER.PAYMENTS,
      icon: CreditCard,
      section: "OPERATIONS",
    },
  ],
};
