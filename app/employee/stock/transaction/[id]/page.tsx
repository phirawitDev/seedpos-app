"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import { StockTarnsactionInterface } from "@/app/interface/StockTarnsactionInterface";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function transactionPage() {
  const url = usePathname();
  const id = url.split("/")[4];
  const [stock, setStock] = useState<StockTarnsactionInterface[]>([]);
  const [name, setName] = useState("");

  const fetchTransaction = async () => {
    const url = `/api/stock/transaction/${id}`;
    const headers = getAuthHeaders();

    const transaction = await axios.get(url, { headers });
    if (transaction.status == 200) {
      setStock(transaction.data);
      setName(transaction.data[0].product.name);
    }
    try {
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, []);

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col md:flex md:flex-row justify-between mt-6 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold">รายการเดินสินค้า: {name}</h1>
        </div>
      </div>

      <div className="hidden md:flex card mt-6 p-2 w-full bg-base-100 shadow">
        <table className="table">
          <thead>
            <tr>
              <th className="text-center">วันที่</th>
              <th className="text-center">ประเภทรายการ</th>
              <th className="text-center">จำนวน</th>
              <th className="text-center">หมายเหตุ</th>
              <th className="text-center">ผู้ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(stock) &&
              stock.map((stock: StockTarnsactionInterface, i: number) => (
                <tr
                  key={stock.id}
                  className={`hover:bg-gray-200 ${
                    stock.type == "IN" ? "bg-green-200" : "bg-red-200"
                  }`}
                >
                  <td className="text-center">
                    {stock.createdAt
                      ? format(
                          new Date(stock.createdAt),
                          "วันที่ d/MM/yyyy เวลา HH:mm น.",
                          { locale: th }
                        )
                      : "N/A"}
                  </td>
                  <td className="text-center">{stock.type}</td>
                  <td className="text-center">
                    {stock.quantity.toLocaleString("en-US")}
                  </td>
                  <td className="text-center">{stock.note}</td>
                  <td className="text-center flex items-center justify-center">
                    {stock.users.name ?? "ไม่ทราบผู้ทำรายการ"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="w-full flex flex-col md:hidden my-4">
        {Array.isArray(stock) &&
          stock.map((stock: StockTarnsactionInterface, i: number) => (
            <div
              key={stock.id}
              className={`p-4 mt-2 flex flex-col items-center rounded-xl shadow border-1 border-gray-200 ${
                stock.type == "IN" ? "bg-green-200" : "bg-red-200"
              }`}
            >
              <div className="flex flex-row w-full gap-2 mt-2 text-xl border-b-1 border-gray-200 truncate">
                วันที่:{" "}
                <p>
                  {stock.createdAt
                    ? format(
                        new Date(stock.createdAt),
                        "วันที่ d/MM/yyyy เวลา HH:mm น.",
                        { locale: th }
                      )
                    : "N/A"}
                </p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ประเภทรายการ: <p>{stock.type}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                จำนวน: <p>{stock.quantity.toLocaleString("en-US")}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                หมายเหตุ: <p>{stock.note}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ผู้ดำเนินการล่าสุด:{" "}
                <p>{stock.users.name ?? "ไม่ทราบผู้ทำรายการ"}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
