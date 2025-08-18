import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import { serialize } from "cookie";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Capture user before clearing cookies
  const session = await getServerSession(req, res, authOptions);
  const userEmail = session?.user?.email || null;

  // Clear ALL possible NextAuth cookies
  const cookies = [
    serialize("next-auth.session-token", "", {
      path: "/",
      sameSite: "lax",
      expires: new Date(0),
    }),
    serialize("__Secure-next-auth.session-token", "", {
      path: "/",
      sameSite: "lax",
      secure: true,
      expires: new Date(0),
    }),
    serialize("next-auth.callback-url", "", {
      path: "/",
      sameSite: "lax",
      expires: new Date(0),
    }),
    serialize("__Secure-next-auth.callback-url", "", {
      path: "/",
      sameSite: "lax",
      secure: true,
      expires: new Date(0),
    }),
    serialize("next-auth.csrf-token", "", {
      path: "/",
      sameSite: "lax",
      expires: new Date(0),
    }),
    serialize("__Host-next-auth.csrf-token", "", {
      path: "/",
      sameSite: "lax",
      secure: true,
      expires: new Date(0),
    }),
  ];

  res.setHeader("Set-Cookie", cookies);

  // Optional: log activity WITHOUT forwarding old Cookie
  try {
    if (userEmail) {
      await prisma.activityLog.create({
        data: {
          userId: (await prisma.user.findUnique({ where: { email: userEmail } }))?.id,
          type: "logout",
          detail: "User logged out",
          status: "completed",
        },
      });
    }
  } catch (e) {
    console.error("Activity log error:", e);
  }

  return res.status(200).json({ success: true });
}