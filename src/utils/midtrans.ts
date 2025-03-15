import axios, { AxiosError } from "axios";
import {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_URL_API,
  MIDTRANS_URL_API2,
} from "@/constants/midtrans";

export const midtransCheckout = async (
  order_id: string,
  gross_amount: number
) => {
  try {
    const encodedServerKey = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
      "base64"
    );

    const { data } = await axios.post(
      MIDTRANS_URL_API + "/snap/v1/transactions",
      {
        transaction_details: {
          order_id,
          gross_amount,
        },
      },
      {
        headers: {
          Authorization: `Basic ${encodedServerKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("Midtrans Error:", error.response?.data || error?.message);
      throw new Error("MIDTRANS_ERROR");
    } else {
      console.log("Midtrans Error:", error);
      throw new Error("MIDTRANS_ERROR");
    }
  }
};

export const midtransCheck = async (order_id: string) => {
  try {
    const encodedServerKey = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
      "base64"
    );

    const { data } = await axios.get(
      MIDTRANS_URL_API2 + "/v2/" + order_id + "/status",
      {
        headers: {
          Authorization: `Basic ${encodedServerKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    console.log("Midtrans Error:", error);
    return null;
  }
};
