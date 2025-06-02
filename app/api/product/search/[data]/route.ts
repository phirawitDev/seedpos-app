import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ data: string }> }
) {
  try {
    const params = await paramsPromise;
    const data = params.data;

    const product = await prisma.product.findMany({
      where: {
        name: {
          contains: data,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        costPrice: true,
        salePrice: true,
        restock: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(error);
  }
}
