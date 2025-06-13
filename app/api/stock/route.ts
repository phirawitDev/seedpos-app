import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "@/app/config";
import { StockType } from "@/generated/prisma";
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

    const product = await prisma.product.findMany({
      include: {
        stockMovement: {
          include: {
            users: true,
          },
        },
      },
    });

    const productsWithStock = product.map((product) => {
      const stockHistory = product.stockMovement.map((mv) => ({
        type: mv.type,
        quantity: mv.quantity,
        note: mv.note,
        usersName: mv.users?.name ?? "ไม่ทราบผู้ทำรายการ",
        date: mv.createdAt,
      }));

      return {
        id: product.id,
        name: product.name,
        stock: product.stock,
        history: stockHistory,
      };
    });

    return NextResponse.json(productsWithStock, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}

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

    if (body.type == "IN") {
      await prisma.$transaction(async (tx) => {
        const stock = await tx.stockMovement.create({
          data: {
            productId: parseInt(body.productId),
            quantity: parseInt(body.quantity),
            type: body.type as StockType,
            note: body.note ?? "",
            usersId: payload.id,
          },
        });

        await tx.product.update({
          where: {
            id: parseInt(body.productId),
          },
          data: {
            stock: {
              increment: parseInt(body.quantity),
            },
            lowStockNotified: true,
          },
        });
      });
    } else if (body.type == "OUT") {
      await prisma.$transaction(async (tx) => {
        const stock = await tx.stockMovement.create({
          data: {
            productId: parseInt(body.productId),
            quantity: parseInt(body.quantity),
            type: body.type as StockType,
            note: body.note ?? "",
            usersId: payload.id,
          },
        });

        await tx.product.update({
          where: {
            id: parseInt(body.productId),
          },
          data: {
            stock: {
              decrement: parseInt(body.quantity),
            },
            lowStockNotified: true,
          },
        });
      });
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
