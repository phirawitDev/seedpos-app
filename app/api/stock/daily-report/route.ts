import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { startOfDay, endOfDay, subMilliseconds, isToday } from "date-fns";

export async function GET(request: Request) {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const yesterdayEnd = subMilliseconds(todayStart, 1);
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

    const products = await prisma.product.findMany({
      include: {
        stockMovement: true,
      },
    });

    const report = products.map((product) => {
      const movements = product.stockMovement;

      const beforeToday = movements.filter((m) => m.createdAt < todayStart);
      const todayMovements = movements.filter(
        (m) => m.createdAt >= todayStart && m.createdAt <= todayEnd
      );

      const prevIn = beforeToday
        .filter((m) => m.type === "IN")
        .reduce((sum, m) => sum + m.quantity, 0);
      const prevOut = beforeToday
        .filter((m) => m.type === "OUT")
        .reduce((sum, m) => sum + m.quantity, 0);
      const carryOver = prevIn - prevOut;

      const totalIn = todayMovements
        .filter((m) => m.type === "IN")
        .reduce((sum, m) => sum + m.quantity, 0);
      const totalOut = todayMovements
        .filter((m) => m.type === "OUT")
        .reduce((sum, m) => sum + m.quantity, 0);

      const change = totalIn - totalOut;
      const remain = carryOver + change;

      return {
        id: product.id,
        name: product.name,
        carryOver,
        totalIn,
        totalOut,
        change,
        remain,
        categoryId: product.categoryId,
        updatedAt: product.updatedAt,
      };
    });

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
