import { getPortalSession } from "@/lib/session";
import prisma from "@/db/client";
import { notFound } from "next/navigation";
import { MemberProfile } from "@/features/people/components/MemberProfile";
export const dynamic = "force-dynamic";
export default async function MemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const session = await getPortalSession("ADMIN");
  const { memberId } = await params;
  const [user, plans] = await Promise.all([
    prisma.user.findFirst({
      where: { id: memberId, gymId: session.gymId!, role: "CUSTOMER" },
      include: {
        customerProfile: {
          include: {
            plan: true,
            trainer: { select: { name: true } },
            payments: {
              where: { gymId: session.gymId! },
              include: { plan: { select: { name: true } } },
              orderBy: { paidAt: "desc" },
              take: 50,
            },
          },
        },
        attendances: {
          where: { gymId: session.gymId! },
          orderBy: { checkInAt: "desc" },
          take: 30,
        },
      },
    }),
    prisma.membershipPlan.findMany({
      where: { gymId: session.gymId!, isActive: true },
      orderBy: { price: "asc" },
    }),
  ]);
  if (!user?.customerProfile) notFound();
  const profile = user.customerProfile;
  return (
    <MemberProfile
      member={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        joined: user.createdAt.toISOString(),
        status: profile.status,
        planName: profile.plan?.name || "No membership plan",
        trainerName: profile.trainer.name,
        start: profile.membershipStart?.toISOString() || null,
        end:
          (profile.status === "TRIAL"
            ? profile.trialEndsAt
            : profile.membershipEnd
          )?.toISOString() || null,
        payments: profile.payments.map((p) => ({
          id: p.id,
          receipt: p.receiptNumber,
          amount: Number(p.amount),
          status: p.status,
          plan: p.plan?.name || "Membership",
          date: p.paidAt.toISOString(),
        })),
        attendance: user.attendances.map((a) => ({
          id: a.id,
          time: a.checkInAt.toISOString(),
          flagged: a.flagged,
        })),
      }}
      plans={plans.map((p) => ({
        id: p.id,
        name: p.name,
        durationDays: p.durationDays,
        price: Number(p.price),
      }))}
      timezone={session.timezone || "Asia/Kolkata"}
    />
  );
}
