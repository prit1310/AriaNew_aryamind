import prisma from "@/lib/prisma";

export default async function handler(req, res) {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Missing email" });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.json({ id: user.id });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
}