import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { prisma } from "@/app/lib/prisma";
import { PaymentType, SaleStatus } from "@/generated/prisma";
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
    const userId = parseInt(payload.id);
    const customerId =
      body.customerId === "0" ? null : parseInt(body.customerId);
    const total = parseFloat(body.total);

    return await prisma.$transaction(async (tx) => {
      if (!Array.isArray(body.items) || body.items.length === 0) {
        throw new Error("ไม่พบรายการสินค้าที่จะขาย");
      }

      const sale = await tx.sale.create({
        data: {
          customerId,
          userId,
          total,
          saleType: "BORROW",
          paymentType: "CASH",
          note: body.note || "ยืมสินค้า",
          status: "BORROW" as SaleStatus,
        },
      });

      for (const item of body.items) {
        const productId = parseInt(item.productId);
        const quantity = parseInt(item.quantity);
        const price = parseFloat(item.price);

        const saleDetail = await tx.saleDetail.create({
          data: {
            saleId: sale.id,
            productId,
            quantity,
            price,
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId,
            quantity,
            type: "OUT",
            usersId: userId,
            note: `ยืมสินค้า ใบเสร็จ #${sale.id}`,
          },
        });
      }

      const noti = await tx.sale.findFirst({
        where: {
          id: sale.id,
        },
        select: {
          id: true,
          total: true,
          users: {
            select: {
              name: true,
            },
          },
          details: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      function escapeMarkdown(text: string): string {
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, (match) => `\\${match}`);
      }

      if (noti) {
        const actualChatId = Config.telegram_chatId;
        let productListString = "ไม่พบรายการสินค้า";

        if (noti.details && noti.details.length > 0) {
          productListString = noti.details
            .map((detail) => {
              const productName = detail.product ? detail.product.name : "N/A";
              const quantity = detail.quantity;
              return `- ${escapeMarkdown(
                productName
              )} \\(จำนวน: ${quantity}\\)`;
            })
            .join("\n");
        }

        const messageText = `📢 มีรายการยืมใหม่ในระบบ \n\nรหัสคำสั่งซื้อ: ${String(
          noti.id
        ).padStart(5, "0")}\nผู้ดำเนินการ: ${
          noti.users.name
        }\nรายการสินค้า:\n${productListString}\n\nตรวจสอบรายการได้ที่: ${
          Config.app_url + `/admin/sales/${noti.id})`
        }`;

        const groupNotificationPayload = {
          chat_id: actualChatId,
          text: messageText,
        };

        sendTelegramNotification(groupNotificationPayload);
      }

      return NextResponse.json({ saleId: sale.id }, { status: 200 });
    });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
