import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/app/lib/prisma";
import { PaymentType } from "@/generated/prisma";
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

    const UPLOAD_DIR = path.join(process.cwd(), "uploads/img/slip");

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();

    const file = formData.get("image") as File;
    const total = formData.get("total") as string;
    const customerId = formData.get("customerId") as string;
    const paymentType = formData.get("paymentType") as string;
    const note = formData.get("note") as string;

    const Id = customerId == "0" ? null : parseInt(customerId);
    const itemsData = formData.get("items") as string;
    const rawItems = itemsData ? JSON.parse(itemsData) : [];
    const randomInt = Math.floor(Math.random() * 9000) + 1000;

    let imageUrl = "";
    if (file && file.size > 0) {
      const fileExt = path.extname(file.name);
      const newFileName = `${Date.now()}${randomInt}${fileExt}`;
      const newFilePath = path.join(UPLOAD_DIR, newFileName);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.promises.writeFile(newFilePath, fileBuffer);
      imageUrl = `/api/uploads/img/slip/${newFileName}`;
    }

    return await prisma.$transaction(async (tx) => {
      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        throw new Error("ไม่พบรายการสินค้าที่จะขาย");
      }

      const sale = await tx.sale.create({
        data: {
          customerId: Id,
          userId: parseInt(payload.id),
          total: parseFloat(total),
          paymentType: paymentType as PaymentType,
          saleType: "NORMAL",
          note: note,
          slipImg: imageUrl,
          status: "PENDING",
        },
      });

      for (const item of rawItems) {
        const { productId, quantity, price } = item;

        // บันทึก SaleDetail
        const saleDetail = await tx.saleDetail.create({
          data: {
            saleId: sale.id,
            productId,
            quantity,
            price,
          },
        });

        // หัก stock รวม
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        // บันทึก StockMovement
        await tx.stockMovement.create({
          data: {
            productId,
            quantity,
            type: "OUT",
            usersId: parseInt(payload.id),
            note: `ขายสินค้า ใบเสร็จ #${sale.id}`,
          },
        });
      }

      const noti = await tx.sale.findFirst({
        where: {
          id: sale.id,
        },
        select: {
          total: true,
          id: true,
          paymentType: true,
          users: {
            select: {
              name: true,
            },
          },
        },
      });

      if (noti) {
        const actualChatId = Config.telegram_chatId;

        const rawText = `📢 มีรายการขายใหม่ในระบบ \n\nรหัสคำสั่งซื้อ: ${String(
          noti.id
        ).padStart(5, "0")}\nยอดรวม: ${noti.total.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}\nช่องทางการชำระ: ${
          (noti.paymentType == "CASH" && "เงินสด") ||
          (noti.paymentType == "TRANSFER" && "โอนผ่านธนาคาร")
        }\nผู้ดำเนินการ: ${noti.users.name}\n\nตรวจสอบรายการได้ที่: ${
          Config.app_url + `/admin/salehistory/detail/${noti.id}`
        }`;

        const groupNotificationPayload = {
          chat_id: actualChatId,
          text: rawText,
        };

        sendTelegramNotification(groupNotificationPayload);
      }

      const lowStockProducts = await prisma.product.findMany({
        where: {
          lowStockNotified: true,
        },
      });

      if (lowStockProducts && lowStockProducts.length > 0) {
        for (const product of lowStockProducts) {
          if (
            product.stock !== null &&
            product.restock !== null &&
            product.stock < product.restock
          ) {
            const actualChatId = Config.telegram_chatId;

            const rawText = `📢 **แจ้งเตือนสินค้าใกล้หมดสต็อก** 🚨\n\nชื่อสินค้า: ${product.name}\nจำนวนคงเหลือ: ${product.stock}`;

            const groupNotificationPayload = {
              chat_id: actualChatId,
              text: rawText,
            };

            sendTelegramNotification(groupNotificationPayload);

            await prisma.product.update({
              where: { id: product.id },
              data: {
                lowStockNotified: false,
              },
            });
          }
        }
      }

      return NextResponse.json({ saleId: sale.id }, { status: 200 });
    });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
