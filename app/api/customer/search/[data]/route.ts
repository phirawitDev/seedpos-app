import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ data: string }> }
) {
  try {
    const params = await paramsPromise;
    const data = params.data;

    const customer = await prisma.customer.findMany({
      where: {
        name: {
          contains: data,
        },
        active: true,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(error);
  }
}
