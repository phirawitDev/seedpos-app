import { Config } from "@/app/config"; // ปรับ Path ตามต้องการ
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // ปรับ Path ตามต้องการ
import { startOfDay, endOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const timeZone = "Asia/Bangkok";

interface ReportItem {
  id: number;
  name: string;
  carryOver: number;
  totalIn: number;
  totalOut: number;
  change: number;
  remain: number;
  categoryId?: number | null; // categoryId อาจเป็น null หรือไม่มีก็ได้ ขึ้นอยู่กับ schema
}

export async function GET(request: NextRequest) {
  // สมมติว่าเป็น GET request หรือปรับเป็น POST ถ้าคุณรับ filter จาก body
  try {
    // --- Authentication (เหมือนเดิม) ---
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header is missing or malformed." },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, Config.JWT_SECRET_KEY) as JwtPayload;
    } catch (jwtError: any) {
      console.error("JWT Verification Error:", jwtError.message);
      return NextResponse.json(
        { message: `Authentication failed: ${jwtError.message}` },
        { status: 401 }
      );
    }

    // --- กำหนดช่วงวันที่สำหรับรายงาน (วันนี้ตามเวลาประเทศไทย) ---
    // (ถ้าต้องการให้ user เลือกวันได้ ให้รับค่า selectedDate จาก request.nextUrl.searchParams หรือ request.json() แทน new Date())
    const dateForReport = new Date(); // สำหรับรายงาน "วันนี้"
    const dateInThailandForReport = toZonedTime(dateForReport, timeZone);
    const reportPeriodStart = startOfDay(dateInThailandForReport);
    const reportPeriodEnd = endOfDay(dateInThailandForReport);

    console.log(
      "Report Period Start (Thailand):",
      reportPeriodStart.toISOString()
    );
    console.log("Report Period End (Thailand):", reportPeriodEnd.toISOString());

    // --- ดึงข้อมูล Product และ StockMovement เฉพาะของวันนี้ ---
    const productsData = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true, // สต็อกจริงปัจจุบัน
        categoryId: true, // ถ้าต้องการแสดงในรายงาน
        stockMovement: {
          where: {
            createdAt: {
              gte: reportPeriodStart,
              lte: reportPeriodEnd,
            },
          },
          select: {
            type: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // --- คำนวณข้อมูลสำหรับ Report ---
    const report: ReportItem[] = productsData.map((product) => {
      const todayMovements = product.stockMovement;

      const totalInToday = todayMovements
        .filter((m) => m.type === "IN")
        .reduce((sum, m) => sum + m.quantity, 0);

      const totalOutToday = todayMovements
        .filter((m) => m.type === "OUT")
        .reduce((sum, m) => sum + m.quantity, 0);

      const changeToday = totalInToday - totalOutToday;

      const remain = product.stock ?? 0; // ยอดคงเหลือปัจจุบัน (จาก product.stock)

      const carryOver = remain - changeToday; // ยอดยกมา (คำนวณจากยอดคงเหลือ - ยอดเปลี่ยนแปลงวันนี้)

      return {
        id: product.id,
        name: product.name,
        carryOver,
        totalIn: totalInToday,
        totalOut: totalOutToday,
        change: changeToday,
        remain,
        categoryId: product.categoryId,
      };
    });

    return NextResponse.json(report, { status: 200 });
  } catch (error: any) {
    console.error("API GET Stock Report Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while generating the report.";
    // พิจารณาการส่ง error message ที่เฉพาะเจาะจงมากขึ้นถ้าเป็น custom error ที่คุณ throw เอง
    return NextResponse.json(
      { message: message, errorName: error.name },
      { status: 500 }
    );
  }
}
