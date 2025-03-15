import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { type NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await db.information.findMany({
    where: {
      isDeleted: false,
    },
  });

  if (!data.length) {
    const create = await db.information.create({
      data: {
        discount: 0,
        tax: 0,
      },
    });
    return res.status(200).json({ message: "OK", data: create });
  }

  return res.status(200).json({ message: "OK", data: data[0] });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { discount, tax } = req.body;

  if (!discount || !tax || isNaN(Number(discount)) || isNaN(Number(tax)))
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  if (Number(discount) > 100 || Number(tax) > 100)
    return res
      .status(400)
      .json({ message: "Diskon dan pajak tidak boleh lebih dari 100%" });

  const check = await db.information.findMany();

  let informationId = "";

  if (!check.length) {
    const create = await db.information.create({
      data: {
        discount,
        tax,
      },
    });
    informationId = create.id;
  } else {
    informationId = check[0].id;
  }

  const data = await db.information.update({
    data: {
      discount,
      tax,
    },
    where: {
      id: informationId,
    },
  });

  return res
    .status(200)
    .json({ message: "Berhasil mengedit informasi pembayaran", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner", "Cashier"])(req, res);
      case "PUT":
        return AuthApi(PUT, ["Admin", "Owner"])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
