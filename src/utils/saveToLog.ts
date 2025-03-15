import { db } from "@/config/db";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

type Model =
  | "User"
  | "Customer"
  | "Product"
  | "ProductPurchase"
  | "Order"
  | "ProductDefect"
  | "Information";

interface Detail {
  [key: string]: unknown;
  id: string;
}

export const saveToLog = async (
  req: NextApiRequest,
  res: NextApiResponse,
  model: Model,
  detail: Detail
) => {
  let action: $Enums.Action = $Enums.Action.Create;
  let actionDesc = "";
  let modelDesc = "";
  const userId = req?.decoded?.id;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  switch (req.method) {
    case "POST":
      action = $Enums.Action.Create;
      actionDesc = "membuat";
      break;
    case "PUT":
      action = $Enums.Action.Update;
      actionDesc = "mengedit";
      break;
    case "DELETE":
      action = $Enums.Action.Delete;
      actionDesc = "menghapus";
      break;
  }

  switch (model) {
    case "User":
      modelDesc = "pengguna";
      break;
    case "Customer":
      modelDesc = "customer";
      break;
    case "Product":
      modelDesc = "produk";
      break;
    case "ProductPurchase":
      modelDesc = "pembelian produk";
      break;
    case "Order":
      modelDesc = "pesanan";
      break;
    case "ProductDefect":
      modelDesc = "defeksi produk";
      break;
    case "Information":
      modelDesc = "informasi";
      break;
  }

  const description = `${user.name} (${user.role}) ${actionDesc} ${modelDesc} dengan id ${detail.id}`;

  await db.logAction.create({
    data: {
      action,
      referenceModel: model,
      description,
      referenceId: detail.id,
      userId: user?.id,
      detail: JSON.parse(JSON.stringify(detail)),
    },
  });
};
