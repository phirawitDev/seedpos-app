import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "@/app/config";
import { StockPandingType } from "@/generated/prisma";
import { prisma } from "@/app/lib/prisma";
import { sendTelegramNotification } from "@/app/utils/telegramNotifier";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header is missing or malformed." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, Config.JWT_SECRET_KEY) as JwtPayload;

    if (!payload) {
      return NextResponse.json({ message: "no Token" });
    }

    const body = await request.json();

    const pending = await prisma.pending.create({
      data: {
        productId: parseInt(body.productId),
        quantity: parseInt(body.quantity),
        note: body.note,
        type: body.type as StockPandingType,
        usersId: parseInt(payload.id),
      },
    });

    const noti = await prisma.pending.findFirst({
      where: {
        id: pending.id,
      },
      include: {
        product: true,
      },
    });

    const actualChatId = Config.telegram_chatId;
    const messageText = `📢 มีรายการขอปรับสต็อกใหม่ \n\nชื่อสินค้า: ${noti?.product.name}\nประเภทรายการ: ${noti?.type}\nจำนวน: ${noti?.quantity}\nหมายเหตุ: ${body.note}\n\nดูที่นี่: ${Config.app_url};

    const groupNotificationPayload = {
      chat_id: actualChatId,
      text: messageText,
    }`;

    const groupNotificationPayload = {
      chat_id: actualChatId,
      text: messageText,
    };

    sendTelegramNotification(groupNotificationPayload);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
