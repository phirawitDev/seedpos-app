import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "@/app/config";
import { prisma } from "@/app/lib/prisma";
import { StockPandingType } from "@/generated/prisma";

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

    const pending = await prisma.pending.findUnique({
      where: {
        id: parseInt(body.id),
      },
    });

    if (!pending) {
      return NextResponse.json(
        { message: "Pending item not found." },
        { status: 404 }
      );
    }

    if (body.type == "cancel") {
      const pending = await prisma.pending.update({
        data: {
          status: "REJECTED",
        },
        where: {
          id: body.id,
        },
      });
      return NextResponse.json({ status: 200 });
    }

    if (pending.type == ("IN" as StockPandingType)) {
      await prisma.$transaction(async (tx) => {
        const stock = await tx.stockMovement.create({
          data: {
            productId: pending.productId,
            quantity: pending.quantity,
            type: "IN",
            note: pending.note,
            usersId: pending.usersId,
          },
        });

        await tx.product.update({
          where: {
            id: pending.productId,
          },
          data: {
            stock: {
              increment: pending.quantity,
            },
            lowStockNotified: true,
          },
        });

        await tx.pending.update({
          where: {
            id: body.id,
          },
          data: {
            status: "ACCEPTED",
          },
        });
      });
    } else if (pending.type == ("OUT" as StockPandingType)) {
      await prisma.$transaction(async (tx) => {
        const stock = await tx.stockMovement.create({
          data: {
            productId: pending.productId,
            quantity: pending.quantity,
            type: "OUT",
            note: pending.note,
            usersId: pending.usersId,
          },
        });

        await tx.product.update({
          where: {
            id: pending.productId,
          },
          data: {
            stock: {
              decrement: pending.quantity,
            },
            lowStockNotified: true,
          },
        });

        await tx.pending.update({
          where: {
            id: body.id,
          },
          data: {
            status: "ACCEPTED",
          },
        });
      });
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
