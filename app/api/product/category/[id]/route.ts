import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const id = params.id;

    const product = await prisma.product.findMany({
      where: {
        categoryId: parseInt(id),
      },
      select: {
        id: true,
        name: true,
        category: true,
        costPrice: true,
        salePrice: true,
        restock: true,
        stock: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(error);
  }
}
