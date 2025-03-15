import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/utils/saveToLog";
import { $Enums } from "@prisma/client";
import { type NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await db.customer.findMany({
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
  const { name, code } = req.body;

  if (!name || !code)
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  let type: $Enums.CodeType = $Enums.CodeType.Email;
  if (code.includes("@")) type = $Enums.CodeType.Email;
  else type = $Enums.CodeType.Phone;

  if (type === "Email") {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(code))
      return res.status(400).json({ message: "Email tidak valid" });
  } else {
    if (!code.startsWith("62"))
      return res.status(400).json({ message: "Nomor telepon tidak valid" });
  }

  const checkCode = await db.customer.findUnique({ where: { code } });

  if (checkCode)
    return res.status(400).json({ message: "Customer sudah terdaftar" });

  const data = await db.customer.create({
    data: {
      name,
      code,
      type,
    },
  });

  await saveToLog(req, res, "Customer", data);

  return res
    .status(200)
    .json({ message: "Berhasil menambahkan customer", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner", "Cashier"])(req, res);
      case "POST":
        return AuthApi(POST, ["Admin", "Owner", "Cashier"])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
