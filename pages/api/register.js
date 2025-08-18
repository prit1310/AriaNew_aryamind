import bcrypt from "bcrypt";
import prisma from '@/lib/prisma';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, password } = req.body;

  if (!name || !name.trim() || !email || !password) {
    // Log error activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: null,
          type: 'register',
          detail: 'Missing fields',
          status: 'error',
        },
      });
    } catch (e) { /* ignore logging errors */ }
    return res.status(400).json({ error: "Missing fields" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validate email domain - make it more lenient like the validate-email endpoint
  try {
    const domain = email.split('@')[1];
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      console.warn(`No MX records found for domain: ${domain}, but allowing registration`);
      // Don't block registration for DNS issues
    }
  } catch (dnsError) {
    console.warn(`DNS check failed for domain: ${email.split('@')[1]}, but allowing registration`);
    // Don't block registration for DNS issues
  }

  // Check if email is already taken
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    // Log error activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: existingUser.id,
          type: 'register',
          detail: 'Email already taken',
          status: 'error',
        },
      });
    } catch (e) { /* ignore logging errors */ }
    return res.status(409).json({ error: "Email already taken" });
  }

  console.log("Creating user with email:", email);
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Password hashed successfully, length:", hashedPassword.length);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: false, // Users start as unverified
      },
    });
    console.log("User created successfully:", user.id);
    // Log successful registration
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          type: 'register',
          detail: null,
          status: 'completed',
        },
      });
    } catch (e) { /* ignore logging errors */ }
  } catch (error) {
    console.error("Registration error:", error);
    // Log error activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: null,
          type: 'register',
          detail: 'Registration error: ' + error.message,
          status: 'error',
        },
      });
    } catch (e) { /* ignore logging errors */ }
    return res.status(500).json({ error: "Registration failed" });
  }

  res.status(201).json({ message: "User registered successfully" });
}
