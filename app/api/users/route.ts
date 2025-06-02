import { Config } from "@/app/config";
import { Role } from "@/generated/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
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

    const users = await prisma.users.findMany({
      where: {
        active: true,
      },
    });
    return NextResponse.json(users);
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
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.users.create({
      data: {
        name: body.name,
        username: body.username,
        password: hashedPassword,
        role: body.role as Role,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const oldUser = await prisma.users.findUnique({
      where: {
        id: body.Id,
      },
    });

    let password = "";
    if (body.password !== "") {
      password = hashedPassword;
    } else {
      password = oldUser?.password ?? "";
    }

    const user = await prisma.users.update({
      data: {
        name: body.name,
        username: body.username,
        password: password,
        role: body.role as Role,
      },
      where: {
        id: body.Id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url, "http://localhost");
    const id = String(searchParams.get("Id"));

    const user = await prisma.users.update({
      data: {
        active: false,
      },
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json(id);
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
