import { clerkClient } from "@clerk/nextjs/server";
import { PrismaClient, UserRole, UserStatus, CustomerStatus, PaymentProviderType, PaymentStatus, DeliveryChannel, DeliveryStatus, SalaryStatus, GymStatus } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "GymCrm#Secure2026!xK";

interface UserBrief {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

const USERS_TO_CREATE: UserBrief[] = [
  {
    email: "piyushchhabra3578@gmail.com",
    name: "Piyush Chhabra",
    firstName: "Piyush",
    lastName: "Chhabra",
    role: UserRole.SUPER_ADMIN,
  },
  {
    email: "owner.saket@fitzone.com",
    name: "Aman Verma",
    firstName: "Aman",
    lastName: "Verma",
    role: UserRole.ADMIN,
  },
  {
    email: "trainer.vikram@fitzone.com",
    name: "Vikram Malhotra",
    firstName: "Vikram",
    lastName: "Malhotra",
    role: UserRole.TRAINER,
  },
  {
    email: "member.rahul@fitzone.com",
    name: "Rahul Sharma",
    firstName: "Rahul",
    lastName: "Sharma",
    role: UserRole.CUSTOMER,
  },
];

async function getOrCreateClerkUser(client: any, userBrief: UserBrief, gymId: string | null) {
  const existingList = await client.users.getUserList({
    emailAddress: [userBrief.email],
  });

  const existing = existingList.data?.[0] || existingList[0];

  if (existing) {
    console.log(`🔄 Updating existing Clerk user: ${userBrief.email}`);
    await client.users.updateUser(existing.id, {
      firstName: userBrief.firstName,
      lastName: userBrief.lastName,
      password: DEMO_PASSWORD,
      skipPasswordChecks: true,
      publicMetadata: {
        role: userBrief.role,
        gymId,
      },
    });
    return existing.id;
  }

  console.log(`➕ Creating new Clerk user: ${userBrief.email}`);
  const created = await client.users.createUser({
    emailAddress: [userBrief.email],
    password: DEMO_PASSWORD,
    firstName: userBrief.firstName,
    lastName: userBrief.lastName,
    skipPasswordChecks: true,
    publicMetadata: {
      role: userBrief.role,
      gymId,
    },
  });

  return created.id;
}

async function main() {
  console.log("==================================================");
  console.log("🧹 1. Cleaning existing PostgreSQL database records...");
  console.log("==================================================");

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

  console.log("✅ Database cleared cleanly.");

  console.log("\n==================================================");
  console.log("🏢 2. Creating Demo Gym Facility...");
  console.log("==================================================");

  const gym = await prisma.gym.create({
    data: {
      name: "FitZone Elite Saket",
      address: "Select Citywalk, Saket District Centre, New Delhi, Delhi 110017",
      latitude: 28.528352,
      longitude: 77.219154,
      attendanceRadiusMeters: 50,
      timezone: "Asia/Kolkata",
      maxCustomers: 50,
      status: GymStatus.ACTIVE,
      receiptPrefix: "FZE",
    },
  });

  // Plans
  const annualPlan = await prisma.membershipPlan.create({
    data: {
      gymId: gym.id,
      name: "1 Year Annual VIP",
      durationDays: 365,
      price: 18000,
      isActive: true,
    },
  });

  const quarterlyPlan = await prisma.membershipPlan.create({
    data: {
      gymId: gym.id,
      name: "3 Months Quarterly Pro",
      durationDays: 90,
      price: 6500,
      isActive: true,
    },
  });

  const monthlyPlan = await prisma.membershipPlan.create({
    data: {
      gymId: gym.id,
      name: "1 Month General Fitness",
      durationDays: 30,
      price: 2500,
      isActive: true,
    },
  });

  console.log(`✅ Created Gym "${gym.name}" with 3 membership tiers.`);

  console.log("\n==================================================");
  console.log("🔐 3. Provisioning Clerk Accounts & Database Records...");
  console.log("==================================================");

  const client = await clerkClient();

  // 1. Super Admin
  const superAdminClerkId = await getOrCreateClerkUser(client, USERS_TO_CREATE[0]!, null);
  const superAdmin = await prisma.user.create({
    data: {
      clerkId: superAdminClerkId,
      email: USERS_TO_CREATE[0]!.email,
      name: USERS_TO_CREATE[0]!.name,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      gymId: null,
    },
  });

  // 2. Gym Owner (Admin)
  const ownerClerkId = await getOrCreateClerkUser(client, USERS_TO_CREATE[1]!, gym.id);
  const gymOwner = await prisma.user.create({
    data: {
      clerkId: ownerClerkId,
      email: USERS_TO_CREATE[1]!.email,
      name: USERS_TO_CREATE[1]!.name,
      phone: "+91 98765 43210",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      gymId: gym.id,
    },
  });

  // Link gym to owner
  await prisma.gym.update({
    where: { id: gym.id },
    data: { ownerUserId: gymOwner.id },
  });

  // 3. Trainer
  const trainerClerkId = await getOrCreateClerkUser(client, USERS_TO_CREATE[2]!, gym.id);
  const trainer = await prisma.user.create({
    data: {
      clerkId: trainerClerkId,
      email: USERS_TO_CREATE[2]!.email,
      name: USERS_TO_CREATE[2]!.name,
      phone: "+91 98111 22233",
      role: UserRole.TRAINER,
      status: UserStatus.ACTIVE,
      gymId: gym.id,
    },
  });

  await prisma.trainerProfile.create({
    data: {
      userId: trainer.id,
      monthlySalary: 45000,
      salaryDueDay: 1,
    },
  });

  // Trainer current salary statement
  const currentMonth = "2026-11";
  await prisma.salaryRecord.create({
    data: {
      gymId: gym.id,
      trainerId: trainer.id,
      month: currentMonth,
      amount: 45000,
      status: SalaryStatus.PAID,
      paidAt: new Date(),
    },
  });

  // 4. Customer
  const customerClerkId = await getOrCreateClerkUser(client, USERS_TO_CREATE[3]!, gym.id);
  const customer = await prisma.user.create({
    data: {
      clerkId: customerClerkId,
      email: USERS_TO_CREATE[3]!.email,
      name: USERS_TO_CREATE[3]!.name,
      phone: "+91 99887 76655",
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      gymId: gym.id,
    },
  });

  const now = new Date();
  const membershipEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  await prisma.customerProfile.create({
    data: {
      userId: customer.id,
      trainerId: trainer.id,
      planId: annualPlan.id,
      status: CustomerStatus.ACTIVE,
      membershipStart: now,
      membershipEnd,
    },
  });

  // Customer Payment & Sequential Receipt
  const receiptNumber = `${gym.receiptPrefix}-${now.getFullYear()}-00001`;
  await prisma.receiptCounter.create({
    data: {
      gymId: gym.id,
      year: now.getFullYear(),
      lastNumber: 1,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      gymId: gym.id,
      customerId: customer.id,
      planId: annualPlan.id,
      amount: annualPlan.price,
      provider: PaymentProviderType.DEMO,
      status: PaymentStatus.PAID,
      receiptNumber,
      providerPaymentId: "demo_init_vip_001",
      paidAt: now,
    },
  });

  await prisma.receiptDelivery.create({
    data: {
      gymId: gym.id,
      paymentId: payment.id,
      channel: DeliveryChannel.EMAIL,
      status: DeliveryStatus.SENT,
      toEmail: customer.email,
      sentAt: now,
    },
  });

  // Check-in history & active workout streak for Customer
  const checkInDates = ["2026-11-10", "2026-11-09", "2026-11-08", "2026-11-06", "2026-11-05"];
  for (const dateStr of checkInDates) {
    await prisma.attendance.create({
      data: {
        gymId: gym.id,
        userId: customer.id,
        date: dateStr,
        latitude: gym.latitude,
        longitude: gym.longitude,
        distanceMeters: 4.5,
        accuracyMeters: 12.0,
      },
    });
  }

  // Trainer check-in
  await prisma.attendance.create({
    data: {
      gymId: gym.id,
      userId: trainer.id,
      date: "2026-11-10",
      latitude: gym.latitude,
      longitude: gym.longitude,
      distanceMeters: 2.1,
      accuracyMeters: 8.0,
    },
  });

  console.log("\n==================================================");
  console.log("🎉 ALL DEMO ACCOUNTS AND DATA READY!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Error setting up users:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

