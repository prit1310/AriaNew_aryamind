import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      // generic error for security
      return res.status(400).json({ message: 'Password reset not available for this account' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, resetOtpExpiry: expiry },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // app password
      },
    });

    await transporter.sendMail({
      from: `"MyApp Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Password Reset OTP',
      text: `Your OTP is ${otp}. It expires in 15 minutes.`,
    });

    return res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}