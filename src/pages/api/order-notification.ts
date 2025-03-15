import { db } from "@/config/db";
import { NextApiRequest, NextApiResponse } from "next/types";

// WEB HOOKS

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;
  const { transaction_status, order_id, fraud_status } = body;

  const check = await db.order.findUnique({
    where: { id: order_id },
    include: { transaction: true },
  });

  if (!check) return res.status(404).json({ message: "Data tidak ditemukan" });

  if (
    (transaction_status == "capture" && fraud_status == "accept") ||
    transaction_status == "settlement"
  ) {
    await db.transaction.update({
      where: {
        orderId: order_id,
        detail: body,
      },
      data: {
        status: "Success",
      },
    });
  }

  const data = await db.order.findUnique({
    where: { id: order_id },
    include: { transaction: true },
  });

  return res.status(200).json({ message: "OK", data: data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    return POST(req, res);
  } else {
    return res.status(404).json({ message: "Method not allowed" });
  }
};

export default handler;
