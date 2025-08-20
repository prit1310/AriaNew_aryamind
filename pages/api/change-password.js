import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { currentPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ error: 'Missing current password' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry
    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetOtpExpiry: expiry },
    });

    // Send OTP email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Email content with HTML template
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Password Change OTP - ARIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #20232A; color: white; padding: 20px; text-align: center;">
            <h1 style="color: #FFD600; margin: 0;">ARIA</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Change Verification</h2>
            <p style="color: #666; line-height: 1.6;">
              You have requested to change your password. To proceed with the password change, please enter the verification code below:
            </p>
            <div style="background: #FFD600; color: #181A20; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 15 minutes. If you didn't request this password change, please ignore this email and ensure your account is secure.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The ARIA Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}   