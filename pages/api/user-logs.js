import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { syncSpecificUser, fetchAndReturnMergedLogs } from '@/callLog/log';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check session
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // DEBUG: If ?debug=1, return merged logs directly from agent servers
  if (req.query.debug === '1') {
    // Find user to get username
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.username) {
      return res.status(404).json({ error: 'User or username not found' });
    }
    const merged = await fetchAndReturnMergedLogs(user.username);
    return res.status(200).json({ debug: true, mergedLogs: merged });
  }

  try {
    // Find current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        callLogs: {
          orderBy: { timestamp: 'asc' },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user has username, trigger a sync to get latest logs
    if (user.username) {
      try {
        console.log(`🔄 Triggering sync for user: ${user.username}`);
        const syncResult = await syncSpecificUser(user.username);
        console.log(`📊 Sync result for ${user.username}:`, syncResult);
        
        // Refetch user data after sync
        const updatedUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: {
            callLogs: {
              orderBy: { timestamp: 'asc' },
            },
            activityLogs: {
              orderBy: { createdAt: 'desc' },
            }
          }
        });
        
        return res.status(200).json({
          success: true,
          synced: true,
          syncResult,
          data: {
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              username: updatedUser.username
            },
            callLogs: updatedUser.callLogs.map(log => ({
              ...log,
              agent: log.agent || 'Unknown' // Include agent information
            })),
            activityLogs: updatedUser.activityLogs,
            stats: {
              totalCallLogs: updatedUser.callLogs.length,
              totalActivityLogs: updatedUser.activityLogs.length,
              lastSync: new Date().toISOString()
            }
          }
        });
      } catch (syncError) {
        console.error('❌ Sync error:', syncError);
        // Continue with existing data if sync fails
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username
        },
        callLogs: user.callLogs.map(log => ({
          ...log,
          agent: log.agent || 'Unknown' // Include agent information
        })),
        activityLogs: user.activityLogs,
        stats: {
          totalCallLogs: user.callLogs.length,
          totalActivityLogs: user.activityLogs.length,
          lastSync: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user logs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}