import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { type NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const data = await db.product.findUnique({
    where: { id },
  });

  if (!data) return res.status(404).json({ message: "Produk tidak ditemukan" });

  return res.status(200).json({ message: "OK", data });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const { category, name, price, image } = req.body;

  if (!category || !name || !price || isNaN(Number(price)))
    return res.status(400).json({ message: "All fields are required" });

  const check = await db.product.findUnique({
    where: { id },
  });

  if (!check || (check && check.isDeleted))
    return res.status(404).json({ message: "Produk tidak ditemukan" });

  const data = await db.product.update({
    data: {
      category,
      name,
      price,
      cogs: 0,
      amount: 0,
      image: image || check.image,
    },
    where: { id },
  });

  return res.status(200).json({ message: "Berhasil mengedit produk", data });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const check = await db.product.findUnique({
    where: { id },
  });

  if (!check)
    return res.status(404).json({ message: "Produk tidak ditemukan" });

  const data = await db.product.update({
    data: {
      isDeleted: true,
    },
    where: { id },
  });

  return res.status(200).json({ message: "Berhasil menghapus produk", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, [
          "Admin",
          "Owner",
          "ManagerOperational",
          "Cashier",
        ])(req, res);
      case "PUT":
        return AuthApi(PUT, ["Admin", "Owner"])(req, res);
      case "DELETE":
        return AuthApi(DELETE, ["Admin", "Owner"])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default handler;
