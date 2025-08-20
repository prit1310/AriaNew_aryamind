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

  try {
    // Find current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user already has username, return it
    if (user.username) {
      return res.status(200).json({ 
        success: true, 
        username: user.username,
        message: 'Username already exists'
      });
    }

    // Generate username from email
    const email = session.user.email;
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    
    let finalUsername = baseUsername;

    try {
      // Try to set the base username
      await prisma.user.update({
        where: { email },
        data: { username: baseUsername },
      });
      
      console.log(`✅ Username set for user ${email}: ${baseUsername}`);
    } catch (usernameError) {
      // Handle username conflict
      if (usernameError.code === 'P2002') {
        // Username already exists, generate a unique one
        const uniqueUsername = `${baseUsername}_${timestamp}`;
        
        await prisma.user.update({
          where: { email },
          data: { username: uniqueUsername },
        });
        
        finalUsername = uniqueUsername;
        console.log(`✅ Unique username set for user ${email}: ${uniqueUsername}`);
      } else {
        throw usernameError;
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      username: finalUsername,
      message: 'Username created successfully'
    });

  } catch (error) {
    console.error('Error ensuring username:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 