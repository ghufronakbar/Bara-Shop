import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/utils/saveToLog";
import { $Enums } from "@prisma/client";
import { type NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const data = await db.user.findUnique({
    where: { id },
  });

  if (!data || (data && data.isDeleted))
    return res.status(404).json({ message: "Data tidak ditemukan" });

  return res.status(200).json({ message: "OK", data });
};

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const { role } = req.body;

  if (!role)
    return res.status(400).json({ message: "Semua kolom harus diisi" });

  if (!$Enums.Role[role as keyof typeof $Enums.Role])
    return res.status(400).json({ message: "Role tidak valid" });

  const checkId = await db.user.findUnique({
    where: { id },
  });

  if (!checkId)
    return res.status(404).json({ message: "Data tidak ditemukan" });

  const data = await db.user.update({
    data: {
      role,
    },
    where: { id },
  });

  await saveToLog(req, res, "User", data);

  return res
    .status(200)
    .json({ message: "Berhasil mengedit role pengguna", data });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const check = await db.user.findUnique({
    where: { id },
  });

  if (!check || (check && check.isDeleted))
    return res.status(404).json({ message: "Data tidak ditemukan" });

  const data = await db.user.update({
    data: {
      isDeleted: true,
    },
    where: { id },
  });

  await saveToLog(req, res, "User", data);

  return res.status(200).json({ message: "Berhasil menghapus pengguna", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner"])(req, res);
      case "PATCH":
        return AuthApi(PATCH, ["Owner"])(req, res);
      case "DELETE":
        return AuthApi(DELETE, ["Owner"])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
