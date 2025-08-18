import cron from 'node-cron';
import fetch from 'node-fetch';

// Run every minute to check for scheduled calls
cron.schedule('* * * * *', async () => {
  try {
    console.log('Checking for scheduled calls...');
        
    // Try multiple environment variables and fallbacks
    let baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    console.log('Using base URL:', baseUrl);
    console.log('Available env vars:', {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    });
    
    const url = `${baseUrl}/api/execute-scheduled-calls`;
    console.log('Full URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.log(`Cron job HTTP error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log(`Cron job received non-JSON response: ${contentType}`);
      const text = await response.text();
      console.log('Response preview:', text.substring(0, 200));
      return;
    }
    
    const result = await response.json();
    console.log('Cron job result:', result);
    
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

console.log('Call scheduling cron job started');
