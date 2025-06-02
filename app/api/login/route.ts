import { Config } from "@/app/config";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server"; // Import NextResponse

// Ensure JWT_SECRET_KEY is set in your environment variables
const JWT_SECRET_KEY = Config.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
  throw new Error(
    "Please define the JWT_SECRET_KEY environment variable inside .env.local"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const users = await prisma.users.findFirst({
      where: {
        username: body.username,
        active: true,
      },
    });

    if (!users || !(await bcrypt.compare(body.password, users.password))) {
      return new NextResponse("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", {
        status: 401,
      });
    }

    const token = jwt.sign(
      {
        id: users.id,
        name: users.name,
        role: users.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
      },
      JWT_SECRET_KEY
    );

    return NextResponse.json({
      token,
      user: {
        id: users.id,
        name: users.name,
        role: users.role,
      },
    });
  } catch (error) {
    return NextResponse.json(error);
  }
}
