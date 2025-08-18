import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists first
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // If user exists and email is already verified, don't send another verification
    if (user && user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified.'
      });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in database
    await prisma.emailVerification.upsert({
      where: { email },
      update: {
        code: verificationCode,
        expiresAt,
        attempts: 0
      },
      create: {
        email,
        code: verificationCode,
        expiresAt,
        attempts: 0
      }
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email Address - ARIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #20232A; color: white; padding: 20px; text-align: center;">
            <h1 style="color: #FFD600; margin: 0;">ARIA</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="color: #666; line-height: 1.6;">
              Thank you for registering with ARIA! To complete your registration, please enter the verification code below:
            </p>
            <div style="background: #FFD600; color: #181A20; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The ARIA Team
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      note: 'Please check your email and enter the verification code'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // Check if it's an email delivery error
    if (error.code === 'ENOTFOUND' || error.code === 'EAUTH' || error.code === 'ECONNECTION') {
      return res.status(400).json({
        success: false,
        error: 'Email delivery failed. Please check if the email address is correct and try again.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send verification email'
    });
  }
} 