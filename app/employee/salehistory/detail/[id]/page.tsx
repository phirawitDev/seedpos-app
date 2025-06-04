"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import { SaleDetailInterface } from "@/app/interface/SaleDetailInterface";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MdEditSquare, MdLocalPrintshop } from "react-icons/md";
import { FaCircleXmark } from "react-icons/fa6";
import Swal from "sweetalert2";
import Link from "next/link";

export default function saleDetailPage() {
  const url = usePathname();
  const id = url.split("/")[4];
  const [saleDetail, setSaleDetail] = useState<SaleDetailInterface>();

  const fetchSaleDetail = async () => {
    try {
      const url = `/api/salehistory/${id}`;
      const headers = getAuthHeaders();

      const saledetail = await axios.get(url, { headers });

      if (saledetail.status == 200) {
        setSaleDetail(saledetail.data);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  useEffect(() => {
    fetchSaleDetail();

    const interval = setInterval(() => {
      fetchSaleDetail();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (item: any) => {
    const confirm = await Swal.fire({
      title: "ยกเลิกรายการขาย?",
      text: "ยกเลิกรายการขายนี้หรือไม่",
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
      const url = "/api/sale/cancel";
      const headers = getAuthHeaders();
      const payload = {
        id: id,
      };

      const res = await axios.post(url, payload, { headers });
      if (res.status == 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ยกเลิกการขายเรียบร้อย",
          icon: "success",
        });
        fetchSaleDetail();
      }
    } catch (error) {
      return Swal.fire({
        title: "ผิดพลาด!",
        text: "ไม่สามารถยกเลิกรายการขายได้",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col md:flex md:flex-row justify-between mt-6 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold">รายละเอียดคำสั่งซื้อ</h1>
        </div>
        <div className="flex gap-2">
          <div>
            <button
              onClick={() => {
                window.open(
                  `/report/pos-sale/${id}`,
                  "popupWindow",
                  "width=600,height=800,left=200,top=100"
                );
              }}
              className="hidden md:flex items-center gap-2 btn btn-primary"
            >
              <MdLocalPrintshop />
              พิมพ์ใบเสร็จ
            </button>
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-xl"></div>
          <div>
            {saleDetail?.status == "BORROW" && (
              <div className="flex gap-2">
                <Link
                  href={`/admin/salehistory/edit/${id}`}
                  className="flex items-center gap-2 btn btn-warning"
                >
                  <MdEditSquare />
                  แก้ไขคำสั่งซื้อ
                </Link>
                <button
                  onClick={handleCancel}
                  className="hidden md:flex items-center gap-2 btn btn-error"
                >
                  <FaCircleXmark />
                  ยกเลิกรายการ
                </button>
              </div>
            )}

            {saleDetail?.status == "PENDING" && (
              <div className="flex gap-2">
                <Link
                  href={`/admin/salehistory/edit/${id}`}
                  className="flex items-center gap-2 btn btn-warning"
                >
                  <MdEditSquare />
                  แก้ไขคำสั่งซื้อ
                </Link>
                <button
                  onClick={handleCancel}
                  className="hidden md:flex items-center gap-2 btn btn-error"
                >
                  <FaCircleXmark />
                  ยกเลิกรายการ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-between card mt-6 p-5 w-full bg-base-100 shadow">
        <div className="">
          <p className="text-2xl">
            รหัสคำสั่งซื้อ: {String(saleDetail?.id).padStart(5, "0")}
          </p>
          <p className="text-lg">
            วันที่:{" "}
            {saleDetail?.createdAt
              ? format(
                  new Date(saleDetail.createdAt),
                  "dd/MM/yyyy เวลา HH:mm น."
                )
              : "N/A"}
          </p>
          <p className="text-lg">ลูกค้า: {saleDetail?.customerName}</p>
          <p className="text-lg">
            ยอดรวมสุทธิ:{" "}
            {saleDetail?.total.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}{" "}
            ฿
          </p>
          <p className="text-lg">
            วิธีการชำระเงิน:{" "}
            {saleDetail?.saleType == "NORMAL" && (
              <div>
                {(saleDetail?.paymentType == "CASH" && "เงินสด") ||
                  (saleDetail?.paymentType == "TRANSFER" && "โอนผ่านธนาคาร")}
              </div>
            )}
            {saleDetail?.saleType == "BORROW" &&
              saleDetail.status == "RETURNED" && (
                <div>
                  {(saleDetail.paymentType == "ITEMS" && "คืนเป็นสินค้า") ||
                    (saleDetail.paymentType == "CASH" && "คืนเป็นเงิน")}
                </div>
              )}
          </p>
          <p className="text-lg">พนักงานขาย: {saleDetail?.userName}</p>
          {saleDetail?.paymentType == "TRANSFER" && (
            <div>
              <button
                className="btn btn-primary mt-2"
                onClick={() => {
                  const modal = document.getElementById(
                    "slip"
                  ) as HTMLDialogElement | null;
                  if (modal) {
                    modal.showModal();
                  } else {
                    console.error("slip not found");
                  }
                }}
              >
                แสดงหลักฐานการโอนเงิน
              </button>
              <dialog id="slip" className="modal">
                <div className="modal-box">
                  <div className="modal-action flex flex-row items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">หลักฐานการโอนเงิน</h3>
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button className="btn">X</button>
                    </form>
                  </div>
                  <img src={`${saleDetail.slipImg}`} alt="" />
                </div>
              </dialog>
            </div>
          )}
        </div>
        <div className="flex p-2 md:p-10 items-center justify-center">
          <h1 className="text-2xl md:text-4xl">
            {(saleDetail?.saleType == "NORMAL" && "ขายหน้าร้าน") ||
              (saleDetail?.saleType == "BORROW" && "ยืมสินค้า")}
          </h1>
        </div>
      </div>
      <div className="hidden md:flex card mt-6 p-2 w-full bg-base-100 shadow">
        <h1 className="mt-4 text-2xl font-bold">รายการสินค้า</h1>
        <table className="w-full mt-2">
          <thead>
            <tr>
              <th className="text-xl border-b-1 p-4 w-[40%]">ชื่อสินค้า</th>
              <th className="text-xl border-b-1 p-4 w-[20%] text-right">
                ราคาขายต่อหน่วย
              </th>
              <th className="text-xl border-b-1 p-4 w-[20%] text-right">
                จำนวน
              </th>
              <th className="text-xl border-b-1 p-4 w-[20%] text-right">
                ยอดรวมสุทธิ
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(saleDetail?.items) &&
              saleDetail.items.map((item: any) => (
                <tr key={item.productId} className="hover:bg-gray-200">
                  <td className="w-[40%] text-left text-xl p-4">
                    {item.productName}
                  </td>
                  <td className="w-[20%] text-right text-xl p-4">
                    {item.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="w-[20%] text-xl p-4 text-right">
                    {item.quantity}
                  </td>
                  <td className="w-[20%] text-right text-xl p-4">
                    {(item.quantity * item.price).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ฿
                  </td>
                </tr>
              ))}
            <tr className="hover:bg-gray-200">
              <td colSpan={3} className="text-2xl p-4 text-right">
                ยอดรวมสุทธิ
              </td>
              <td className="text-2xl p-4 text-right">
                {saleDetail?.total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                ฿
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="w-full flex flex-col md:hidden mb-4">
        <h1 className="mt-4 text-2xl font-bold">รายการสินค้า</h1>
        {Array.isArray(saleDetail?.items) &&
          saleDetail?.items.map((item: any, i: number) => (
            <div
              key={item.productId}
              className="p-4 mt-2 flex flex-col items-center bg-white rounded-xl"
            >
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ชื่อสินค้า: <p>{item.productName}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ราคาขายต่อหน่วย:{" "}
                <p>
                  {item.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                จำนวน: <p>{item.quantity}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ยอดรวมสุทธิ:{" "}
                <p>
                  {(item.quantity * item.price).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ฿
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
