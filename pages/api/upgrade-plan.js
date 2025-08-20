import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, type, billing, price, expiresAt } = req.body;
  if (!name || !type || !billing || !price || !expiresAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    let subscriptionPlan;

    if (user.subscriptionPlanId) {
      subscriptionPlan = await prisma.subscriptionPlan.update({
        where: { id: user.subscriptionPlanId },
        data: { name, type, billing, price, expiresAt: new Date(expiresAt) },
      });
    } else {
      subscriptionPlan = await prisma.subscriptionPlan.create({
        data: {
          name,
          type,
          billing,
          price,
          startedAt: new Date(),
          expiresAt: new Date(expiresAt),
          user: { connect: { id: user.id } },
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionPlanId: subscriptionPlan.id },
      });
    }

    // ✅ Create billing history record after subscription creation/update
    await prisma.billingHistory.create({
      data: {
        userId: user.id,
        planName: name,
        billingType: billing,
        price: parseInt(price),
        subscribedAt: new Date(),
        expiresAt: new Date(expiresAt),
      },
    });

    return res.status(200).json({ subscriptionPlan });
  } catch (error) {
    console.error('Upgrade plan error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}