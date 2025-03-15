import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { midtransCheck } from "@/utils/midtrans";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const data = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      orderItems: {
        include: {
          product: true,
        },
      },
      transaction: true,
    },
  });

  if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

  if (data.transaction && data.transaction.status === "Pending") {
    const check = await midtransCheck(id);
    if (check) {
      const { transaction_status, status_code, settlement_time } = check;
      if (
        status_code &&
        transaction_status &&
        settlement_time &&
        transaction_status === "settlement"
      ) {
        await db.transaction.update({
          where: {
            orderId: id,
          },
          data: {
            status: "Success",
            detail: check,
          },
          select: {
            id: true,
          },
        });

        const updatedData = await db.order.findUnique({
          where: { id },
          include: {
            customer: true,
            orderItems: {
              include: {
                product: true,
              },
            },
            transaction: true,
          },
        });
        return res.status(200).json({ message: "OK", data: updatedData });
      }
    }
  }

  return res.status(200).json({ message: "OK", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    return AuthApi(GET, ["Admin", "Owner", "Cashier"])(req, res);
  } else {
    return res.status(404).json({ message: "Method not allowed" });
  }
};

export default handler;
