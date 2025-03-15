import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await db.productDefect.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: true,
    },
  });
  return res.status(200).json({ message: "OK", data });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { productId, reason, amount } = req.body;
  if (!productId || !reason || isNaN(Number(amount)))
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  const checkProduct = await db.product.findUnique({
    where: { id: productId },
  });
  if (!checkProduct)
    return res.status(400).json({ message: "Produk tidak ditemukan" });

  const data = await db.productDefect.create({
    data: {
      productId,
      reason,
      amount: Number(amount),
    },
  });

  const newAmount = checkProduct.amount - Number(amount);
  await db.product.update({
    data: {
      amount: newAmount,
    },
    where: {
      id: productId,
    },
  });

  return res.status(200).json({ message: "Berhasil menambahkan data", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner", "ManagerOperational"])(req, res);
      case "POST":
        return AuthApi(POST, ["Admin", "Owner", "ManagerOperational"])(
          req,
          res
        );
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
