import { db } from "@/config/db";
import { type NextApiRequest, NextApiResponse } from "next/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/constants";

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  const checkEmail = await db.user.findUnique({ where: { email } });
  if (!checkEmail)
    return res.status(400).json({ message: "Email tidak ditemukan" });

  const checkPassword = await bcrypt.compare(
    password,
    checkEmail?.password || ""
  );
  if (!checkPassword)
    return res.status(400).json({ message: "Password salah" });

  const payload = {
    id: checkEmail.id,
    email: checkEmail.email,
    role: checkEmail.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({ message: "OK", data: { ...payload, token } });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST":
        return POST(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
