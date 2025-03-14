import { db } from "@/config/db";
import { type NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await db.product.findMany({
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
  const { category, name, price, image } = req.body;

  if (!category || !name || !price || isNaN(Number(price)))
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  const data = await db.product.create({
    data: {
      category,
      name,
      price,
      cogs: 0,
      amount: 0,
      image,
    },
  });

  return res.status(200).json({ message: "Berhasil menambahkan produk", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return GET(req, res);
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
