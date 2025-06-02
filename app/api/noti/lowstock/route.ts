import { Config } from "@/app/config";
import { prisma } from "@/app/lib/prisma";
import { sendTelegramNotification } from "@/app/utils/telegramNotifier";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stock = await prisma.product.findMany();
    for (const item of stock) {
      if (
        item.restock !== null &&
        item.stock !== null &&
        item.stock < item.restock
      ) {
        const actualChatId = Config.telegram_chatId;

        const rawText = `📢 แจ้งเตือนสินค้าใกล้หมดสต็อก \n\nชื่อสินค้า: ${
          item.name
        }\nจำนวนคงเหลือ: ${item.stock}\n\nตรวจสอบรายการได้ที่: ${
          Config.app_url + `/admin/stock`
        }`;

        const groupNotificationPayload = {
          chat_id: actualChatId,
          text: rawText,
        };

        sendTelegramNotification(groupNotificationPayload);
        return NextResponse.json(
          { message: "ส่งแจ้งเตือนเรียบร้อย" },
          { status: 200 }
        );
      }
    }
  } catch (error) {
    return NextResponse.json({ message: "Error!" }, { status: 500 });
  }
}
