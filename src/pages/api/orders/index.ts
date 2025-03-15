import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { midtransCheckout } from "@/utils/midtrans";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const role = req.decoded?.role as $Enums.Role;
  const data = await db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orderItems: true,
      transaction: true,
      customer: true,
    },
    where:
      role === "Cashier"
        ? {
            createdAt: {
              gte: today,
            },
          }
        : undefined,
  });
  return res.status(200).json({ message: "OK", data });
};

interface OrderItemDTO {
  amount: number;
  price: number;
  total: number;
  productId: string;
}

interface UpdateProduct {
  id: string;
  amount: number;
}

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { description, code, method, orderItems } = req.body;

  if (!orderItems || !method)
    return res.status(400).json({ message: "Semua kolom wajib diisi" });

  if (!$Enums.PaymentMethod[method as keyof typeof $Enums.PaymentMethod])
    return res.status(400).json({ message: "Metode pembayaran tidak valid" });

  if (!Array.isArray(orderItems))
    return res.status(400).json({ message: "Order items harus berupa array" });

  if (orderItems.length === 0)
    return res.status(400).json({ message: "Order items tidak boleh kosong" });

  const productIds: string[] = [];

  for (const orderItem of orderItems) {
    if (!orderItem.productId)
      return res.status(400).json({ message: "Product id tidak boleh kosong" });
    if (!orderItem.amount)
      return res.status(400).json({ message: "Jumlah tidak boleh kosong" });

    productIds.push(orderItem.productId);
  }

  const checkProducts = await db.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  if (checkProducts.length !== productIds.length)
    return res.status(400).json({ message: "Produk tidak ditemukan" });

  const filteredOrderItems: OrderItemDTO[] = [];
  const updateProducts: UpdateProduct[] = [];

  let subTotal = 0;

  for (const orderItem of orderItems) {
    const checkProduct = checkProducts.find(
      (product) => product.id === orderItem.productId
    );
    if (!checkProduct)
      return res.status(400).json({ message: "Produk tidak ditemukan" });
    if (checkProduct.amount < orderItem.amount)
      return res.status(400).json({ message: "Stok produk tidak mencukupi" });

    const newAmount = checkProduct.amount - Number(orderItem.amount) || 0;
    updateProducts.push({ id: checkProduct.id, amount: newAmount });

    filteredOrderItems.push({
      amount: Number(orderItem.amount),
      price: checkProduct.price,
      total: checkProduct.price * Number(orderItem.amount) || 0,
      productId: checkProduct.id,
    });

    subTotal += checkProduct.price * Number(orderItem.amount) || 0;
  }

  for (const updateProduct of updateProducts) {
    await db.product.update({
      data: {
        amount: updateProduct.amount,
      },
      where: {
        id: updateProduct.id,
      },
    });
  }

  const information = await db.information.findMany();

  const discount =
    subTotal * (Number(information[0]?.discount || 0) / 100) || 0;
  const priceBeforeTax = subTotal - discount;
  const tax = priceBeforeTax * (Number(information[0]?.tax || 0) / 100) || 0;

  const finalTotal = priceBeforeTax + tax;

  const customer = await db.customer.findUnique({
    where: {
      code,
    },
  });

  const data = await db.order.create({
    data: {
      description,
      discount,
      finalTotal,
      subTotal,
      tax,
      customerId: customer?.id,
      orderItems: {
        createMany: {
          data: filteredOrderItems,
        },
      },
      transaction: {
        create: {
          amount: finalTotal,
          method: method as $Enums.PaymentMethod,
          status: method === "Cash" ? "Success" : "Pending",
          detail: {},
        },
      },
    },
    include: {
      orderItems: true,
      transaction: true,
      customer: true,
    },
  });

  if (method !== "Cash") {
    const checkout = await midtransCheckout(data.id, finalTotal);
    await db.transaction.update({
      where: {
        id: data?.transaction?.id || "",
      },
      data: {
        snapToken: checkout?.token,
        redirectUrl: checkout?.redirect_url,
        detail: checkout,
      },
    });

    const checkData = await db.order.findUnique({
      where: {
        id: data.id,
      },
      include: {
        customer: true,
        orderItems: true,
        transaction: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Berhasil membuat pesanan", data: checkData });
  }

  return res.status(200).json({ message: "Berhasil membuat pesanan", data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, ["Admin", "Owner", "Cashier"])(req, res);
      case "POST":
        return AuthApi(POST, ["Admin", "Owner", "Cashier"])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi Kesalahan Sistem" });
  }
};

export default handler;
