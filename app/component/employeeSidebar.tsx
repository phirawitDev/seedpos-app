"use client";

import Swal from "sweetalert2";
import { Config } from "../config";
import { useRouter } from "next/navigation";
import {
  MdLogout,
  MdPointOfSale,
  MdBarChart,
  MdHistory,
  MdInventory,
  MdEditNote,
  MdPeopleAlt,
  MdManageAccounts,
  MdOutlineSearch,
} from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TokenPayload } from "@/app/interface/TokenPayloadInterface";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAuthHeaders } from "./Headers";
import axios from "axios";

interface employeeinfo {
  name: string;
  role: string;
}

export default function Sidebar() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const url = usePathname();
  const pathname = url.split("/")[2];
  const [employeeinfo, setEmployeeinfo] = useState<employeeinfo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchEmployeeInfo = async () => {
    try {
      const headers = getAuthHeaders();

      const employeeinfo = await axios.get("/api/users/info", { headers });
      setEmployeeinfo(employeeinfo.data);
    } catch {
      return;
    }
  };

  useEffect(() => {
    fetchEmployeeInfo();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem(Config.tokenName);

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem(Config.tokenName);
        router.replace("/");
        return;
      }

      if (decoded.role !== "EMPLOYEE") {
        router.replace("/");
        return;
      }

      setIsReady(true);
    } catch {
      router.replace("/");
    }
  }, []);
  if (!isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    const button = await Swal.fire({
      title: "ออกจากระบบ",
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: "question",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "ใช่, ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "btn btn-primary mr-2",
        cancelButton: "btn btn-base-100",
      },
      buttonsStyling: false,
    });

    if (button.isConfirmed) {
      localStorage.removeItem(Config.tokenName);
      router.push("/");
    }
  };

  return (
    <>
      <div className="flex p-4 h-16 w-full items-center justify-between bg-white shadow fixed top-0  z-20">
        <div className="flex flex-row">
          <h1 className="text-2xl text-neutral font-bold mr-10">
            ทิพย์รุ่งโรจน์การเกษตร
          </h1>
          <div className="hidden xl:flex items-center bg-white border border-gray-300 rounded-xl">
            <form autoComplete="off">
              <input
                className="w-[350px] px-2 py-2 bg-white rounded-xl focus:outline-none"
                placeholder="Search.... "
              />
            </form>
            <button>
              <MdOutlineSearch className="text-2xl text-gray-300 mr-2" />
            </button>
          </div>
        </div>
        <div className="right-0 flex gap-3 items-center">
          {/* <button className="text-2xl">
            <FaBell />
          </button> */}
          <button
            className="xl:hidden text-2xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            &#9776;
          </button>
        </div>
      </div>
      <div className="hidden xl:flex mt-16 w-60 h-screen fixed bg-neutral">
        <div className="flex flex-col w-full">
          <div className="flex flex-col gap-4 mt-5 p-4 justify-center ">
            <Link
              className={`flex items-center gap-2 text-xl ${
                pathname.includes("pos")
                  ? "text-neutral bg-gray-200 scale-125 ml-8 pl-2 py-1 rounded-l-xl z-0"
                  : "text-white hover:scale-105 hover:transition"
              }`}
              href="/employee/pos"
            >
              <MdPointOfSale />
              <span>หน้าขาย</span>
            </Link>
            <Link
              className={`flex items-center gap-2 text-xl ${
                pathname.includes("salehistory")
                  ? "text-neutral bg-gray-200 scale-125 ml-8 pl-2 py-1 rounded-l-xl z-0"
                  : "text-white hover:scale-105 hover:transition"
              }`}
              href="/employee/salehistory"
            >
              <MdHistory />
              <span>ประวัติการขาย</span>
            </Link>
            <Link
              className={`flex items-center gap-2 text-xl ${
                pathname.includes("stock")
                  ? "text-neutral bg-gray-200 scale-125 ml-8 pl-2 py-1 rounded-l-xl z-0"
                  : "text-white hover:scale-105 hover:transition"
              }`}
              href="/employee/stock"
            >
              <MdInventory />
              <span>คลังสินค้า</span>
            </Link>
            <Link
              className={`flex items-center gap-2 text-xl ${
                pathname.includes("customer")
                  ? "text-neutral bg-gray-200 scale-125 ml-8 pl-2 py-1 rounded-l-xl z-0"
                  : "text-white hover:scale-105 hover:transition"
              }`}
              href="/employee/customer"
            >
              <MdPeopleAlt />
              <span>จัดการสมาชิก</span>
            </Link>
          </div>
          <div className="flex flex-col w-60 bottom-0 left-0 fixed h-1/4 justify-center items-center">
            {employeeinfo && (
              <div className="flex flex-col justify-center items-center">
                <div className="flex flex-col">
                  <p className="text-lg mb-1 text-base-100">
                    {employeeinfo.name}
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <p className="text-sm text-base-100">สิทธิ์การใช้งาน: </p>
                  <p className="text-sm text-base-100">{employeeinfo.role}</p>
                </div>
              </div>
            )}
            <button onClick={handleSignOut} className="btn btn-error mt-4">
              <MdLogout className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
      <div
        className={`fixed xl:hidden top-0 left-0 h-full w-60 bg-neutral z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col w-full mt-16">
          {/* เมนูเดิมทั้งหมด วางไว้เหมือนเดิมได้เลย */}
          {/* ... */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex flex-col gap-4 p-4 justify-center ">
            <Link
              className={`flex items-center gap-2 text-xl ${
                pathname.includes("pos")
                  ? "text-neutral bg-gray-200 scale-110 ml-8 pl-2 py-1 rounded-l-xl z-0"
                  : "text-white hover:scale-105 hover:transition"
              }`}
              href="/employee/pos"
            >
              <MdPointOfSale />
              <span>หน้าขาย</span>
            </Link>
            <Link
              className={`flex items-center gap-2 text-xl ${
                pathname.includes("salehistory")
                  ? "text-neutral bg-gray-200 scale-110 ml-8 pl-2 py-1 rounded-l-xl z-0"
                  : "text-white hover:scale-105 hover:transition"
              }`}
              href="/employee/salehistory"
            >
              <MdHistory />
              <span>ประวัติการขาย</span>
            </Link>
            <Link
              className={`flex items-center gap-2 text-xl ${
                pathname.includes("stock")
                  ? "text-neutral bg-gray-200 scale-110 ml-8 pl-2 py-1 rounded-l-xl z-0"
                  : "text-white hover:scale-105 hover:transition"
              }`}
              href="/employee/stock"
            >
              <MdInventory />
              <span>คลังสินค้า</span>
            </Link>
            <Link
              className={`flex items-center gap-2 text-xl ${
                pathname.includes("customer")
                  ? "text-neutral bg-gray-200 scale-110 ml-8 pl-2 py-1 rounded-l-xl z-0"
                  : "text-white hover:scale-105 hover:transition"
              }`}
              href="/employee/customer"
            >
              <MdPeopleAlt />
              <span>จัดการสมาชิก</span>
            </Link>
          </div>
          <div className="flex flex-col w-60 bottom-0 left-0 fixed h-1/4 justify-center items-center">
            {employeeinfo && (
              <div className="flex flex-col justify-center items-center">
                <div className="flex flex-col">
                  <p className="text-lg mb-1 text-base-100">
                    {employeeinfo.name}
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <p className="text-sm text-base-100">สิทธิ์การใช้งาน: </p>
                  <p className="text-sm text-base-100">{employeeinfo.role}</p>
                </div>
              </div>
            )}
            <button onClick={handleSignOut} className="btn btn-error mt-4">
              <MdLogout className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
