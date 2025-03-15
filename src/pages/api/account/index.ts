import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { type NextApiResponse, type NextApiRequest } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.decoded?.id;

  const data = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  return res.status(200).json({ message: "OK", data });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.decoded?.id;
  const { name, email } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "Semua kolom harus diisi" });

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email))
    return res.status(400).json({ message: "Email tidak valid" });

  const checkEmail = await db.user.findUnique({ where: { email } });

  if (checkEmail && checkEmail.id !== userId)
    return res.status(400).json({ message: "Email sudah terdaftar" });

  const data = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      email,
    },
  });

  return res.status(200).json({ message: "Berhasil mengedit akun", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return GET(req, res);
      case "PUT":
        return PUT(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default AuthApi(handler, [
  "Admin",
  "Owner",
  "Cashier",
  "ManagerOperational",
]);
