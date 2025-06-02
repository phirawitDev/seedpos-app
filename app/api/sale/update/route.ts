import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { StockType } from "@/generated/prisma";

interface NewSaleItem {
  productId: string | number;
  quantity: string | number;
  price: string | number;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header is missing or malformed." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    let payload: JwtPayload;

    try {
      payload = jwt.verify(token, Config.JWT_SECRET_KEY) as JwtPayload;
    } catch (jwtError: any) {
      console.error("JWT Verification Error:", jwtError.message);
      return NextResponse.json(
        { message: `Authentication failed: ${jwtError.message}` },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.saleId || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { message: "Sale ID and items array are required." },
        { status: 400 } // Bad Request
      );
    }
    const saleId = parseInt(body.saleId as string, 10);
    if (isNaN(saleId)) {
      return NextResponse.json(
        { message: "Invalid Sale ID format." },
        { status: 400 }
      );
    }

    console.log("Request Body:", body);

    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          details: true,
        },
      });

      if (!sale) {
        throw new Error(`ไม่พบบิล ID: ${saleId}`);
      }

      const oldDetails = sale.details;
      const newItems = body.items as NewSaleItem[];

      console.log("New Items from body:", newItems);
      console.log("Old Sale Details:", oldDetails);

      for (const oldItem of oldDetails) {
        const oldItemProductId = parseInt(String(oldItem.productId), 10);
        const oldItemQuantity = parseInt(String(oldItem.quantity), 10);

        if (isNaN(oldItemProductId) || isNaN(oldItemQuantity)) {
          throw new Error(
            `Invalid data in old sale detail item ID: ${oldItem.id}`
          );
        }

        // คืน stock รวม
        await tx.product.update({
          where: { id: oldItemProductId },
          data: { stock: { increment: oldItemQuantity } },
        });
        console.log(
          `Stock incremented for product ID ${oldItemProductId} by ${oldItemQuantity}`
        );

        await tx.stockMovement.create({
          data: {
            productId: oldItemProductId,
            quantity: oldItemQuantity,
            type: "IN" as StockType,
            usersId: parseInt(payload.id as string, 10),
            note: `คืนสินค้าจากการแก้ไขบิล #${sale.id} (สินค้าเดิม ID: ${oldItem.productId})`,
          },
        });

        await tx.saleDetail.delete({
          where: { id: oldItem.id },
        });
        console.log(`Deleted old sale detail ID ${oldItem.id}`);
      }

      let calculatedNewTotal = 0;

      for (const item of newItems) {
        const productId = parseInt(String(item.productId), 10);
        const quantity = parseInt(String(item.quantity), 10);
        const price = parseFloat(String(item.price));

        if (
          isNaN(productId) ||
          isNaN(quantity) ||
          isNaN(price) ||
          quantity <= 0
        ) {
          throw new Error(
            `ข้อมูลสินค้าใหม่ไม่ถูกต้อง: ${JSON.stringify(item)}`
          );
        }

        const productToSell = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!productToSell) {
          throw new Error(`ไม่พบสินค้า ID: ${productId} ในระบบ`);
        }

        if (
          productToSell.stock === null ||
          productToSell.stock === undefined ||
          productToSell.stock < quantity
        ) {
          throw new Error(
            `สินค้า ${
              productToSell.name
            } (ID: ${productId}) ไม่เพียงพอในคลัง (ต้องการ ${quantity}, มีอยู่ ${
              productToSell.stock ?? 0
            })`
          );
        }

        await tx.saleDetail.create({
          data: {
            saleId: sale.id,
            productId: productId,
            quantity: quantity,
            price: price,
          },
        });
        console.log(
          `Created new sale detail for product ID ${productId}, quantity ${quantity}`
        );

        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });
        console.log(
          `Stock decremented for product ID ${productId} by ${quantity}`
        );

        await tx.stockMovement.create({
          data: {
            productId: productId,
            quantity: quantity,
            type: "OUT" as StockType,
            usersId: parseInt(payload.id as string, 10),
            note: `ขายสินค้าจากการแก้ไขบิล #${sale.id} (สินค้าใหม่ ID: ${productId})`,
          },
        });

        calculatedNewTotal += quantity * price;
      }

      await tx.sale.update({
        where: { id: sale.id },
        data: { total: calculatedNewTotal },
      });
      console.log(
        `Sale ID ${sale.id} updated with new total: ${calculatedNewTotal}`
      );

      return NextResponse.json({
        success: true,
        message: "แก้ไขคำสั่งซื้อเรียบร้อย",
        saleId: sale.id,
        newTotal: calculatedNewTotal,
      });
    });
  } catch (error: unknown) {
    console.error("API POST /api/edit-sale Error:", error);
    const e = error as Error;
    let message = "เกิดข้อผิดพลาดในการแก้ไขคำสั่งซื้อ";
    if (e.message) {
      if (
        e.message.startsWith("ไม่พบบิล") ||
        e.message.includes("ไม่เพียงพอในคลัง") ||
        e.message.startsWith("ข้อมูลสินค้าใหม่ไม่ถูกต้อง") ||
        e.message.startsWith("ไม่พบสินค้า ID:")
      ) {
        message = e.message;
      }
    }
    return NextResponse.json(
      { success: false, message: message, errorName: e.name },
      { status: e.message.startsWith("ไม่พบบิล") ? 404 : 400 }
    );
  }
}
