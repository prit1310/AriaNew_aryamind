import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Plan download limits
const planLimits = {
  Basic: { pdfDownload: 10, csvDownload: 10 },
  Professional: { pdfDownload: 50, csvDownload: 20 },
  'Advanced Plan': { pdfDownload: 100, csvDownload: 30 },
};

const templatesDir = path.join(process.cwd(), 'public', 'templates');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { type, templateName, mode, file } = req.body;
  const fileName = file || (templateName.replace(/\s+/g, '_') + (type === 'pdf' ? '.pdf' : '.csv'));
  const filePath = path.join(templatesDir, fileName);

  // Only serve if file exists
  if (!fs.existsSync(filePath)) {
    // Log error activity
    try {
      const session = await getServerSession(req, res, authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              type: 'download',
              detail: 'Template file not found: ' + fileName,
              status: 'error',
            },
          });
        }
      }
    } catch (e) { /* ignore logging errors */ }
    return res.status(404).json({ error: 'Template file not found' });
  }

  // Find user and check plan/usage
  const userWithPlan = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscriptionPlan: true, templateUsage: true },
  });
  if (!userWithPlan) {
    // Log error activity
    try {
      const session = await getServerSession(req, res, authOptions);
      if (session?.user?.email) {
        await prisma.activityLog.create({
          data: {
            userId: null,
            type: 'download',
            detail: 'User not found: ' + session.user.email,
            status: 'error',
          },
        });
      }
    } catch (e) { /* ignore logging errors */ }
    return res.status(404).json({ error: 'User not found' });
  }
  const planType = userWithPlan.subscriptionPlan?.type || 'Basic';
  const limits = planLimits[planType];
  if (!limits) {
    // Log error activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: userWithPlan.id,
          type: 'download',
          detail: 'Invalid user plan',
          status: 'error',
        },
      });
    } catch (e) { /* ignore logging errors */ }
    return res.status(400).json({ error: 'Invalid user plan' });
  }
  const usage = userWithPlan.templateUsage || { pdfDownloadCount: 0, csvDownloadCount: 0 };

  // Check download limit (only for download mode)
  if (mode !== 'preview') {
    if (type === 'pdf' && usage.pdfDownloadCount >= limits.pdfDownload) {
      // Log error activity
      try {
        await prisma.activityLog.create({
          data: {
            userId: userWithPlan.id,
            type: 'download_pdf',
            detail: 'PDF download limit reached',
            status: 'error',
          },
        });
      } catch (e) { /* ignore logging errors */ }
      return res.status(403).json({ error: 'You have reached your PDF download limit for your current plan.' });
    }
    if (type === 'csv' && usage.csvDownloadCount >= limits.csvDownload) {
      // Log error activity
      try {
        await prisma.activityLog.create({
          data: {
            userId: userWithPlan.id,
            type: 'download_csv',
            detail: 'CSV download limit reached',
            status: 'error',
          },
        });
      } catch (e) { /* ignore logging errors */ }
      return res.status(403).json({ error: 'You have reached your CSV download limit for your current plan.' });
    }
  }

  // For preview, just return the file URL
  if (mode === 'preview') {
    return res.status(200).json({ url: `/templates/${fileName}` });
  }

  // For download, increment usage and serve the file
  if (!userWithPlan.templateUsage) {
    await prisma.templateUsage.create({
      data: {
        user: { connect: { id: userWithPlan.id } },
        pdfDownloadCount: type === 'pdf' ? 1 : 0,
        csvDownloadCount: type === 'csv' ? 1 : 0,
      },
    });
  } else {
    await prisma.templateUsage.update({
      where: { userId: userWithPlan.id },
      data: {
        pdfDownloadCount: type === 'pdf' ? { increment: 1 } : undefined,
        csvDownloadCount: type === 'csv' ? { increment: 1 } : undefined,
      },
    });
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: userWithPlan.id,
      type: type === 'pdf' ? 'download_pdf' : 'download_csv',
      detail: fileName,
      status: 'completed',
    },
  });

  // Serve the file as a download
  res.setHeader('Content-Type', type === 'pdf' ? 'application/pdf' : 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
} 