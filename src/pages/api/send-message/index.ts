import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { sendBulkEmail } from "@/utils/node-mailer/send-bulk-email";
import { sendBulkWhatsapp } from "@/utils/whatsapp/send-bulk-whatsapp";
import type { NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await db.sendMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: true,
    },
  });

  return res.status(200).json({ message: "OK", data });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const decoded = req.decoded;
  const userId = decoded?.id;
  const { subject, message } = req.body;

  if (!subject || !message || !userId)
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  const customers = await db.customer.findMany({
    where: {
      isDeleted: false,
    },
  });

  const phones = customers.filter((c) => c.type === "Phone").map((c) => c.code);
  const emails = customers.filter((c) => c.type === "Email").map((c) => c.code);
  const ids = customers.map((c) => {
    return { id: c.id };
  });

  await Promise.all([
    sendBulkEmail(emails, "ANNOUNCEMENT", subject, message),
    sendBulkWhatsapp(phones, subject, message),
  ]);

  const data = await db.sendMessage.create({
    data: {
      message,
      subject,
      senderId: userId,
      customers: {
        connect: ids,
      },
    },
  });

  return res.status(200).json({ message: "Pesan berhasil dikirim", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner"])(req, res);
      case "POST":
        return AuthApi(POST, ["Admin", "Owner"])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
