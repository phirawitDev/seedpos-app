"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Config } from "./config";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: string;
  name: string;
  role: string;
}

const Page = () => {
  const [isReady, setIsReady] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(Config.tokenName);
    if (!token) {
      setIsReady(true);
      return;
    }

    try {
      const decoded: TokenPayload = jwtDecode(token);
      const role = decoded.role;

      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "EMPLOYEE") {
        router.push("/employee/pos");
      }
    } catch (err) {
      console.error("Token parsing failed:", err);
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  const handleSignIn = async () => {
    if (username == "" && password == "") {
      Swal.fire({
        title: "กรุณากรอกข้อมูล",
        text: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน...",
        icon: "error",
      });
      return;
    } else if (username == "") {
      Swal.fire({
        title: "กรุณากรอกชื่อผู้ใช้งาน",
        icon: "warning",
      });
      return;
    } else if (password == "") {
      Swal.fire({
        title: "กรุณากรอกรหัสผ่าน",
        icon: "warning",
      });
      return;
    }

    try {
      const url = "/api/login";
      const payload = {
        username: username,
        password: password,
      };

      const result = await axios.post(url, payload);

      if (result.data.token != null) {
        localStorage.setItem(Config.tokenName, result.data.token);
        if ((result.data.user.role = "ADMIN")) {
          router.push("/admin/dashboard");
        } else if ((result.data.user.role = "EMPLOYEE")) {
          router.push("/employee/pos");
        }
      }
    } catch {
      Swal.fire({
        title: "ไม่สามารถเข้าสู่ระบบได้",
        text: "ชื่อผู้ใช้งานหรือรหัสผ่านผิดโปรดลองอีกครั้ง...",
        icon: "error",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex md:hidden items-center justify-center">
        <div className="min-h-screen w-full flex justify-center bg-gray-100">
          <div className="w-full flex flex-col justify-center text-center">
            <h1 className="text-5xl text-blue-700">ทิพย์รุ่งโรจน์การเกษตร</h1>
            <div>
              <p className="mt-10 text-2xl">Username</p>
              <input
                onChange={(e) => setUsername(e.target.value)}
                name="username"
                className="w-3/5 px-2 py-2 mt-2 bg-white border rounded-xl"
              />
            </div>
            <div>
              <p className="mt-2 text-2xl">Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                type="password"
                className="w-3/5 px-2 py-2 mt-2 bg-white border rounded-xl"
              />
            </div>
            <div>
              <button
                onClick={handleSignIn}
                className="w-3/5 px-2 py-2 mt-10 bg-blue-700 hover:bg-blue-800 rounded-xl text-white"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-screen w-full hidden md:flex items-center justify-center">
        <div className="min-h-screen w-3/5 flex bg-gray-100">
          <div className="ml-36 w-full flex flex-col justify-center">
            <h1 className="text-5xl text-blue-700">ทิพย์รุ่งโรจน์การเกษตร</h1>
            <div>
              <p className="mt-10 text-2xl">Username</p>
              <input
                onChange={(e) => setUsername(e.target.value)}
                className="w-3/5 px-2 py-2 mt-2 bg-white border rounded-xl"
              />
            </div>
            <div>
              <p className="mt-5 text-2xl">Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-3/5 px-2 py-2 mt-2 bg-white border rounded-xl"
              />
            </div>
            <div>
              <button
                onClick={handleSignIn}
                className="w-3/5 px-2 py-2 mt-10 bg-blue-700 hover:bg-blue-800 rounded-xl text-white"
              >
                Login
              </button>
            </div>
          </div>
        </div>
        <div className="min-h-screen w-2/5 flex items-center justify-center bg-blue-700">
          <Image
            src="/img/475534955_602806375839660_5561232842233835189_n.jpg"
            alt="Img"
            width={1000}
            height={1000}
            priority
            className="rounded-2xl w-auto h-auto"
          />
        </div>
      </div>
    </>
  );
};

export default Page;
