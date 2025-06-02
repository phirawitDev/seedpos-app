"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { TbXboxXFilled } from "react-icons/tb";
import Swal from "sweetalert2";

interface pending {
  id: number;
  users: {
    name: string;
    id: number;
  };
  product: {
    name: string;
    id: number;
    category: {
      name: string;
    };
  };
  quantity: number;
  type: string;
}

export default function DashboardPage() {
  const [saletoday, setSaletoday] = useState<number>();
  const [saletotal, setSaleTotal] = useState<number>();
  const [pangingTotal, setPangingTotal] = useState<number>();
  const [pending, setPending] = useState<pending>();

  const fetchDashboard = async () => {
    const url = "/api/dashboard";
    const headers = getAuthHeaders();

    const dashboard = await axios.get(url, { headers });
    if (dashboard.status == 200) {
      setSaleTotal(dashboard.data.saletotal);
      setSaletoday(dashboard.data.saletoday);
      setPangingTotal(dashboard.data.pangingtotal);
      setPending(dashboard.data.pending);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const pendingConfirm = async (id: number) => {
    const confirm = await Swal.fire({
      title: "ยืนยันรายการ?",
      text: "ยืนยันรายการคำขอปรับยอดสินค้านี้หรือไม่",
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
      const url = "/api/pending";
      const headers = getAuthHeaders();
      const payload = {
        type: "confirm",
        id: id,
      };
      const confirm = await axios.post(url, payload, { headers });

      if (confirm.status == 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ดำเนินการคำขอปรับยอดสินค้าสำเร็จ",
          icon: "success",
        });
        fetchDashboard();
      }
    } catch (error) {
      return Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดำเนินการคำขอปรับยอดสินค้าได้",
        icon: "error",
      });
    }
  };

  const pendingCancel = async (id: number) => {
    const confirm = await Swal.fire({
      title: "ยกเลิกรายการ?",
      text: "ยกเลิกรายการขอปรับสินค้านี้หรือไม่",
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
      const url = "/api/pending";
      const headers = getAuthHeaders();
      const payload = {
        type: "cancel",
        id: id,
      };
      const confirm = await axios.post(url, payload, { headers });

      if (confirm.status == 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ยกเลิกรายการขอปรับยอดสินค้าสำเร็จ",
          icon: "success",
        });
        fetchDashboard();
      }
    } catch (error) {
      return Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดำเนินการยกเลิกได้",
        icon: "error",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col w-full px-2 md:px-0">
        <h1 className="text-4xl mt-4 md:mt-0">รายงานสรุปยอดขาย</h1>
        <div className="mt-6 rounded-2xl grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="flex flex-col items-center bg-base-100 py-6 rounded-2xl border-1 border-gray-300">
            <p className="text-2xl">ยอดขายวันนี้</p>
            <p className="mt-2 text-3xl text-success">
              {saletotal?.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
              บาท
            </p>
          </div>
          <div className="flex flex-col items-center bg-base-100 py-6 rounded-2xl border-1 border-gray-300">
            <p className="text-2xl">รายการขายวันนี้</p>
            <p className="mt-2 text-3xl text-success">
              {saletoday?.toLocaleString("en-US")} รายการ
            </p>
          </div>
          <div className="flex flex-col items-center bg-base-100 py-6 rounded-2xl border-1 border-gray-300">
            <p className="text-2xl">รายการขอปรับสต็อก</p>
            <p className="mt-2 text-3xl text-warning">
              {pangingTotal?.toLocaleString("en-US")} รายการ
            </p>
          </div>
        </div>
        <div className="hidden md:flex w-full mt-6 card bg-base-100 p-4">
          <h1 className="text-2xl">รายการขอปรับสต๊อกสินค้า</h1>
          <div className="flex flex-col w-full mt-4">
            <table className="table">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-[40%] text-center text-lg">ชื่อสินค้า</th>
                  <th className="text-center text-lg">ผู้ขอดำเนินการ</th>
                  <th className="text-center text-lg">จำนวน</th>
                  <th className="text-center text-lg">ประเภท</th>
                  <th className="text-center text-lg">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(pending) &&
                  pending.map((item: pending, i: number) => (
                    <tr key={item.id} className="hover:bg-gray-200">
                      <td className="text-md ">{item.product.name}</td>
                      <td className="text-md text-center">{item.users.name}</td>
                      <td className="text-md text-center">
                        {item.quantity.toLocaleString("en-US")}
                      </td>
                      <td className="text-md text-center">{item.type}</td>
                      <td className="text-md text-center">
                        <button
                          onClick={(e) => {
                            pendingConfirm(item.id);
                          }}
                          className="btn btn-success text-lg mr-2"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={(e) => {
                            pendingCancel(item.id);
                          }}
                          className="btn btn-error text-lg"
                        >
                          <TbXboxXFilled />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!Array.isArray(pending) ||
              (!pending.length && (
                <div className="flex w-full p-10 justify-center items-center">
                  <h1 className="text-center text-xl">
                    ไม่มีรายการขอปรับสต็อกสินค้า
                  </h1>
                </div>
              ))}
          </div>
        </div>
        <div className="w-full flex flex-col md:hidden my-4">
          <h1 className="text-2xl">รายการขอปรับสต๊อกสินค้า</h1>
          {Array.isArray(pending) &&
            pending.map((item: pending, i: number) => (
              <div
                key={item.id}
                className="p-4 mt-2 flex flex-col items-center bg-white rounded-xl shadow border-1 border-gray-200"
              >
                <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                  ชื่อสินค้า: <p>{item.product.name}</p>
                </div>
                <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                  ผู้ขอดำเนินการ: <p>{item.users.name}</p>
                </div>
                <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                  จำนวน: <p>{item.quantity.toLocaleString("en-US")}</p>
                </div>
                <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                  ประเภท: <p>{item.type}</p>
                </div>
                <div className="mt-2 text-xl items-center flex flex-row w-full gap-5">
                  การจัดการ:
                  <div>
                    <button
                      onClick={(e) => {
                        pendingConfirm(item.id);
                      }}
                      className="btn btn-success text-lg mr-2"
                    >
                      <FaCheckCircle />
                    </button>
                    <button
                      onClick={(e) => {
                        pendingCancel(item.id);
                      }}
                      className="btn btn-error text-lg"
                    >
                      <TbXboxXFilled />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
