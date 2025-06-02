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

    const transaction = await prisma.stockMovement.findMany({
      where: {
        productId: parseInt(id),
      },
      include: {
        product: true,
        users: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
