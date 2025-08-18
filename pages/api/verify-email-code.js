import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  try {
    // Find the verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { email }
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found for this email'
      });
    }

    // Check if code has expired
    if (new Date() > verification.expiresAt) {
      // Delete expired verification
      await prisma.emailVerification.delete({
        where: { email }
      });
      
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new one.'
      });
    }

    // Check if too many attempts
    if (verification.attempts >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Too many failed attempts. Please request a new verification code.'
      });
    }

    // Verify the code
    if (verification.code !== code) {
      // Increment attempts
      await prisma.emailVerification.update({
        where: { email },
        data: { attempts: verification.attempts + 1 }
      });

      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Check if user exists before updating
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // For new registrations, just delete the verification record
      // The user will be created during the registration process
      await prisma.emailVerification.delete({
        where: { email }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Email verification successful. You can now complete your registration.',
        email: email,
        userExists: false
      });
    }

    // Code is valid - mark user as verified and delete the verification record
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { emailVerified: true }
      }),
      prisma.emailVerification.delete({
        where: { email }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      email: email
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
} 