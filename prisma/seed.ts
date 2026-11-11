import { PrismaClient, UserRole, UserStatus, CustomerStatus, PaymentProviderType, PaymentStatus, DeliveryChannel, DeliveryStatus, SalaryStatus, GymStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing records in reverse dependency order
  await prisma.attendance.deleteMany();
  await prisma.receiptDelivery.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.receiptCounter.deleteMany();
  await prisma.salaryRecord.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.trainerProfile.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.gym.deleteMany();

  console.log("🧹 Cleaned database tables.");

  // 1. Super Admin
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAILS?.split(",")[0] || "superadmin@gymcrm.com").trim().toLowerCase();
  const superAdmin = await prisma.user.create({
    data: {
      clerkId: "clerk_super_admin_seed",
      email: superAdminEmail,
      name: "Platform Super Admin",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      gymId: null,
    },
  });
  console.log(`👤 Created Super Admin: ${superAdmin.email}`);

  // 2. Gym 1: Iron Peak Fitness
  const gym1 = await prisma.gym.create({
    data: {
      name: "Iron Peak Fitness",
      address: "Select Citywalk, Saket District Centre, New Delhi, Delhi 110017",
      latitude: 28.528352,
      longitude: 77.219154,
      attendanceRadiusMeters: 50,
      timezone: "Asia/Kolkata",
      maxCustomers: 50,
      status: GymStatus.ACTIVE,
      receiptPrefix: "IPF",
    },
  });

  // Gym 1 Admin
  const admin1 = await prisma.user.create({
    data: {
      clerkId: "clerk_admin_gym1",
      email: "admin.saket@ironpeak.com",
      name: "Vikram Malhotra",
      phone: "+919876543210",
      role: UserRole.ADMIN,
      gymId: gym1.id,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.gym.update({
    where: { id: gym1.id },
    data: { ownerUserId: admin1.id },
  });

  // Gym 1 Plans
  const planMonthly1 = await prisma.membershipPlan.create({
    data: {
      gymId: gym1.id,
      name: "Monthly Strength",
      durationDays: 30,
      price: 2499.0,
      isActive: true,
    },
  });

  const planQuarterly1 = await prisma.membershipPlan.create({
    data: {
      gymId: gym1.id,
      name: "Quarterly Pro",
      durationDays: 90,
      price: 6499.0,
      isActive: true,
    },
  });

  const planAnnual1 = await prisma.membershipPlan.create({
    data: {
      gymId: gym1.id,
      name: "Annual Elite",
      durationDays: 365,
      price: 21999.0,
      isActive: true,
    },
  });

  // Gym 1 Trainers
  const trainer1A = await prisma.user.create({
    data: {
      clerkId: "clerk_trainer_1a",
      email: "arjun.kapoor@ironpeak.com",
      name: "Arjun Kapoor",
      phone: "+919811122233",
      role: UserRole.TRAINER,
      gymId: gym1.id,
      status: UserStatus.ACTIVE,
      trainerProfile: {
        create: {
          monthlySalary: 35000.0,
          salaryDueDay: 5,
        },
      },
    },
  });

  const trainer1B = await prisma.user.create({
    data: {
      clerkId: "clerk_trainer_1b",
      email: "priya.nair@ironpeak.com",
      name: "Priya Nair",
      phone: "+919822233344",
      role: UserRole.TRAINER,
      gymId: gym1.id,
      status: UserStatus.ACTIVE,
      trainerProfile: {
        create: {
          monthlySalary: 40000.0,
          salaryDueDay: 5,
        },
      },
    },
  });

  // Gym 1 Receipt Counter for current year
  const currentYear = new Date().getFullYear();
  await prisma.receiptCounter.create({
    data: {
      gymId: gym1.id,
      year: currentYear,
      lastNumber: 10,
    },
  });

  // Gym 1: 10 Customers with mixed statuses
  const customerConfigs1 = [
    { name: "Rahul Sharma", email: "rahul.sharma@example.com", status: CustomerStatus.ACTIVE, daysLeft: 22, trainerId: trainer1A.id, plan: planMonthly1 },
    { name: "Ananya Deshmukh", email: "ananya.d@example.com", status: CustomerStatus.ACTIVE, daysLeft: 75, trainerId: trainer1A.id, plan: planQuarterly1 },
    { name: "Rohan Varma", email: "rohan.v@example.com", status: CustomerStatus.ACTIVE, daysLeft: 5, trainerId: trainer1B.id, plan: planMonthly1 }, // expiring in 5 days
    { name: "Deepak Mehta", email: "deepak.m@example.com", status: CustomerStatus.ACTIVE, daysLeft: 310, trainerId: trainer1B.id, plan: planAnnual1 },
    { name: "Sneha Patel", email: "sneha.patel@example.com", status: CustomerStatus.TRIAL, trialDays: 7, trialDaysLeft: 3, trainerId: trainer1A.id, plan: null },
    { name: "Kunal Singhania", email: "kunal.s@example.com", status: CustomerStatus.TRIAL, trialDays: 3, trialDaysLeft: 1, trainerId: trainer1B.id, plan: null },
    { name: "Pooja Hegde", email: "pooja.h@example.com", status: CustomerStatus.EXPIRED, daysExpired: 12, trainerId: trainer1A.id, plan: planMonthly1 },
    { name: "Manish Tiwari", email: "manish.t@example.com", status: CustomerStatus.EXPIRED, daysExpired: 45, trainerId: trainer1B.id, plan: planMonthly1 },
    { name: "Neha Roy", email: "neha.roy@example.com", status: CustomerStatus.CANCELLED, daysExpired: 90, trainerId: trainer1A.id, plan: planQuarterly1 },
    { name: "Aditya Joshi", email: "aditya.j@example.com", status: CustomerStatus.ACTIVE, daysLeft: 18, trainerId: trainer1B.id, plan: planMonthly1 },
  ];

  const todayStr = new Date().toISOString().split("T")[0]!;

  for (let i = 0; i < customerConfigs1.length; i++) {
    const cfg = customerConfigs1[i]!;
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    let trialEndsAt: Date | null = null;

    if (cfg.status === CustomerStatus.ACTIVE && cfg.daysLeft) {
      start = new Date(now.getTime() - (30 - cfg.daysLeft) * 86400000);
      end = new Date(now.getTime() + cfg.daysLeft * 86400000);
    } else if (cfg.status === CustomerStatus.TRIAL && cfg.trialDaysLeft) {
      start = now;
      trialEndsAt = new Date(now.getTime() + cfg.trialDaysLeft * 86400000);
    } else if (cfg.status === CustomerStatus.EXPIRED && cfg.daysExpired) {
      start = new Date(now.getTime() - (30 + cfg.daysExpired) * 86400000);
      end = new Date(now.getTime() - cfg.daysExpired * 86400000);
    }

    const user = await prisma.user.create({
      data: {
        clerkId: `clerk_customer_1_${i + 1}`,
        email: cfg.email,
        name: cfg.name,
        role: UserRole.CUSTOMER,
        gymId: gym1.id,
        status: UserStatus.ACTIVE,
        customerProfile: {
          create: {
            trainerId: cfg.trainerId,
            planId: cfg.plan?.id,
            status: cfg.status,
            membershipStart: start,
            membershipEnd: end,
            trialDays: cfg.trialDays,
            trialEndsAt,
          },
        },
      },
    });

    // Add payment and receipt delivery for active members
    if (cfg.plan) {
      const receiptSeq = String(i + 1).padStart(5, "0");
      const receiptNumber = `${gym1.receiptPrefix}-${currentYear}-${receiptSeq}`;

      const payment = await prisma.payment.create({
        data: {
          gymId: gym1.id,
          customerId: user.id,
          planId: cfg.plan.id,
          amount: cfg.plan.price,
          provider: PaymentProviderType.DEMO,
          status: PaymentStatus.PAID,
          providerPaymentId: `demo_pay_${i + 1}`,
          receiptNumber,
          paidAt: start || now,
        },
      });

      await prisma.receiptDelivery.create({
        data: {
          gymId: gym1.id,
          paymentId: payment.id,
          channel: DeliveryChannel.EMAIL,
          status: DeliveryStatus.SENT,
          toEmail: cfg.email,
          sentAt: start || now,
          attempts: 1,
        },
      });
    }

    // Add today attendance for the first 3 customers
    if (i < 3) {
      await prisma.attendance.create({
        data: {
          gymId: gym1.id,
          userId: user.id,
          date: todayStr,
          latitude: 28.528352,
          longitude: 77.219154,
          accuracyMeters: 14.5,
          distanceMeters: 8.2,
          ipAddress: "127.0.0.1",
        },
      });
    }
  }

  // Attendance for Trainer 1A today
  await prisma.attendance.create({
    data: {
      gymId: gym1.id,
      userId: trainer1A.id,
      date: todayStr,
      latitude: 28.528352,
      longitude: 77.219154,
      accuracyMeters: 12.0,
      distanceMeters: 4.5,
      ipAddress: "127.0.0.1",
    },
  });

  // Salary record for Trainer 1A & 1B for current month
  const currentMonthStr = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  await prisma.salaryRecord.createMany({
    data: [
      {
        gymId: gym1.id,
        trainerId: trainer1A.id,
        month: currentMonthStr,
        amount: 35000.0,
        status: SalaryStatus.PAID,
        paidAt: new Date(),
      },
      {
        gymId: gym1.id,
        trainerId: trainer1B.id,
        month: currentMonthStr,
        amount: 40000.0,
        status: SalaryStatus.PENDING,
      },
    ],
  });

  // 3. Gym 2: Zenith Strength Club (Mumbai BKC)
  const gym2 = await prisma.gym.create({
    data: {
      name: "Zenith Strength Club",
      address: "G Block BKC, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
      latitude: 19.066020,
      longitude: 72.868731,
      attendanceRadiusMeters: 50,
      timezone: "Asia/Kolkata",
      maxCustomers: 50,
      status: GymStatus.ACTIVE,
      receiptPrefix: "ZSC",
      pendingOwnerEmail: "owner.bkc@zenithgym.com", // PENDING_OWNER demonstration
    },
  });

  // Gym 2 Plans
  const planMonthly2 = await prisma.membershipPlan.create({
    data: {
      gymId: gym2.id,
      name: "Metro Monthly",
      durationDays: 30,
      price: 3499.0,
      isActive: true,
    },
  });

  // Gym 2 Trainers
  const trainer2A = await prisma.user.create({
    data: {
      clerkId: "clerk_trainer_2a",
      email: "tanvi.rao@zenithgym.com",
      name: "Tanvi Rao",
      phone: "+919933344455",
      role: UserRole.TRAINER,
      gymId: gym2.id,
      status: UserStatus.ACTIVE,
      trainerProfile: {
        create: {
          monthlySalary: 45000.0,
          salaryDueDay: 1,
        },
      },
    },
  });

  const trainer2B = await prisma.user.create({
    data: {
      clerkId: "clerk_trainer_2b",
      email: "harsh.wardhan@zenithgym.com",
      name: "Harsh Wardhan",
      phone: "+919944455566",
      role: UserRole.TRAINER,
      gymId: gym2.id,
      status: UserStatus.ACTIVE,
      trainerProfile: {
        create: {
          monthlySalary: 42000.0,
          salaryDueDay: 1,
        },
      },
    },
  });

  // Gym 2: 10 Customers
  for (let j = 0; j < 10; j++) {
    await prisma.user.create({
      data: {
        clerkId: `clerk_customer_2_${j + 1}`,
        email: `member.${j + 1}@zenithgym.com`,
        name: `Member ${j + 1}`,
        role: UserRole.CUSTOMER,
        gymId: gym2.id,
        status: UserStatus.ACTIVE,
        customerProfile: {
          create: {
            trainerId: j % 2 === 0 ? trainer2A.id : trainer2B.id,
            planId: planMonthly2.id,
            status: j === 0 ? CustomerStatus.TRIAL : CustomerStatus.ACTIVE,
            membershipStart: new Date(),
            membershipEnd: new Date(Date.now() + 25 * 86400000),
          },
        },
      },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log(`- 1 Super Admin: ${superAdmin.email}`);
  console.log(`- 2 Gyms: "${gym1.name}" (Active owner) and "${gym2.name}" (Pending owner: ${gym2.pendingOwnerEmail})`);
  console.log(`- 4 Trainers with profiles & salaries`);
  console.log(`- 20 Customers across gyms with active, trial, and expired memberships`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

