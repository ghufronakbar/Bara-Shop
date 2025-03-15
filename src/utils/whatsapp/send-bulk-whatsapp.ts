import { whatsapp } from "@/config/whatsapp";
import { APP_NAME } from "@/constants";
import { AxiosError } from "axios";

export const sendBulkWhatsapp = async (
  phones: string[],
  subject: string,
  message: string
) => {
  const promises = phones.map(async (phone) => {
    console.log("Sending WhatsApp message to: ", phone);
    const fullMessage = `*${subject} - ${APP_NAME}*\n\n${message}`;
    try {
      await whatsapp.post("/send", {
        target: phone,
        message: fullMessage,
      });
      console.log(`Message sent successfully to ${phone}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(
          `Axios Error sending WhatsApp message to ${phone}: `,
          error?.response
        );
      } else if (error instanceof Error) {
        console.log(
          `Error sending WhatsApp message to ${phone}: `,
          error.message
        );
      }
    }
  });

  await Promise.all(promises);
};
