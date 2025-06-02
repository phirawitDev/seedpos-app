"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface SaleData {
  id: number;
  createdAt: Date;
  paymentType: string;
  saleType: string;
  status: string;
  total: number;
  users: {
    id: number;
    name: string;
  };
}

export default function StockReportPage() {
  const url = usePathname();
  const id = url.split("/")[3];
  const [saleData, setSaleData] = useState<SaleData>();

  useEffect(() => {
    fecthreport();
  }, []);

  useEffect(() => {
    if (saleData) {
      setTimeout(() => {
        window.print();
      }, 500);
      window.onafterprint = () => {
        window.close();
      };
    }
  }, [saleData]);

  const fecthreport = async () => {
    const url = `/api/salehistory/report`;
    const headers = getAuthHeaders();

    const res = await axios.get(url, { headers });

    if (res.status == 200) {
      setSaleData(res.data);
    }
  };

  const thaiDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="">
      <div
        id="print-area"
        className="p-10 bg-white w-[190mm] mx-auto print:p-0 print:shadow-none"
      >
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h1 className="text-2xl font-bold">ทิพย์รุ่งโรจน์การเกษตร</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">รายงานสรุปรายการขาย</p>
            <p className="text-md font-semibold">{thaiDate}</p>
          </div>
        </div>

        <table className="w-full border border-gray-800 text-sm">
          <thead>
            <tr className="bg-gray-300">
              <th className="border p-2">รหัสคำสั่งซื้อ</th>
              <th className="border p-2 w-[30%]">วันเวลาขาย</th>
              <th className="border p-2">ยอดรวมสุทธิ</th>
              <th className="border p-2">ช่องทางการชำระ</th>
              <th className="border p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(saleData) &&
              saleData.map((item: SaleData, i: number) => (
                <tr key={item.id}>
                  <td className="border p-2 text-center">
                    {String(item.id).padStart(5, "0")}
                  </td>
                  <td className="border p-2">
                    {item.createdAt
                      ? format(
                          new Date(item.createdAt),
                          "d/MM/yyyy เวลา HH:mm น.",
                          { locale: th }
                        )
                      : "N/A"}
                  </td>
                  <td className="border p-2 text-center">
                    {item.total.toLocaleString()}
                  </td>
                  <td className="border p-2 text-center">
                    {item.saleType == "NORMAL" && (
                      <div>
                        {(item?.paymentType == "CASH" && "เงินสด") ||
                          (item?.paymentType == "TRANSFER" &&
                            "โอนผ่านธนาคาร") ||
                          (item.paymentType == "ITEMS" && "ชำระเป็นสินค้า")}
                      </div>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    {(item.saleType == "BORROW" && "ยืมสินค้า") ||
                      (item.saleType == "NORMAL" && "ขาย")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
