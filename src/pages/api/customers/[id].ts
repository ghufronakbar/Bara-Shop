import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { $Enums } from "@prisma/client";
import { type NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const data = await db.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          orderItems: true,
          transaction: true,
        },
      },
    },
  });

  if (!data)
    return res.status(404).json({ message: "Customer tidak ditemukan" });

  return res.status(200).json({ message: "OK", data });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const { name, code } = req.body;

  if (!name || !code)
    return res.status(400).json({ message: "Semua kolom harus diisi" });

  const check = await db.customer.findUnique({
    where: { id },
  });

  if (!check || (check && check.isDeleted))
    return res.status(404).json({ message: "Customer tidak ditemukan" });

  let type: $Enums.CodeType = $Enums.CodeType.Email;
  if (code.includes("@")) type = $Enums.CodeType.Email;
  else type = $Enums.CodeType.Phone;

  const data = await db.customer.update({
    data: {
      code,
      name,
      type,
    },
    where: { id },
  });

  return res.status(200).json({ message: "Berhasil mengedit customer", data });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const check = await db.customer.findUnique({
    where: { id },
  });

  if (!check)
    return res.status(404).json({ message: "Customer tidak ditemukan" });

  const data = await db.customer.update({
    data: {
      isDeleted: true,
    },
    where: { id },
  });

  return res.status(200).json({ message: "Berhasil menghapus customer", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner", "Cashier"])(req, res);
      case "PUT":
        return AuthApi(PUT, ["Admin", "Owner"])(req, res);
      case "DELETE":
        return AuthApi(DELETE, ["Admin", "Owner"])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
