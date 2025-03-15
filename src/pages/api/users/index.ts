import { db } from "@/config/db";
import { $Enums } from "@prisma/client";
import { type NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/utils/node-mailer/send-email";
import AuthApi from "@/middleware/auth-api";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await db.user.findMany({
    orderBy: {
      name: "asc",
    },
    where: {
      isDeleted: false,
    },
    include: {
      _count: true,
    },
  });

  return res.status(200).json({ message: "OK", data });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, name, role } = req.body;

  if (!email || !name || !role)
    return res.status(400).json({ message: "Semua kolom harus diisi" });

  if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email))
    return res.status(400).json({ message: "Email tidak valid" });

  if (!$Enums.Role[role as keyof typeof $Enums.Role])
    return res.status(400).json({ message: "Role tidak valid" });

  const randomPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  const checkEmail = await db.user.findUnique({
    where: { email },
  });

  if (checkEmail)
    return res.status(400).json({ message: "Email sudah terdaftar" });

  const send = await sendEmail(email, "CREATE_ACCOUNT", name, randomPassword);
  if (send instanceof Error) {
    return res.status(400).json({ message: "Gagal mengirim email" });
  }

  const data = await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
    },
  });

  return res
    .status(200)
    .json({ message: "Berhasil menambahkan pengguna", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner"])(req, res);
      case "POST":
        return AuthApi(POST, ["Owner"])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
