import prisma from '../lib/prisma.js';
import fetch from 'node-fetch';
import crypto from 'crypto';

// Agent server URL mapping (one URL per agent, for log fetching)
const AGENT_SERVER_URLS = {
  "Education": "https://b38708ad8304.ngrok-free.app",
  "Real Estate": "https://514ec086b95b.ngrok-free.app",
  "Hospital": "https://c7cdd045ec46.ngrok-free.app"
};

function getHash(input) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

// Enhanced function to check if new logs are available with better hash checking
async function hasNewLogs(username, currentLogs) {
  try {
    // Get user's last sync status
    const syncStatus = await prisma.userSyncStatus.findUnique({
      where: { username }
    });

    if (!syncStatus) {
      console.log(`📝 First time sync for user ${username}`);
      // For first time, still need to check existing logs to avoid duplicates
      const existingHashes = new Set();
      const existingLogs = await prisma.callLog.findMany({
        where: { 
          user: { username }
        },
        select: { logHash: true }
      });

      existingLogs.forEach(log => existingHashes.add(log.logHash));

      // Filter out logs that already exist
      const newLogs = currentLogs.filter(log => {
        const hash = getHash(log);
        return !existingHashes.has(hash);
      });

      return { hasNew: newLogs.length > 0, newLogs };
    }

    // Check if log count has changed
    if (currentLogs.length === syncStatus.totalLogCount) {
      console.log(`✅ No new logs for user ${username} (count: ${currentLogs.length})`);
      return { hasNew: false, newLogs: [] };
    }

    // If count changed, find new logs by comparing hashes
    const existingHashes = new Set();
    const existingLogs = await prisma.callLog.findMany({
      where: { 
        user: { username }
      },
      select: { logHash: true }
    });

    existingLogs.forEach(log => existingHashes.add(log.logHash));

    // Filter out logs that already exist
    const newLogs = currentLogs.filter(log => {
      const hash = getHash(log);
      return !existingHashes.has(hash);
    });

    if (newLogs.length > 0) {
      console.log(`🆕 Found ${newLogs.length} new logs for user ${username}`);
      return { hasNew: true, newLogs };
    } else {
      console.log(`✅ No new logs for user ${username} after hash comparison`);
      return { hasNew: false, newLogs: [] };
    }

  } catch (error) {
    console.error(`Error checking for new logs for ${username}:`, error);
    // On error, return empty to be safe and avoid duplicates
    return { hasNew: false, newLogs: [] };
  }
}

// Function to update sync status
async function updateSyncStatus(userId, username, totalLogCount) {
  try {
    await prisma.userSyncStatus.upsert({
      where: { username },
      update: {
        lastSyncAt: new Date(),
        totalLogCount,
        updatedAt: new Date()
      },
      create: {
        userId,
        username,
        lastSyncAt: new Date(),
        totalLogCount
      }
    });
  } catch (error) {
    console.error(`Error updating sync status for ${username}:`, error);
  }
}

// Function to determine agent based on user's uploaded files
async function determineUserAgent(userId) {
  try {
    // Get user's most recent uploaded files to determine agent
    const recentFiles = await prisma.uploadedFile.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      take: 5 // Check last 5 files
    });

    if (recentFiles.length === 0) {
      console.log(`No uploaded files found for user ${userId}, defaulting to Education`);
      return 'Education'; // Default agent
    }

    const mostRecentFile = recentFiles[0];
    if (mostRecentFile.type === 'pdf') {
      if (mostRecentFile.filename.toLowerCase().includes('hospital') || 
          mostRecentFile.filename.toLowerCase().includes('medical')) {
        return 'Hospital';
      } else if (mostRecentFile.filename.toLowerCase().includes('real') || 
                 mostRecentFile.filename.toLowerCase().includes('estate')) {
        return 'Real Estate';
      } else {
        return 'Education'; // Default for PDF
      }
    } else if (mostRecentFile.type === 'csv') {
      return 'Real Estate';
    }
    return 'Education'; // Default fallback
  } catch (error) {
    console.error(`Error determining agent for user ${userId}:`, error);
    return 'Education'; // Default fallback
  }
}

