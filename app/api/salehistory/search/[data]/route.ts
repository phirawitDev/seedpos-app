import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { SaleType } from "@/generated/prisma";

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ data: string }> }
) {
  try {
    const params = await paramsPromise;
    const data = params.data;

    const sale = await prisma.sale.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        saleType: data as SaleType,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json(error);
  }
}
