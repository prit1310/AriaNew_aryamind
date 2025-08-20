import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Always look up userId from session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found for session email' });
    }
    const userId = user.id;

    // Fetch TemplateUsage for the user
    const templateUsage = await prisma.templateUsage.findUnique({
      where: { userId },
      select: {
        pdfDownloadCount: true,
        csvDownloadCount: true,
        pdfUploadCount: true,
        csvUploadCount: true,
      },
    });

    // Sum the size of all uploaded files for the user
    const uploadedFiles = await prisma.uploadedFile.findMany({
      where: { userId },
      select: { size: true },
    });
    const totalUploadedFileSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

    return res.status(200).json({
      templateUsage,
      totalUploadedFileSize,
    });
  } catch (error) {
    console.error('User usage error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 