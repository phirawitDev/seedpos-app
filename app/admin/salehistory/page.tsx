"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHandHolding, FaHandHoldingUsd, FaSearch } from "react-icons/fa";
import { FaHandHoldingHand } from "react-icons/fa6";
import { GrList, GrTransaction } from "react-icons/gr";
import { MdLocalPrintshop } from "react-icons/md";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { SaleHistoryInterface } from "@/app/interface/SaleHistoryInterface";
import Swal from "sweetalert2";

export default function SaleHistoryPage() {
  const [sales, setSales] = useState<SaleHistoryInterface[]>([]);
  const [saleType, setSaleType] = useState("");
  const [startday, setStartDay] = useState("");
  const [endday, setEndDay] = useState("");
  const [type, setType] = useState("");
  const [borrowId, setBorrowId] = useState("");

  const fecthsales = async () => {
    try {
      setSaleType("ALL");

      const url = "/api/salehistory";
      const headers = getAuthHeaders();

      const sales = await axios.get(url, { headers });

      if (sales.status == 200) {
        setSales(sales.data);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  const fetchSalesType = async (item: string) => {
    try {
      const url = `/api/salehistory/search/${item}`;
      const headers = getAuthHeaders();

      const sales = await axios.get(url, { headers });

      if (sales.status == 200) {
        setSales(sales.data);
        setSaleType(item);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  const fetchDay = async () => {
    try {
      const url = `/api/salehistory/search`;
      const headers = getAuthHeaders();
      const payload = {
        startday,
        endday,
        saleType,
      };

      const day = await axios.post(url, payload, { headers });
      if (day.status == 200) {
        setSales(day.data);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  useEffect(() => {
    fecthsales();
  }, []);

  const confirmStatus = async (item: any) => {
    const confirm = await Swal.fire({
      title: "ยืนยันรายการขาย?",
      text: "ยืนยันรายการขายนี้หรือไม่",
      icon: "question",
      showCancelButton: true,
      showConfirmButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-primary w-30 mr-4",
        cancelButton: "btn btn-base-100 w-30",
      },
    });

    if (!confirm.isConfirmed) return;
    try {
      const url = "/api/sale/confirm";
      const headers = getAuthHeaders();
      const payload = {
        id: item.id,
      };

      const res = await axios.post(url, payload, { headers });
      if (res.status == 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ยืนยันการขายเรียบร้อย",
          icon: "success",
        });
        fecthsales();
      }
    } catch (error) {
      return Swal.fire({
        title: "ผิดพลาด!",
        text: "ไม่สามารถยืนยันการขายได้",
        icon: "error",
      });
    }
  };

  const confirmBorrow = async (item: any) => {
    const modal = document.getElementById(
      "modalStock"
    ) as HTMLDialogElement | null;
    modal?.close();

    const confirm = await Swal.fire({
      title: "ยืนยันการคืนสินค้า?",
      text: "ยืนยันรายการคืนสินค้านี้หรือไม่",
      icon: "question",
      showCancelButton: true,
      showConfirmButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-primary w-30 mr-4",
        cancelButton: "btn btn-base-100 w-30",
      },
    });

    if (!confirm.isConfirmed) return;
    try {
      const url = "/api/sale/borrow";
      const headers = getAuthHeaders();
      const payload = {
        id: borrowId,
        borrowtype: type,
      };

      const res = await axios.post(url, payload, { headers });
      if (res.status == 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ยืนยันการคืนสินค้าเรียบร้อย",
          icon: "success",
        });
        fecthsales();
      }
    } catch (error) {
      return Swal.fire({
        title: "ผิดพลาด!",
        text: "ไม่สามารถยืนยันการคืนสินค้าได้",
        icon: "error",
      });
    }
  };

  const handleModal = async (item: any) => {
    setType("ITEMS");
    setBorrowId(item.id);

    const modal = document.getElementById(
      "modalStock"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const handleCloseModal = async () => {
    setType("ITEMS");

    const modal = document.getElementById(
      "modalStock"
    ) as HTMLDialogElement | null;
    modal?.close();
  };

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col md:flex md:flex-row justify-between mt-6 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold">ประวัติการขายสินค้า</h1>
        </div>
        <div className="flex flex-col md:flex-row mt-2 md:mt-0 gap-4">
          <div className="flex flex-row gap-2">
            <button
              onClick={fecthsales}
              className="flex items-center gap-2 btn btn-primary"
            >
              <FaHandHolding />
              ทั้งหมด
            </button>
            <button
              onClick={(e) => fetchSalesType("NORMAL")}
              className="flex items-center gap-2 btn btn-success"
            >
              <FaHandHoldingUsd />
              ขายปกติ
            </button>
            <button
              onClick={(e) => fetchSalesType("BORROW")}
              className="flex items-center gap-2 btn btn-warning"
            >
              <FaHandHoldingHand />
              ยืมสินค้า
            </button>
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-xl"></div>
          <div className="flex flex-row items-center gap-1">
            <input
              type="date"
              onChange={(e) => setStartDay(e.target.value)}
              className="input w-36 md:w-30 focus:outline-0"
            />
            <p>ถึง</p>
            <input
              type="date"
              onChange={(e) => setEndDay(e.target.value)}
              className="input w-36 md:w-30 focus:outline-0"
            />
            <button
              onClick={fetchDay}
              className="flex items-center gap-2 btn btn-primary"
            >
              <FaSearch />
              ค้นหา
            </button>
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-xl"></div>
          <div>
            <button
              onClick={() => {
                window.open(
                  "/report/salehistory",
                  "popupWindow",
                  "width=600,height=800,left=200,top=100"
                );
              }}
              className="hidden md:flex items-center gap-2 btn btn-primary"
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
              <th className="text-center">รหัสคำสั่งซือ</th>
              <th className="text-center">เวลาที่ขายสินค้า</th>
              <th className="text-center">ยอดรวมสุทธิ</th>
              <th className="text-center">ช่องทางการชำระ</th>
              <th className="text-center">ผู้ดำเนินการ</th>
              <th className="text-center">สถานะ</th>
              <th className="text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sales) &&
              sales.map((sale: SaleHistoryInterface, i: number) => (
                <tr key={sale.id} className="hover:bg-base-200">
                  <td className="text-center">
                    {String(sale.id).padStart(5, "0")}
                  </td>
                  <td className="text-center">
                    {sale.createdAt
                      ? format(
                          new Date(sale.createdAt),
                          "dd/MM/yyyy เวลา HH:mm น."
                        )
                      : "N/A"}
                  </td>
                  <td className="text-center">
                    {sale.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-center">
                    {sale?.saleType == "NORMAL" && (
                      <div>
                        {(sale?.paymentType == "CASH" && "เงินสด") ||
                          (sale?.paymentType == "TRANSFER" && "โอนผ่านธนาคาร")}
                      </div>
                    )}
                    {sale?.saleType == "BORROW" &&
                      sale.status == "RETURNED" && (
                        <div>
                          {(sale.paymentType == "ITEMS" && "คืนเป็นสินค้า") ||
                            (sale.paymentType == "CASH" && "คืนเป็นเงิน")}
                        </div>
                      )}
                  </td>
                  <td className="text-center">{sale.users?.name}</td>
                  <td className="text-center">
                    <div>
                      {sale.status == "COMPLETED" && (
                        <button className="btn btn-success w-28">
                          ยืนยันแล้ว
                        </button>
                      )}
                      {sale.status == "RETURNED" && (
                        <button className="btn btn-success w-28">
                          คืนสินค้าแล้ว
                        </button>
                      )}
                      {sale.status == "CANCELED" && (
                        <button className="btn btn-error w-28">
                          ยกเลิกแล้ว
                        </button>
                      )}
                      {(sale.status == "PENDING" && (
                        <div>
                          <button
                            onClick={() => confirmStatus(sale)}
                            className="btn btn-warning w-28"
                          >
                            รอตรวจสอบ
                          </button>
                        </div>
                      )) ||
                        (sale.status == "BORROW" && (
                          <div>
                            <button
                              onClick={(e) => handleModal(sale)}
                              className="btn btn-neutral w-28"
                            >
                              รอคืนสินค้า
                            </button>
                          </div>
                        ))}
                    </div>
                  </td>
                  <td className="text-center flex items-center justify-center">
                    <Link
                      href={`/admin/salehistory/detail/${sale.id}`}
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
      <div className="w-full flex flex-col md:hidden mb-4">
        {Array.isArray(sales) &&
          sales.map((sale: SaleHistoryInterface, i: number) => (
            <div
              key={sale.id}
              className="p-4 mt-2 flex flex-col items-center bg-white rounded-xl shadow border-1 border-gray-200"
            >
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                รหัสคำสั่งซือ: <p>{String(sale.id).padStart(5, "0")}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                เวลาที่ขายสินค้า:{" "}
                <p>
                  {sale.createdAt
                    ? format(
                        new Date(sale.createdAt),
                        "d/MM/yyyy เวลา HH:mm น."
                      )
                    : "N/A"}
                </p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ยอดรวมสุทธิ:{" "}
                <p>
                  {sale.total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ช่องทางการชำระ:{" "}
                <p>
                  {(sale?.paymentType == "CASH" && "เงินสด") ||
                    (sale?.paymentType == "TRANSFER" && "โอนผ่านธนาคาร") ||
                    (sale.paymentType == "ITEMS" &&
                      sale.saleType == "BORROW" &&
                      "คืนเป็นสินค้า") ||
                    (sale.paymentType == "ITEMS" &&
                      sale.saleType == "CASH" &&
                      "คืนเป็นเงิน")}
                </p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ผู้ดำเนินการ: <p>{sale.users?.name}</p>
              </div>
              <div className="mt-2 text-xl items-center flex flex-row w-full gap-5">
                <div className="flex items-center gap-2">
                  {" "}
                  การจัดการ:
                  <div>
                    <Link
                      href={`/admin/salehistory/detail/${sale.id}`}
                      className="text-3xl text-success"
                    >
                      <GrList />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  สถานะ:
                  {sale.status == "COMPLETED" && (
                    <button className="btn btn-success w-28">ยืนยันแล้ว</button>
                  )}
                  {sale.status == "RETURNED" && (
                    <button className="btn btn-success w-28">
                      คืนสินค้าแล้ว
                    </button>
                  )}
                  {sale.status == "CANCELED" && (
                    <button className="btn btn-error w-28">ยกเลิกแล้ว</button>
                  )}
                  {(sale.status == "PENDING" && (
                    <div>
                      <button
                        onClick={() => confirmStatus(sale)}
                        className="btn btn-warning w-28"
                      >
                        รอตรวจสอบ
                      </button>
                    </div>
                  )) ||
                    (sale.status == "BORROW" && (
                      <div>
                        <button
                          onClick={(e) => handleModal(sale)}
                          className="btn btn-neutral w-28"
                        >
                          รอคืนสินค้า
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
      </div>
      <dialog id="modalStock" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ยืนยันรายการคืนสินค้า</h3>
          <form autoComplete="off">
            <div className="flex flex-col mt-2 gap-2">
              <div className="flex flex-row mb-2 w-full justify-between items-center">
                <a
                  onClick={(e) => setType("ITEMS")}
                  className={`btn w-1/2 h-14 text-xl justify-center flex items-center ${
                    type === "ITEMS"
                      ? "bg-primary text-base-100"
                      : "bg-gray-200 "
                  }`}
                >
                  คืนเป็นสินค้า
                </a>
                <a
                  onClick={(e) => setType("CASH")}
                  className={`btn w-1/2 h-14 text-xl justify-center flex items-center ${
                    type === "CASH"
                      ? "bg-primary text-base-100"
                      : "bg-gray-200 "
                  }`}
                >
                  คืนเป็นเงิน
                </a>
              </div>
            </div>
          </form>

          <div className="modal-action">
            <button onClick={confirmBorrow} className="btn btn-primary">
              ยืนยัน
            </button>
            <button onClick={handleCloseModal} className="btn">
              ยกเลิก
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
