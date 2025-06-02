import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ data: string }> }
) {
  try {
    const params = await paramsPromise;
    const data = params.data;

    const users = await prisma.users.findMany({
      where: {
        name: {
          contains: data,
        },
        active: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(error);
  }
}
