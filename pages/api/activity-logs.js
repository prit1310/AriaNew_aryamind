import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!prisma.activityLog || !prisma.templateUsage) {
    return res.status(500).json({ error: "Prisma models are not available. Check your Prisma client import and schema." });
  }

  if (req.method === "POST") {
    // Create a new activity log
    const { type, detail, status } = req.body;
    if (!type) {
      return res.status(400).json({ error: "Missing activity type" });
    }
    try {
      const log = await prisma.activityLog.create({
        data: {
          userId: user.id,
          type,
          detail: detail || null,
          status: status || "completed",
        },
      });
      return res.status(201).json({ log });
    } catch (err) {
      return res.status(500).json({ error: "Failed to create activity log" });
    }
  }

  // Fetch all activity logs
  const logs = await prisma.activityLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Fetch usage counts
  const usage = await prisma.templateUsage.findUnique({
    where: { userId: user.id },
    select: {
      pdfDownloadCount: true,
      csvDownloadCount: true,
      pdfUploadCount: true,
      csvUploadCount: true,
    },
  });

  res.json({ logs, usage });
}
