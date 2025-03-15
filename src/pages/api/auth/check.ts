import { type NextApiRequest, NextApiResponse } from "next/types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/constants";
import AuthApi from "@/middleware/auth-api";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  return res.status(200).json({ message: "OK", data: decoded });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET":
        return AuthApi(GET, [
          "Admin",
          "Owner",
          "Cashier",
          "ManagerOperational",
        ])(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default handler;
