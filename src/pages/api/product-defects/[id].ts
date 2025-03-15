import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/utils/saveToLog";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const data = await db.productDefect.findUnique({
    where: { id },
    include: {
      product: true,
    },
  });

  if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

  return res.status(200).json({ message: "OK", data });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const { productId, reason, amount } = req.body;
  if (!productId || !reason || isNaN(Number(amount)))
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  const checkProduct = await db.product.findUnique({
    where: { id: productId },
  });
  if (!checkProduct)
    return res.status(400).json({ message: "Produk tidak ditemukan" });

  const checkDefect = await db.productDefect.findUnique({
    where: { id },
  });
  if (!checkDefect)
    return res.status(400).json({ message: "Data tidak ditemukan" });

  const data = await db.productDefect.update({
    data: {
      productId,
      reason,
      amount: Number(amount),
    },
    where: {
      id,
    },
  });

  const gapAmount = checkDefect.amount - Number(amount);
  const newAmount = checkProduct.amount + gapAmount;

  await db.product.update({
    data: {
      amount: newAmount,
    },
    where: {
      id: productId,
    },
  });

  await saveToLog(req, res, "ProductDefect", data);

  return res.status(200).json({ message: "Berhasil mengedit data", data });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const check = await db.productDefect.findUnique({
    where: { id },
    include: {
      product: true,
    },
  });

  if (!check) return res.status(404).json({ message: "Data tidak ditemukan" });

  const data = await db.productDefect.update({
    data: {
      isDeleted: true,
    },
    where: { id },
  });

  const newAmount = check.product.amount + check.amount;

  await db.product.update({
    data: {
      amount: newAmount,
    },
    where: {
      id: check.productId,
    },
  });

  await saveToLog(req, res, "ProductDefect", data);

  return res.status(200).json({ message: "Berhasil menghapus data", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner", "ManagerOperational"])(req, res);
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
