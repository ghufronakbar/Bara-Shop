import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import type { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await db.productPurchase.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      isDeleted: false,
    },
    include: {
      product: true,
    },
  });

  return res.status(200).json({ message: "OK", data });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
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
  const checkProduct = await db.product.findUnique({
    where: { id: productId },
  });
  if (!checkProduct)
    return res.status(400).json({ message: "Produk tidak ditemukan" });

  const data = await db.productPurchase.create({
    data: {
      amount: Number(amount),
      price: Number(price),
      total,
      productId,
      description,
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
  const newAmount = checkProduct.amount + Number(amount);

  await db.product.update({
    data: {
      amount: newAmount,
      cogs,
    },
    where: { id: productId },
  });

  return res
    .status(200)
    .json({ message: "Berhasil menambahkan pembelian", data });
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
