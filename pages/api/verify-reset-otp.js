import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetOtp || !user.resetOtpExpiry) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  if (user.resetOtp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  if (new Date(user.resetOtpExpiry) < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashed, resetOtp: null, resetOtpExpiry: null },
  });

  return res.status(200).json({ success: true, message: 'Password updated successfully' });
} 