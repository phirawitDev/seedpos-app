"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaUserEdit } from "react-icons/fa";
import { IoTrashBin } from "react-icons/io5";
import { UsersInterface } from "@/app/interface/UsersInterface";
import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import Swal from "sweetalert2";

export default function UsersPage() {
  const [users, setUsers] = useState<UsersInterface | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [editId, setEditId] = useState<number | undefined>();
  const [editname, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");

  const fecthusers = async () => {
    const url = "/api/users";
    const headers = getAuthHeaders();

    const users = await axios.get(url, { headers });

    if (!users.data) {
      return console.log("error");
    }
    setUsers(users.data);
  };

  useEffect(() => {
    fecthusers();
  }, []);

  const handleSearch = async (data: string) => {
    try {
      const url = "/api/users/search/" + data;
      const headers = getAuthHeaders();

      const search = await axios.get(url, { headers });

      setUsers(search.data);
    } catch {
      fecthusers();
    }
  };

  const handleCreate = async () => {
    try {
      const modal = document.getElementById(
        "modalUsersCreate"
      ) as HTMLDialogElement | null;
      modal?.close();

      const url = "/api/users";
      const headers = getAuthHeaders();
      const payload = {
        name,
        username,
        password,
        role,
      };

      const create = await axios.post(url, payload, { headers });

      if (create.status === 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "เพิ่มข้อมูลพนังงานเรียนร้อยแล้ว",
          icon: "success",
        });
        fecthusers();
        setName("");
        setUsername("");
        setRole("");
        setPassword("");
      }
    } catch (error: unknown) {
      const e = error as Error;
      return Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเพิ่มพนักงานได้",
        icon: "error",
      });
    }
  };

  const handleModal = async (user: UsersInterface) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditRole(user.role);
    const modal = document.getElementById(
      "modalUsersEdit"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const handleUpdate = async () => {
    try {
      const url = "/api/users";
      const headers = getAuthHeaders();
      const payload = {
        Id: editId,
        name: editname,
        username: editUsername,
        password: editPassword,
        role: editRole,
      };

      const update = await axios.put(url, payload, { headers });
      if (update.status === 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "แก้ไขข้อมูลพนักงานสำเร็จ",
          icon: "success",
        });
        fecthusers();
        const modal = document.getElementById(
          "modalUsersEdit"
        ) as HTMLDialogElement | null;
        modal?.close();
      }
    } catch (error: unknown) {
      const e = error as Error;
      return Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถแก้ไขข้อมูลพนักงานได้",
        icon: "error",
      });
    }
  };

  const handleDelete = async (data: any) => {
    const button = await Swal.fire({
      title: "ลบพนักงาน",
      text: "คุณต้องการลบพนักงานออกจากระบบใช่หรือไม่",
      icon: "question",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "ใช่, ยืนยัน",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "btn btn-error mr-2",
        cancelButton: "btn btn-base-100",
      },
      buttonsStyling: false,
    });

    if (button.isConfirmed) {
      const url = "/api/users" + `?Id=${data.id}`;
      const headers = getAuthHeaders();

      const response = await axios.delete(url, { headers });

      if (response.status == 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ลบพนักงานออกจากระบบสำเร็จ",
          icon: "success",
          timer: 1000,
        });

        fecthusers();
      }
    }
  };

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col md:flex md:flex-row justify-between mt-6 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold">จัดการข้อมูลพนักงาน</h1>
        </div>
        <div className="flex flex-row gap-4 mt-4 md:mt-0">
          <form autoComplete="off">
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
                onChange={(e) => handleSearch(e.target.value)}
                type="search"
                placeholder="Search......"
              />
            </label>
          </form>
          <div className="flex items-center bg-white border border-gray-300 rounded-xl"></div>
          <div>
            <button
              onClick={() => {
                const modal = document.getElementById(
                  "modalUsersCreate"
                ) as HTMLDialogElement | null;
                modal?.showModal();
              }}
              className="flex items-center gap-2 btn btn-primary text-nowrap"
            >
              <FaPlus />
              เพิ่มพนักงาน
            </button>
            <dialog id="modalUsersCreate" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">เพิ่มพนักงาน</h3>
                <div className="flex flex-col mt-2 gap-2">
                  <div className="flex items-center">
                    <p className="w-40">ชื่อ :</p>
                    <input
                      type="text"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="กรอกชื่อ....."
                      className="input w-full focus:outline-0"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="w-40">ชื่อผู้ใช้งาน :</p>
                    <input
                      type="text"
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="กรอกชื่อผู้ใช้งาน....."
                      className="input w-full focus:outline-0"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="w-40">รหัสผ่าน :</p>
                    <input
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน....."
                      className="input w-full focus:outline-0"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="w-40">สิทธิ์การใช้งาน :</p>
                    <select
                      onChange={(e) => setRole(e.target.value)}
                      className="select w-full focus:outline-0"
                    >
                      <option>เลือกสิทธ์</option>
                      <option value={"ADMIN"}>ADMIN</option>
                      <option value={"EMPLOYEE"}>EMPLOYEE</option>
                    </select>
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={handleCreate}>
                    เพิ่มพนักงาน
                  </button>
                  <form method="dialog">
                    <button className="btn">ยกเลิก</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      </div>
      <div className="hidden md:flex card mt-6 p-2 w-full bg-base-100 shadow">
        <div className="">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th className="text-center w-[10%]">No.</th>
                <th className="text-center w-[35%]">ชื่อ</th>
                <th className="text-center w-[30%]">username</th>
                <th className="text-center w-[15%]">สิทธิ์การใช้งาน</th>
                <th className="text-center w-[10%]">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {Array.isArray(users) &&
                users.map((user: UsersInterface, i: number) => (
                  <tr key={user.id} className="hover:bg-base-200">
                    <td className="text-center">
                      {String(user.id).padStart(4, "0")}
                    </td>
                    <td className="text-center">{user.name}</td>
                    <td className="text-center">{user.username}</td>
                    <td className="text-center">{user.role}</td>
                    <td className="text-center">
                      <button
                        onClick={(e) => {
                          handleModal(user);
                        }}
                        className="text-3xl text-yellow-400 mr-2"
                      >
                        <FaUserEdit />
                      </button>
                      <button
                        onClick={(e) => handleDelete(user)}
                        className="text-3xl text-red-600"
                      >
                        <IoTrashBin />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <dialog id="modalUsersEdit" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">แก้ไขข้อมูลพนักงาน</h3>
          <div className="flex flex-col mt-2 gap-2">
            <div className="flex items-center">
              <p className="w-40">ชื่อ :</p>
              <input
                type="text"
                onChange={(e) => setEditName(e.target.value)}
                value={editname}
                className="input w-full focus:outline-0"
              />
            </div>
            <div className="flex items-center">
              <p className="w-40">ชื่อผู้ใช้งาน :</p>
              <input
                type="text"
                onChange={(e) => setEditUsername(e.target.value)}
                value={editUsername}
                className="input w-full focus:outline-0"
              />
            </div>
            <div className="flex items-center">
              <p className="w-40">รหัสผ่าน :</p>
              <input
                type="password"
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="ถ้าไม่เปลื่ยนให้ว่างไว้"
                className="input w-full focus:outline-0"
              />
            </div>
            <div className="flex items-center">
              <p className="w-40">สิทธิ์การใช้งาน :</p>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="select w-full focus:outline-0"
              >
                <option>เลือกสิทธ์</option>
                <option value={"ADMIN"}>ADMIN</option>
                <option value={"EMPLOYEE"}>EMPLOYEE</option>
              </select>
            </div>
          </div>

          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleUpdate}>
              ยืนยัน
            </button>
            <form method="dialog">
              <button className="btn">ยกเลิก</button>
            </form>
          </div>
        </div>
      </dialog>
      <div className="w-full flex flex-col md:hidden my-4">
        {Array.isArray(users) &&
          users.map((user: any, i: number) => (
            <div
              key={user.id}
              className="p-4 mt-2 flex flex-col items-center bg-white rounded-xl shadow border-1 border-gray-200"
            >
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                รหัสสมาชิก: <p>{String(user.id).padStart(4, "0")}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ชื่อ: <p>{user.name}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ชื่อผู้ใช้งาน: <p>{user.username}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                สิทธิ์การใช้งาน: <p>{user.role}</p>
              </div>
              <div className="mt-2 text-xl items-center flex flex-row w-full gap-5">
                การจัดการ:
                <div>
                  <button
                    onClick={(e) => {
                      handleModal(user);
                    }}
                    className="text-3xl text-yellow-400 mr-2"
                  >
                    <FaUserEdit />
                  </button>
                  <button
                    onClick={(e) => handleDelete(user)}
                    className="text-3xl text-red-600"
                  >
                    <IoTrashBin />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
