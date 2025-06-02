"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import { useEffect, useState } from "react";

interface StockReport {
  id: number;
  name: string;
  totalIn: number;
  totalOut: number;
  remain: number;
  totalValue: number;
  carryOver: number;
  change: number;
}
export default function StockReportPage() {
  const [stockData, setStockData] = useState<StockReport[]>([]);
  useEffect(() => {
    fecthreport();
  }, []);

  useEffect(() => {
    if (stockData && stockData.length > 0) {
      setTimeout(() => {
        window.print();
      }, 500);
      window.onafterprint = () => {
        window.close();
      };
    }
  }, [stockData]);

  const fecthreport = async () => {
    const url = "/api/stock/daily-report";
    const headers = getAuthHeaders();

    const res = await axios.get(url, { headers });

    if (res.status == 200) {
      setStockData(res.data);
    }
  };

  const thaiDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="">
        <div
          id="print-area"
          className="p-10 bg-white w-[190mm] mx-auto print:p-0 print:shadow-none"
        >
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h1 className="text-2xl font-bold">ทิพย์รุ่งโรจน์การเกษตร</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                รายงานสรุปยอดสินค้าคงเหลือ
              </p>
              <p className="text-md font-semibold">{thaiDate}</p>
            </div>
          </div>

          <table className="w-full border border-gray-800 text-sm">
            <thead>
              <tr className="bg-gray-300">
                <th className="border p-2">รหัสสินค้า</th>
                <th className="border p-2 w-[30%]">สินค้า</th>
                <th className="border p-2">ยอดยกมา</th>
                <th className="border p-2">รับเข้า</th>
                <th className="border p-2">จ่ายออก</th>
                <th className="border p-2">เปลี่ยนแปลง</th>
                <th className="border p-2">คงเหลือ</th>
              </tr>
            </thead>
            <tbody>
              {stockData?.map((item) => (
                <tr key={item.id}>
                  <td className="border p-2 text-center">
                    {String(item.id).padStart(4, "0")}
                  </td>
                  <td className="border p-2 truncate">{item.name}</td>
                  <td className="border p-2 text-center">
                    {item.carryOver.toLocaleString()}
                  </td>
                  <td className="border p-2 text-center">
                    {item.totalIn.toLocaleString()}
                  </td>
                  <td className="border p-2 text-center">
                    {item.totalOut.toLocaleString()}
                  </td>
                  <td className="border p-2 text-center">
                    {item.change.toLocaleString()}
                  </td>
                  <td className="border p-2 text-center">
                    {item.remain.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