// Only fetch logs from agent servers, remove fallback to external API
async function fetchUserLogs(username) {
  try {
    const allLogs = [];
    const seenHashes = new Set();
    
    for (const [agent, agentUrl] of Object.entries(AGENT_SERVER_URLS)) {
      console.log(`🔍 Fetching logs from agent server ${agent}: ${agentUrl}/get-log/${username}`);
      try {
        const agentResponse = await fetch(`${agentUrl}/get-log/${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (agentResponse.ok) {
          const agentResponseText = await agentResponse.text();
          if (agentResponseText.trim()) {
            let logs = [];
            try {
              const data = JSON.parse(agentResponseText);
              logs = Array.isArray(data.logs) ? data.logs : [];
              console.log(`✅ Successfully fetched from agent server ${agent}, logs count:`, logs.length);
            } catch (parseError) {
              logs = parseTextLogs(agentResponseText);
              console.log(`✅ Successfully parsed text from agent server ${agent}, logs count:`, logs.length);
            }
            
            // Add agent name to each log and deduplicate
            for (const log of logs) {
              log.agent = agent;
              const hash = getHash(log);
              if (!seenHashes.has(hash)) {
                seenHashes.add(hash);
                allLogs.push(log);
              }
            }
          }
        }
      } catch (agentError) {
        console.log(`⚠️ Failed to fetch from agent server ${agent}`);
      }
    }
    return { logs: allLogs };
  } catch (error) {
    console.error(`❌ Network error fetching logs for ${username}:`, error.message);
    return { logs: [] }; // Return empty logs on network error
  }
}

// Function to parse the custom text format
function parseTextLogs(text) {
  const logs = [];
  const sections = text.split('--------------------------------------------------').filter(section => section.trim());
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    try {
      const lines = section.trim().split('\n').filter(line => line.trim());
      const log = {};
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Parse timestamp
        if (trimmedLine.match(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]$/)) {
          log.timestamp = new Date(trimmedLine.replace(/[\[\]]/g, ''));
          continue;
        }
        
        // Parse key-value pairs
        if (trimmedLine.includes(':')) {
          const [key, ...valueParts] = trimmedLine.split(':');
          const value = valueParts.join(':').trim();
          
          switch (key.trim()) {
            case 'CallSid':
              log.callSid = value;
              break;
            case 'From Number':
              log.phoneNumber = value;
              break;
            case 'To Number':
              log.toNumber = value;
              break;
            case 'User Speech':
              log.userSaid = value;
              break;
            case 'Detected Intent':
              log.intent = value;
              break;
            case 'Bot Response':
              log.botResponse = value;
              break;
          }
        }
      }
      
      // Only add log if it has essential data
      if (log.callSid && (log.userSaid || log.botResponse)) {
        logs.push(log);
      }
    } catch (error) {
      console.error('Error parsing log section:', error);
    }
  }
  
  // Calculate duration for each call
  const logsWithDuration = calculateCallDurations(logs);
  
  return logsWithDuration;
}

// Function to calculate call duration for each callSid
function calculateCallDurations(logs) {
  // Group logs by callSid
  const callGroups = {};
  
  logs.forEach(log => {
    if (!callGroups[log.callSid]) {
      callGroups[log.callSid] = [];
    }
    callGroups[log.callSid].push(log);
  });
  
  // Calculate duration for each call
  Object.keys(callGroups).forEach(callSid => {
    const callLogs = callGroups[callSid];
    
    if (callLogs.length > 1) {
      // Sort by timestamp
      callLogs.sort((a, b) => a.timestamp - b.timestamp);
      
      // Calculate duration (last timestamp - first timestamp)
      const firstTimestamp = callLogs[0].timestamp;
      const lastTimestamp = callLogs[callLogs.length - 1].timestamp;
      const durationInSeconds = Math.round((lastTimestamp - firstTimestamp) / 1000);
      
      // Add duration to all logs in this call
      callLogs.forEach(log => {
        log.duration = durationInSeconds;
      });
    } else {
      // Single log entry, set duration to 0
      callLogs[0].duration = 0;
    }
  });
  
  return logs;
}

// Updated process function with better error handling and upsert fallback
async function processUserLogs(user, logsData) {
  if (!logsData || !logsData.logs || !Array.isArray(logsData.logs)) {
    console.log(`⚠️ No valid logs array found for user ${user.username}`);
    return { processed: 0, errors: 0 };
  }

  if (logsData.logs.length === 0) {
    console.log(`ℹ️ Empty logs array for user ${user.username}`);
    return { processed: 0, errors: 0 };
  }

  // Check for new logs
  const { hasNew, newLogs } = await hasNewLogs(user.username, logsData.logs);
  
  if (!hasNew) {
    console.log(`⏭️ Skipping ${user.username} - no new logs to process`);
    return { processed: 0, errors: 0, skipped: true };
  }

  console.log(`🔄 Processing ${newLogs.length} NEW logs for user ${user.username} (total available: ${logsData.logs.length})`);

  let processed = 0;
  let errors = 0;

  // Process logs with better error handling
  for (const logEntry of newLogs) {
    try {
      const logHash = getHash(logEntry);

      // Parse timestamp
      let timestamp;
      if (logEntry.timestamp) {
        timestamp = new Date(logEntry.timestamp);
      } else if (logEntry.createdAt) {
        timestamp = new Date(logEntry.createdAt);
      } else {
        timestamp = new Date();
      }

      // Try to create, but fallback to upsert if there's a unique constraint error
      try {
        await prisma.callLog.create({
          data: {
            userId: user.id,
            timestamp,
            callSid: logEntry.callSid || logEntry.call_sid || `call_${Date.now()}_${Math.random()}`,
            phoneNumber: logEntry.phoneNumber || logEntry.phone_number || logEntry.from_number || '',
            toNumber: logEntry.toNumber || logEntry.to_number || '',
            userSaid: logEntry.userSaid || logEntry.user_speech || '',
            botResponse: logEntry.botResponse || logEntry.bot_response || '',
            intent: logEntry.intent || logEntry.detected_intent || '',
            sessionId: logEntry.sessionId || logEntry.session_id,
            duration: logEntry.duration || 0,
            status: logEntry.status || 'completed',
            agent: logEntry.agent || '',
            logHash
          }
        });
        processed++;
      } catch (createError) {
        if (createError.code === 'P2002' && createError.meta?.target?.includes('logHash')) {
          // Unique constraint violation - log already exists, skip it
          console.log(`⚠️ Log with hash ${logHash} already exists, skipping...`);
          continue;
        } else {
          // Other error, try upsert as fallback
          await prisma.callLog.upsert({
            where: { logHash },
            update: {
              userSaid: logEntry.userSaid || logEntry.user_speech || '',
              botResponse: logEntry.botResponse || logEntry.bot_response || '',
              intent: logEntry.intent || logEntry.detected_intent || '',
              status: logEntry.status || 'completed',
              duration: logEntry.duration || 0,
              agent: logEntry.agent || '',
              updatedAt: new Date()
            },
            create: {
              userId: user.id,
              timestamp,
              callSid: logEntry.callSid || logEntry.call_sid || `call_${Date.now()}_${Math.random()}`,
              phoneNumber: logEntry.phoneNumber || logEntry.phone_number || logEntry.from_number || '',
              toNumber: logEntry.toNumber || logEntry.to_number || '',
              userSaid: logEntry.userSaid || logEntry.user_speech || '',
              botResponse: logEntry.botResponse || logEntry.bot_response || '',
              intent: logEntry.intent || logEntry.detected_intent || '',
              sessionId: logEntry.sessionId || logEntry.session_id,
              duration: logEntry.duration || 0,
              status: logEntry.status || 'completed',
              agent: logEntry.agent || '',
              logHash
            }
          });
          processed++;
        }
      }
    } catch (error) {
      console.error(`Error processing log entry for ${user.username}:`, error.message);
      errors++;
    }
  }

  // Update sync status
  await updateSyncStatus(user.id, user.username, logsData.logs.length);

  return { processed, errors };
}

// Updated main sync function
async function syncAllUserLogs() {
  try {
    console.log('🔄 Starting optimized log sync process...');

    // Get all users with usernames
    const users = await prisma.user.findMany({
      where: {
        username: { not: null }
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true
      }
    });

    console.log(`Found ${users.length} users to sync`);

    let totalProcessed = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    for (const user of users) {
      console.log(`📞 Checking logs for user: ${user.username}`);
      
      // Determine agent for this user
      const agent = await determineUserAgent(user.id);
      console.log(`🏥 Determined agent for user ${user.username}: ${agent}`);
      
      const logsData = await fetchUserLogs(user.username);
      
      if (logsData) {
        const result = await processUserLogs(user, logsData);
        totalProcessed += result.processed;
        totalErrors += result.errors;
        
        if (result.skipped) {
          totalSkipped++;
          console.log(`⏭️ User ${user.username}: skipped (no new logs)`);
        } else {
          console.log(`✅ User ${user.username}: ${result.processed} NEW logs processed, ${result.errors} errors`);
        }
      } else {
        console.log(`❌ Failed to fetch logs for user: ${user.username}`);
      }

      // Small delay to avoid overwhelming the external API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎉 Optimized sync complete: ${totalProcessed} NEW logs processed, ${totalErrors} errors, ${totalSkipped} users skipped`);

  } catch (error) {
    console.error('❌ Sync process failed:', error.message);
  }
}

// Updated specific user sync
async function syncSpecificUser(username) {
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return { processed: 0, errors: 1, message: 'User not found' };
    }

    console.log(`📞 Checking logs for specific user: ${username}`);
    
    // Determine agent for this user
    const agent = await determineUserAgent(user.id);
    console.log(`🏥 Determined agent for user ${username}: ${agent}`);
    
    const logsData = await fetchUserLogs(username);
    
    if (logsData && logsData.logs) {
      const result = await processUserLogs(user, logsData);
      
      if (result.skipped) {
        console.log(`⏭️ ${username}: no new logs to process`);
        return { processed: 0, errors: 0, message: 'No new logs found', skipped: true };
      } else {
        console.log(`✅ ${username}: ${result.processed} NEW logs processed, ${result.errors} errors`);
        return result;
      }
    } else {
      console.log(`⚠️ No logs data or empty logs for user: ${username}`);
      return { processed: 0, errors: 0, message: 'No logs found' };
    }
  } catch (error) {
    console.error(`❌ Error syncing user ${username}:`, error.message);
    return { processed: 0, errors: 1, message: error.message };
  }
}

// Export functions for manual use
export { syncSpecificUser, syncAllUserLogs };

console.log('📡 Optimized log sync service started - only processes new logs');