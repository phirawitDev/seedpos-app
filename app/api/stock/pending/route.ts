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

    function escapeMarkdown(text: string): string {
      return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, (match) => `\\${match}`);
    }

    const actualChatId = Config.telegram_chatId;

    const rawText = `📢 มีรายการขอปรับสต็อกใหม่ในระบบ

หมายเหตุ: ${body.note}

กรุณาเข้าไปดำเนินการ!`;

    const messageText = escapeMarkdown(rawText);

    const inlineKeyboard = [
      [
        {
          text: "🔍 ดำเนินการตอนนี้",
          url: `${Config.app_url}/admin/dashboard`, // 🔗 เปลี่ยนเส้นทางตามหน้าที่ต้องการ
        },
      ],
    ];

    const groupNotificationPayload = {
      chat_id: actualChatId,
      text: messageText,
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    };

    sendTelegramNotification(groupNotificationPayload);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
