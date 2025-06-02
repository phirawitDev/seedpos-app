"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import { StockInterface } from "@/app/interface/StockInterface";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GrList, GrTransaction } from "react-icons/gr";
import { MdLocalPrintshop } from "react-icons/md";
import Swal from "sweetalert2";

export default function StockPage() {
  const [stock, setStock] = useState<StockInterface | null>(null);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const fectStock = async () => {
    const url = "/api/stock";
    const headers = getAuthHeaders();

    const stock = await axios.get(url, { headers });

    if (stock.status === 200) {
      setStock(stock.data);
    }
  };

  useEffect(() => {
    fectStock();

    const interval = setInterval(() => {
      fectStock();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleModal = async (stock: StockInterface) => {
    setProductId(String(stock.id));
    setType("IN");

    const modal = document.getElementById(
      "modalStock"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const handleCloseModal = async () => {
    setProductId("");
    setType("IN");
    setQuantity("");
    setNote("");

    const modal = document.getElementById(
      "modalStock"
    ) as HTMLDialogElement | null;
    modal?.close();
  };

  const handleStock = async () => {
    try {
      if (parseInt(quantity) < 1 || quantity == "") {
        Swal.fire({
          title: "ผิดพลาด!",
          text: "กรุณาระบุจำนวนสินค้ามากกว่า 1",
          icon: "warning",
        });
        const modal = document.getElementById(
          "modalStock"
        ) as HTMLDialogElement | null;
        modal?.close();
        return;
      }
      const url = "/api/stock/pending";
      const headers = getAuthHeaders();
      const payload = {
        productId,
        type,
        quantity,
        note,
      };

      const stock = await axios.post(url, payload, { headers });

      if (stock.status === 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "เพิ่มรายการเดินสินค้าสำเร็จ",
          icon: "success",
        });
        setProductId("");
        setType("IN");
        setQuantity("");
        setNote("");
        fectStock();
        const modal = document.getElementById(
          "modalStock"
        ) as HTMLDialogElement | null;
        modal?.close();
      }
    } catch (error) {
      const e = error as Error;
      Swal.fire({
        title: "ผิดพลาด!",
        text: e + "ไม่สามารถเพิ่มรายการเดินสินค้าได้",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col md:flex md:flex-row justify-between mt-6 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold">จัดการคลังสินค้า</h1>
        </div>
        <div className="flex flex-row gap-4 mt-4 md:mt-0">
          {/* <form autoComplete="off">
            <label className="input">
              <svg
                className="h-[1em] opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                autoComplete="asdasdasdasd"
                // onChange={(e) => handleSearch(e.target.value)}
                type="search"
                placeholder="Search......"
              />
            </label>
          </form> */}
          <div className="flex items-center bg-white border border-gray-300 rounded-xl"></div>
          <div>
            <button
              onClick={() => {
                window.open(
                  "/report/stock-report",
                  "popupWindow",
                  "width=600,height=800,left=200,top=100"
                );
              }}
              className="flex items-center gap-2 btn btn-primary text-nowrap"
            >
              <MdLocalPrintshop />
              พิมพ์ใบสรุปยอดรายวัน
            </button>
          </div>
        </div>
      </div>
      <div className="hidden md:flex card mt-6 p-2 w-full bg-base-100 shadow">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th className="text-center">รหัสสินค้า</th>
              <th className="text-center w-[35%]">ชื่อสินค้า</th>
              <th className="text-center">คงเหลือ</th>
              <th className="text-center">ผู้ดำเนินการล่าสุด</th>
              <th className="text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {Array.isArray(stock) &&
              stock.map((stock: StockInterface, i: number) => (
                <tr key={stock.id} className="hover:bg-base-200">
                  <td className="text-center">
                    {String(stock.id).padStart(4, "0")}
                  </td>
                  <td className="text-left">{stock.name}</td>
                  <td className="text-center">
                    {stock.stock.toLocaleString("en-US")}
                  </td>
                  <td className="text-center">
                    {stock.history[0]?.usersName ?? "ไม่ทราบผู้ทำรายการ"}
                  </td>
                  <td className="text-center flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        handleModal(stock);
                      }}
                      className="text-3xl text-yellow-400 mr-2"
                    >
                      <GrTransaction />
                    </button>
                    <Link
                      href={`/employee/stock/transaction/${stock.id}`}
                      className="text-3xl text-success"
                    >
                      <GrList />
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <dialog id="modalStock" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">เพิ่มรายการเดินสินค้า</h3>
          <form autoComplete="off">
            <div className="flex flex-col mt-2 gap-2">
              <div className="flex flex-row mb-2 w-full justify-between items-center">
                <a
                  onClick={(e) => setType("IN")}
                  className={`btn w-1/2 h-14 text-xl justify-center flex items-center ${
                    type === "IN" ? "bg-primary text-base-100" : "bg-gray-200 "
                  }`}
                >
                  รับเข้า
                </a>
                <a
                  onClick={(e) => setType("OUT")}
                  className={`btn w-1/2 h-14 text-xl justify-center flex items-center ${
                    type === "OUT" ? "bg-primary text-base-100" : "bg-gray-200 "
                  }`}
                >
                  จ่ายออก
                </a>
              </div>
              <div className="flex items-center">
                <p className="w-40">จำนวน :</p>
                <input
                  type="number"
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="กรอกจำนวนสินค้า....."
                  value={quantity}
                  className="input w-full focus:outline-0"
                />
              </div>
              <div className="flex items-center">
                <p className="w-40">หมายเหตุ :</p>
                <textarea
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="กรอกหมายเหตุ....."
                  value={note}
                  className="input w-full h-32 focus:outline-0"
                />
              </div>
            </div>
          </form>

          <div className="modal-action">
            <button onClick={handleStock} className="btn btn-primary">
              ยืนยัน
            </button>
            <button onClick={handleCloseModal} className="btn">
              ยกเลิก
            </button>
          </div>
        </div>
      </dialog>
      <div className="w-full flex flex-col md:hidden my-4">
        {Array.isArray(stock) &&
          stock.map((stock: StockInterface, i: number) => (
            <div
              key={stock.id}
              className="p-4 mt-2 flex flex-col items-center bg-white rounded-xl shadow border-1 border-gray-200"
            >
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                รหัสสินค้า: <p>{String(stock.id).padStart(4, "0")}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ชื่อสินค้า: <p>{stock.name}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                คงเหลือ: <p>{stock.stock.toLocaleString("en-US")}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ผู้ดำเนินการล่าสุด:{" "}
                <p>{stock.history[0]?.usersName ?? "ไม่ทราบผู้ทำรายการ"}</p>
              </div>
              <div className="mt-2 text-xl items-center flex flex-row w-full gap-4">
                การจัดการ:
                <button
                  onClick={(e) => {
                    handleModal(stock);
                  }}
                  className="text-3xl text-yellow-400 mr-2"
                >
                  <GrTransaction />
                </button>
                <Link
                  href={`/employee/stock/transaction/${stock.id}`}
                  className="text-3xl text-success"
                >
                  <GrList />
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
