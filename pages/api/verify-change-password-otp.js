import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { otp, newPassword } = req.body;
  if (!otp || !newPassword) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Validate new password strength
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ 
      error: 'Password must contain at least 8 characters, 1 letter, 1 number, and 1 symbol' 
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, resetOtp: true, resetOtpExpiry: true }
    });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    if (user.resetOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (new Date(user.resetOtpExpiry) < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetOtp: null, resetOtpExpiry: null },
    });
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Verify change password OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 