import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header is missing or malformed." },
        { status: 401 } // Unauthorized
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, Config.JWT_SECRET_KEY) as JwtPayload;

    if (!payload) {
      return NextResponse.json({ message: "no Token" });
    }

    const admin = await prisma.users.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        name: true,
        role: true,
      },
    });

    return NextResponse.json(admin);
  } catch (error) {
    const e = error as Error;
    return new NextResponse(e.message, { status: 500 });
  }
}
