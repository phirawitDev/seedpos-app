import { Config } from "@/app/config";
import { prisma } from "@/app/lib/prisma";
import { sendTelegramNotification } from "@/app/utils/telegramNotifier";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allProducts = await prisma.product.findMany();
    const lowStockItems = [];

    for (const item of allProducts) {
      const isLowOnStock =
        item.restock !== null &&
        item.stock !== null &&
        item.stock < item.restock;

      if (isLowOnStock) {
        lowStockItems.push(item);
      }
    }

    if (lowStockItems.length > 0) {
      const productListText = lowStockItems
        .map((item) => `- ${item.name} (คงเหลือ: ${item.stock})`)
        .join("\n");

      const actualChatId = Config.telegram_chatId;
      const rawText = `📢 **แจ้งเตือนสินค้าใกล้หมดสต็อก** 🚨\n\nรายการ:\n${productListText}\n\n`;

      const groupNotificationPayload = {
        chat_id: actualChatId,
        text: rawText,
      };

      await sendTelegramNotification(groupNotificationPayload);
      return NextResponse.json(
        { message: "ส่งแจ้งเตือนเรียบร้อย" },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: "Error!" }, { status: 500 });
  }
}
