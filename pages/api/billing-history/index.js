import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, planName, billingType, price, expiresAt } = req.body;
    if (!userId || !planName || !billingType || !price || !expiresAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const billing = await prisma.billingHistory.create({
        data: {
          userId,
          planName,
          billingType,
          price: parseInt(price),
          expiresAt: new Date(expiresAt),
        },
      });
      return res.status(201).json(billing);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    try {
      const history = await prisma.billingHistory.findMany({
        where: { userId },
        orderBy: { subscribedAt: 'desc' },
      });
      return res.status(200).json(history);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}