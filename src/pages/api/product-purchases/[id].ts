import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import type { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const data = await db.productPurchase.findUnique({
    include: {
      product: true,
    },
    where: { id },
  });

  if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

  return res.status(200).json({ message: "OK", data });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const { amount, price, productId, description } = req.body;
  if (
    !amount ||
    !price ||
    !productId ||
    isNaN(Number(price)) ||
    isNaN(Number(amount))
  )
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  const total = Number(price) * Number(amount) || 0;

  const checkPurchase = await db.productPurchase.findUnique({
    where: { id: id },
  });
  if (!checkPurchase)
    return res.status(400).json({ message: "Pembelian tidak ditemukan" });

  const checkProduct = await db.product.findUnique({
    where: { id: productId },
  });
  if (!checkProduct)
    return res.status(400).json({ message: "Produk tidak ditemukan" });

  const data = await db.productPurchase.update({
    data: {
      amount: Number(amount),
      price: Number(price),
      total,
      productId,
      description,
    },
    where: {
      id,
    },
  });

  const productPurchases = await db.productPurchase.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      AND: [
        {
          productId: productId,
        },
        {
          isDeleted: false,
        },
      ],
    },
  });

  let totalPurchase = 0;
  let amountPurchase = 0;

  for (const purchase of productPurchases) {
    totalPurchase += Number(purchase.total);
    amountPurchase += Number(purchase.amount);
  }

  const cogs = totalPurchase / amountPurchase;

  const gapAmount = Number(amount) - checkPurchase.amount;
  const newAmount = checkProduct.amount + gapAmount;

  await db.product.update({
    data: {
      amount: newAmount,
      cogs,
    },
    where: { id: productId },
  });

  return res.status(200).json({ message: "Berhasil mengedit pembelian", data });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const check = await db.productPurchase.findUnique({
    where: { id },
    include: {
      product: true,
    },
  });

  if (!check)
    return res.status(404).json({ message: "Pembelian tidak ditemukan" });

  const data = await db.productPurchase.update({
    data: {
      isDeleted: true,
    },
    where: { id },
  });
  const newAmount = check.product.amount - check.amount;

  await db.product.update({
    data: {
      amount: newAmount,
    },
    where: { id: check.productId },
  });

  return res
    .status(200)
    .json({ message: "Berhasil menghapus pembelian", data });
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
