import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Invalid email format' 
      });
    }

    // Extract domain from email
    const domain = email.split('@')[1];
    
    // Check if domain has MX records (indicates it can receive email)
    try {
      const mxRecords = await resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        return res.status(200).json({ 
          valid: true, 
          domain: domain,
          message: 'Email is valid' 
        });
      } else {
        // Be more lenient - if MX check fails, still consider it valid
        // as some domains might have temporary DNS issues
        console.warn(`No MX records found for domain: ${domain}, but considering valid`);
        return res.status(200).json({ 
          valid: true, 
          domain: domain,
          message: 'Email format is valid' 
        });
      }
    } catch (dnsError) {
      // Be more lenient - if DNS check fails, still consider it valid
      // as some domains might have temporary DNS issues
      console.warn(`DNS check failed for domain: ${domain}, but considering valid`);
      return res.status(200).json({ 
        valid: true, 
        domain: domain,
        message: 'Email format is valid' 
      });
    }
  } catch (error) {
    console.error('Email validation error:', error);
    return res.status(500).json({ 
      valid: false, 
      error: 'Email validation failed' 
    });
  }
} 