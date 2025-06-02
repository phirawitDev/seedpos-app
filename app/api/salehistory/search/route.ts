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

    const startDate = new Date(`${body.startday}T00:00:00+07:00`);
    const endDateForQuery = new Date(`${body.endday}T23:59:59+07:00`);

    if (isNaN(startDate.getTime()) || isNaN(endDateForQuery.getTime())) {
      console.error("Invalid date string provided.");
      throw new Error("Invalid date format in query parameters.");
    }

    let sales = null;
    if (body.saleType != "ALL") {
      sales = await prisma.sale.findMany({
        include: {
          users: true,
        },
        where: {
          AND: [
            {
              createdAt: {
                gte: startDate,
                lt: endDateForQuery,
              },
            },
            {
              saleType: body.saleType,
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      sales = await prisma.sale.findMany({
        include: {
          users: true,
        },
        where: {
          AND: [
            {
              createdAt: {
                gte: startDate,
                lt: endDateForQuery,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
