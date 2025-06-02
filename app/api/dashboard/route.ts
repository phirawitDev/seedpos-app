import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "@/app/config";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
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

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const saletoday = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ["COMPLETED", "PENDING"],
        },
      },
    });

    const pending = await prisma.pending.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        status: "PENDING",
      },
    });

    const total = saletoday.reduce((sum, sale) => sum + sale.total, 0);

    const respons = {
      saletoday: saletoday.length,
      saletotal: total,
      pending,
      pangingtotal: pending.length,
    };

    return NextResponse.json(respons, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
