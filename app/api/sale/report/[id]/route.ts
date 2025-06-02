import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const id = params.id;
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

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        users: true,
        details: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({
        success: false,
        message: "ไม่พบข้อมูลใบเสร็จ",
      });
    }

    const items = sale.details.map((detail) => {
      return {
        productId: detail.product.id,
        productName: detail.product.name,
        quantity: detail.quantity,
        price: detail.price,
        total: detail.quantity * detail.price,
      };
    });

    const thaiDate = new Date(sale.createdAt).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const result = {
      saleId: sale.id,
      customerName: sale.customer?.name || "ทั่วไป",
      employeeName: sale.users.name,
      total: sale.total,
      note: sale.note,
      saleType: sale.saleType,
      paymentType: sale.paymentType,
      createdAt: thaiDate,
      items,
    };

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
