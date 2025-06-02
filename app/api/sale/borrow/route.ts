import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PaymentType, SaleStatus } from "@/generated/prisma";

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

    let status = "";
    let paymentType = "";
    if (body.borrowtype == "ITEMS") {
      status = "RETURNED";
      paymentType = "ITEMS";
    } else if (body.borrowtype == "CASH") {
      status = "RETURNED";
      paymentType = "CASH";
    }

    const data = await prisma.sale.update({
      data: {
        status: status as SaleStatus,
        paymentType: paymentType as PaymentType,
      },
      where: {
        id: parseInt(body.id),
      },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
