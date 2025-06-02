"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaUserEdit } from "react-icons/fa";
import { IoTrashBin } from "react-icons/io5";
import { CustomerInterface } from "@/app/interface/CustomerInterface";
import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import Swal from "sweetalert2";

export default function UsersPage() {
  const [customers, setCustomers] = useState<CustomerInterface>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editId, setEditId] = useState<number | undefined>();
  const [editname, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const fectCustomer = async () => {
    const url = "/api/customer";
    const headers = getAuthHeaders();

    const users = await axios.get(url, { headers });

    if (!users.data) {
      return console.log("error");
    }
    setCustomers(users.data);
  };

  useEffect(() => {
    fectCustomer();
  }, []);

  const handleSearch = async (data: string) => {
    try {
      const url = "/api/customer/search/" + data;
      const headers = getAuthHeaders();

      const search = await axios.get(url, { headers });

      setCustomers(search.data);
    } catch {
      fectCustomer();
    }
  };

  const handleCreate = async () => {
    try {
      const modal = document.getElementById(
        "modalUsersCreate"
      ) as HTMLDialogElement | null;
      modal?.close();

      const url = "/api/customer";
      const headers = getAuthHeaders();
      const payload = {
        name,
        phone,
      };

      const create = await axios.post(url, payload, { headers });

      if (create.status === 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "เพิ่มข้อมูลพนังงานเรียนร้อยแล้ว",
          icon: "success",
        });
        fectCustomer();
        setName("");
        setPhone("");
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

  const handleModal = async (customer: CustomerInterface) => {
    setEditId(customer.id);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    const modal = document.getElementById(
      "modalCustomerEdit"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const handleUpdate = async () => {
    try {
      const url = "/api/customer";
      const headers = getAuthHeaders();
      const payload = {
        Id: editId,
        name: editname,
        phone: editPhone,
      };

      const update = await axios.put(url, payload, { headers });
      if (update.status === 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "แก้ไขข้อมูลพนักงานสำเร็จ",
          icon: "success",
        });
        fectCustomer();
        const modal = document.getElementById(
          "modalCustomerEdit"
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
      title: "ลบสมาชิก",
      text: "คุณต้องการลบสมาชิกออกจากระบบใช่หรือไม่",
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
      const url = "/api/customer" + `?Id=${data.id}`;
      const headers = getAuthHeaders();

      const response = await axios.delete(url, { headers });

      if (response.status == 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ลบสามาชิกออกจากระบบสำเร็จ",
          icon: "success",
          timer: 1000,
        });

        fectCustomer();
      }
    }
  };

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col md:flex md:flex-row justify-between mt-6 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold">จัดการข้อมูลสมาชิก</h1>
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
                autoComplete="off"
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
              เพิ่มสมาชิก
            </button>
            <dialog id="modalUsersCreate" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">เพิ่มสมาชิก</h3>
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
                    <p className="w-40">เบอร์โทรศัพท์ :</p>
                    <input
                      type="number"
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="กรอกเบอร์โทรศัพท์....."
                      className="input w-full focus:outline-0"
                    />
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={handleCreate}>
                    เพิ่มสมาชิก
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
                <th className="text-center w-[10%]">รหัสสมาชิก</th>
                <th className="text-center w-[35%]">ชื่อสมาชิก</th>
                <th className="text-center w-[30%]">เบอร์โทรศัพท์</th>
                <th className="text-center w-[10%]">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {Array.isArray(customers) &&
                customers.map((customer: CustomerInterface, i: number) => (
                  <tr key={customer.id} className="hover:bg-base-200">
                    <td className="text-center">
                      {String(customer.id).padStart(4, "0")}
                    </td>
                    <td className="text-center">{customer.name}</td>
                    <td className="text-center">{customer.phone}</td>
                    <td className="text-center">
                      <button
                        onClick={(e) => {
                          handleModal(customer);
                        }}
                        className="text-3xl text-yellow-400 mr-2"
                      >
                        <FaUserEdit />
                      </button>
                      <button
                        onClick={(e) => handleDelete(customer)}
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
      <dialog id="modalCustomerEdit" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">เพิ่มสมาชิก</h3>
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
              <p className="w-40">เบอร์โทรศัพท์ :</p>
              <input
                type="number"
                onChange={(e) => setEditPhone(e.target.value)}
                value={editPhone}
                className="input w-full focus:outline-0"
              />
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
        {Array.isArray(customers) &&
          customers.map((customer: any, i: number) => (
            <div
              key={customer.id}
              className="p-4 mt-2 flex flex-col items-center bg-white rounded-xl shadow border-1 border-gray-200"
            >
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                รหัสสมาชิก: <p>{String(customer.id).padStart(4, "0")}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ชื่อ: <p>{customer.name}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                เบอร์โทรศัพท์: <p>{customer.phone}</p>
              </div>
              <div className="mt-2 text-xl items-center flex flex-row w-full gap-5">
                การจัดการ:
                <div>
                  <button
                    onClick={(e) => {
                      handleModal(customer);
                    }}
                    className="text-3xl text-yellow-400 mr-2"
                  >
                    <FaUserEdit />
                  </button>
                  <button
                    onClick={(e) => handleDelete(customer)}
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
