import { NextResponse } from "next/server";
import { Config } from "@/app/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
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

    return NextResponse.json(product, { status: 200 });
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

    const UPLOAD_DIR = path.join(process.cwd(), "uploads/img/products");

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const costPrice = formData.get("costPrice") as string;
    const salePrice = formData.get("salePrice") as string;
    const restock = formData.get("restock") as string;
    const file = formData.get("image") as File;

    const randomInt = Math.floor(Math.random() * 9000) + 1000;
    const fileExt = path.extname(file.name);
    const newFileName = `${Date.now()}${randomInt}${fileExt}`;
    const newFilePath = path.join(UPLOAD_DIR, newFileName);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(newFilePath, fileBuffer);
    const imageUrl = `/api/uploads/img/products/${newFileName}`;

    const product = await prisma.product.create({
      data: {
        name: name,
        categoryId: parseInt(categoryId),
        costPrice: parseFloat(costPrice),
        salePrice: parseFloat(salePrice),
        restock: parseInt(restock),
        imageUrl: imageUrl ?? "",
      },
    });

    return NextResponse.json(product, { status: 200 });
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

    const UPLOAD_DIR = path.join(process.cwd(), "uploads/img/products");

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const Id = formData.get("Id") as string;
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const costPrice = formData.get("costPrice") as string;
    const salePrice = formData.get("salePrice") as string;
    const restock = formData.get("restock") as string;
    const file = formData.get("image") as File;

    console.log(formData);

    const oldProduct = await prisma.product.findFirst({
      where: {
        id: parseInt(Id),
      },
    });

    let imageUrl = oldProduct?.imageUrl;
    if (file && file.size > 0) {
      const filename = oldProduct?.imageUrl?.split("/")[5];
      const filePath = oldProduct?.imageUrl;

      if (filePath) {
        const absolutePath = path.join(
          process.cwd(),
          "uploads/img/products",
          filename as string
        );

        if (fs.existsSync(absolutePath)) {
          try {
            await fsPromises.unlink(absolutePath);
            console.log(`File deleted: ${absolutePath}`);
          } catch (error) {
            console.error(`Failed to delete file: ${absolutePath}`, error);
          }
        } else {
          console.warn(`File not found: ${absolutePath}`);
        }
      }

      const randomInt = Math.floor(Math.random() * 9000) + 1000;
      const fileExt = path.extname(file.name);
      const newFileName = `${Date.now()}${randomInt}${fileExt}`;
      const newFilePath = path.join(UPLOAD_DIR, newFileName);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.promises.writeFile(newFilePath, fileBuffer);

      imageUrl = `/api/uploads/img/products/${newFileName}`;
    }

    const product = await prisma.product.update({
      data: {
        name: name,
        categoryId: parseInt(categoryId),
        costPrice: parseFloat(costPrice),
        salePrice: parseFloat(salePrice),
        restock: parseInt(restock),
        imageUrl: imageUrl,
      },
      where: {
        id: parseInt(Id),
      },
    });

    return NextResponse.json(product, { status: 200 });
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

    const oldProduct = await prisma.product.findFirst({
      where: {
        id: parseInt(id),
      },
    });

    const filename = oldProduct?.imageUrl?.split("/")[5];
    const absolutePath = path.join(
      process.cwd(),
      "uploads/img/products",
      filename as string
    );

    if (fs.existsSync(absolutePath)) {
      try {
        await fsPromises.unlink(absolutePath);
        console.log(`File deleted: ${absolutePath}`);
      } catch (error) {
        console.error(`Failed to delete file: ${absolutePath}`, error);
      }
    }

    const product = await prisma.product.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
