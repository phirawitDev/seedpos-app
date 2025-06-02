"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import { usePathname } from "next/navigation";
import { Key, ReactNode, useEffect, useState } from "react";

interface SaleData {
  length: number;
  productId: Key | null | undefined;
  price: any;
  quantity: ReactNode;
  productName: ReactNode;
  saleId: number;
  customerName: string;
  createdAt: string;
  saleType: string;
  total: number;
  paymentType: string;
  items: {
    price: number;
    productId: number;
    productName: string;
    quantity: number;
    total: number;
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
    const url = `/api/sale/report/${id}`;
    const headers = getAuthHeaders();

    const res = await axios.get(url, { headers });

    if (res.status == 200) {
      setSaleData(res.data.data);
    }
  };

  return (
    <div>
      <div
        id="print-area"
        className="p-10 bg-white w-[190mm] mx-auto print:p-0 print:shadow-none"
      >
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-2xl">
            {(saleData?.saleType == "NORMAL" && "ใบเสร็จรับเงิน") ||
              (saleData?.saleType == "BORROW" && "ใบยืมสินค้า")}
          </h1>
          <div className="flex flex-col w-full mt-6 gap-2 ">
            <p>รหัสคำสั่งซื้อ: {String(saleData?.saleId).padStart(5, "0")}</p>
            <p>ชื่อลูกค้า: {saleData?.customerName}</p>
            <p>วันที่: {saleData?.createdAt}</p>
          </div>
          <div className="flex flex-col w-full mt-4 gap-2">
            <h1 className="text-xl text-center">รายการสินค้า</h1>
            <table className="table w-full mt-2">
              <thead>
                <tr className="bg-gray-200 border">
                  <th className="text-lg text-center border border-gray-400">
                    ลำดับ
                  </th>
                  <th className="w-[40%] text-lg text-center border border-gray-400">
                    รายการ
                  </th>
                  <th className="text-lg text-center border border-gray-400">
                    จำนวน
                  </th>
                  <th className="text-lg text-center border border-gray-400">
                    ราคาต่อหน่วย
                  </th>
                  <th className="text-lg text-center border border-gray-400">
                    รวมราคาสินค้า
                  </th>
                </tr>
              </thead>
              <tbody className="border border-gray-400">
                {Array.isArray(saleData?.items) &&
                  saleData.items.map((data: SaleData, i: number) => (
                    <tr key={data.productId}>
                      <td className="text-md text-center">{i + 1}</td>
                      <td className="text-md text-left truncate">
                        {data.productName}
                      </td>
                      <td className="text-md text-center">{data.quantity}</td>
                      <td className="text-md text-right">
                        {data.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-md text-right">
                        {data.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                <tr className="border-t border-gray-400">
                  <td colSpan={4} className="text-lg text-right">
                    ยอดรวมสุทธิ
                  </td>
                  <td colSpan={1} className="text-lg text-right">
                    {saleData?.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col w-full mt-4">
            {saleData?.saleType == "NORMAL" && (
              <p className="text-lg text-left">
                ช่องทางการชำระ:{" "}
                {(saleData?.paymentType == "CASH" && "เงินสด") ||
                  (saleData?.paymentType == "TRANSFER" && "โอนผ่านธนาคาร")}
              </p>
            )}
          </div>
          <div className="flex flex-row w-full mt-10 justify-center gap-8 items-center">
            <div className="flex flex-col justify-center items-center gap-2">
              <p className="text-md">
                {(saleData?.saleType == "BORROW" && "ผู้ยืม") ||
                  (saleData?.saleType == "NORMAL" && "ลูกค้า")}
              </p>
              <p>(.........................................................)</p>
              <p>(.............../.............../...............)</p>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
              <p className="text-md">ผู้รับเงิน</p>
              <p>(.........................................................)</p>
              <p>(.............../.............../...............)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
