import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, email } = req.body;

  // Validate required fields
  if (!name || !email) {
    // Log error activity
    try {
      const session = await getServerSession(req, res, authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              type: 'update_profile',
              detail: 'Missing required fields',
              status: 'error',
            },
          });
        }
      }
    } catch (e) { /* ignore logging errors */ }
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    // Log error activity
    try {
      const session = await getServerSession(req, res, authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              type: 'update_profile',
              detail: 'Invalid email format',
              status: 'error',
            },
          });
        }
      }
    } catch (e) { /* ignore logging errors */ }
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if email is already taken by another user
    const existingUserWithEmail = await prisma.user.findFirst({
      where: {
        email,
        email: { not: session.user.email } // Exclude current user
      }
    });

    if (existingUserWithEmail) {
      // Log error activity
      try {
        await prisma.activityLog.create({
          data: {
            userId: existingUserWithEmail.id,
            type: 'update_profile',
            detail: 'Email already taken',
            status: 'error',
          },
        });
      } catch (e) { /* ignore logging errors */ }
      return res.status(409).json({ error: 'Email already taken' });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: updatedUser.id,
        type: 'update_profile',
        detail: null,
        status: 'completed',
      },
    });

    return res.status(200).json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    // Log error activity
    try {
      const session = await getServerSession(req, res, authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              type: 'update_profile',
              detail: 'Update profile error: ' + error.message,
              status: 'error',
            },
          });
        }
      }
    } catch (e) { /* ignore logging errors */ }
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}