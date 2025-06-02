import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

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

    if (!body.id) {
      return NextResponse.json({ message: "No Id!" }, { status: 401 });
    }

    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: parseInt(body.id) },
        include: {
          details: true,
        },
      });

      if (!sale) throw new Error("ไม่พบบิลที่ต้องการยกเลิก");
      if (sale.status === "CANCELED") throw new Error("บิลนี้ถูกยกเลิกไปแล้ว");

      // 1. คืน stock ให้ product และ productLot
      for (const detail of sale.details) {
        const { productId, quantity } = detail;

        // คืน stock รวม
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: { increment: quantity },
          },
        });

        // สร้าง StockMovement กลับเข้า
        await tx.stockMovement.create({
          data: {
            productId,
            quantity,
            type: "IN",
            usersId: parseInt(payload.id),
            note: `ยกเลิกใบเสร็จ #${body.id}`,
          },
        });
      }

      // 2. อัปเดตสถานะบิล
      await tx.sale.update({
        where: { id: parseInt(body.id) },
        data: {
          status: "CANCELED",
        },
      });

      return NextResponse.json({
        success: true,
        message: `ยกเลิกบิล #${body.id} เรียบร้อย`,
      });
    });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
