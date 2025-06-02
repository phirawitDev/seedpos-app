"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlus, FaUserEdit } from "react-icons/fa";
import { IoTrashBin } from "react-icons/io5";
import { PorductsInterface } from "@/app/interface/ProductsInterface";
import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import Swal from "sweetalert2";
import { MdHideImage } from "react-icons/md";

export default function ProductPage() {
  const [products, setProducts] = useState<PorductsInterface>();
  const [category, setCategory] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("0");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [restock, setRestock] = useState("");
  const [image, setImage] = useState<File | null>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editId, setEditId] = useState("");

  const fectProduct = async () => {
    const url = "/api/product";
    const headers = getAuthHeaders();

    const users = await axios.get(url, { headers });

    if (!users.data) {
      return console.log("error");
    }
    setProducts(users.data);
  };

  const fectCategory = async () => {
    const url = "/api/category";
    const headers = getAuthHeaders();

    const category = await axios.get(url, { headers });

    if (!category.data) {
      return console.log("error");
    }
    setCategory(category.data);
  };

  useEffect(() => {
    fectProduct();
    fectCategory();

    const interval = setInterval(() => {
      fectProduct();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (data: string) => {
    try {
      const url = "/api/product/search/" + data;
      const headers = getAuthHeaders();

      const search = await axios.get(url, { headers });

      setProducts(search.data);
    } catch {
      fectProduct();
    }
  };

  const chooseFile = (files: any) => {
    if (files.length > 0) {
      const file: File = files[0];
      setImage(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    try {
      if (!name || !categoryId || !costPrice || !salePrice || !restock) {
        Swal.fire({
          title: "ผิดพลาด",
          text: "กรุณากรอกข้อมูลให้ครบถ้วน",
          icon: "warning",
          showConfirmButton: true,
          buttonsStyling: false,
          customClass: {
            confirmButton: "btn btn-primary px-6",
          },
        });
        const modal = document.getElementById(
          "modalProductCreate"
        ) as HTMLDialogElement | null;
        modal?.close();
        return;
      }

      const modal = document.getElementById(
        "modalProductCreate"
      ) as HTMLDialogElement | null;
      modal?.close();

      const url = "/api/product";
      const headers = getAuthHeaders();

      const data = new FormData();
      data.append("image", image as Blob);
      data.append("name", name as string);
      data.append("categoryId", String(categoryId));
      data.append("costPrice", String(costPrice));
      data.append("salePrice", String(salePrice));
      data.append("restock", String(restock));

      const create = await axios.post(url, data, { headers });

      if (create.status === 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "เพิ่มข้อมูลสินค้าเรียนร้อยแล้ว",
          icon: "success",
        });
        fectProduct();
        setName("");
        setCategoryId("");
        setCostPrice("");
        setSalePrice("");
        setRestock("");
        setCategoryId("");
        clearImage();
      }
    } catch (error: unknown) {
      const e = error as Error;
      return Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเพิ่มสินค้าได้",
        icon: "error",
      });
    }
  };

  const handleModal = async (product: PorductsInterface) => {
    setEditId(String(product.id));
    setName(product.name);
    setCostPrice(String(product.costPrice));
    setSalePrice(String(product.salePrice));
    setRestock(String(product.restock));
    setCategoryId(String(product.category.id));

    const modal = document.getElementById(
      "modalProductEdit"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const handleCloseModal = async () => {
    setEditId("");
    setName("");
    setCostPrice("");
    setSalePrice("");
    setRestock("");
    setCategoryId("");
    clearImage;
    const modal = document.getElementById(
      "modalProductEdit"
    ) as HTMLDialogElement | null;
    modal?.close();
  };

  const handleUpdate = async () => {
    try {
      const url = "/api/product";
      const headers = getAuthHeaders();
      const data = new FormData();
      data.append("Id", String(editId));
      data.append("image", image as Blob);
      data.append("name", name as string);
      data.append("categoryId", String(categoryId));
      data.append("costPrice", String(costPrice));
      data.append("salePrice", String(salePrice));
      data.append("restock", String(restock));

      const update = await axios.put(url, data, { headers });
      if (update.status === 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "แก้ไขข้อมูลสินค้าสำเร็จ",
          icon: "success",
        });
        fectProduct();
        const modal = document.getElementById(
          "modalProductEdit"
        ) as HTMLDialogElement | null;
        modal?.close();
      }
    } catch (error: unknown) {
      const e = error as Error;
      return Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถแก้ไขข้อมูลสินค้าได้",
        icon: "error",
      });
    }
  };

  const handleDelete = async (data: any) => {
    const button = await Swal.fire({
      title: "ลบสินค้า?",
      text: "คุณต้องการลบสินค้าออกจากระบบใช่หรือไม่",
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
      const url = "/api/product" + `?Id=${data.id}`;
      const headers = getAuthHeaders();

      const response = await axios.delete(url, { headers });

      if (response.status == 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ลบสินค้าออกจากระบบสำเร็จ",
          icon: "success",
          timer: 1000,
        });

        fectProduct();
      }
    }
  };

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col md:flex md:flex-row justify-between mt-6 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold">จัดการข้อมูลสินค้า</h1>
        </div>
        <div className="flex flex-row gap-4 mt-4 md:mt-0">
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
          <div className="flex items-center bg-white border border-gray-300 rounded-xl"></div>
          <div>
            <button
              onClick={() => {
                const modal = document.getElementById(
                  "modalProductCreate"
                ) as HTMLDialogElement | null;
                modal?.showModal();
              }}
              className="flex items-center gap-2 btn btn-primary text-nowrap"
            >
              <FaPlus />
              เพิ่มสินค้า
            </button>
            <dialog id="modalProductCreate" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">เพิ่มสินค้า</h3>
                <div className="flex flex-col mt-2 gap-2">
                  <div className="flex items-center">
                    <p className="w-40">ชื่อสินค้า :</p>
                    <input
                      type="text"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="กรอกชื่อสินค้า....."
                      value={name}
                      className="input w-full focus:outline-0"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="w-40">ราคาต้นทุน :</p>
                    <input
                      type="number"
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="กรอกราคาต้นทุน....."
                      value={costPrice}
                      className="input w-full focus:outline-0"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="w-40">ราคาขาย :</p>
                    <input
                      type="number"
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="กรอกราคาขาย....."
                      value={salePrice}
                      className="input w-full focus:outline-0"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="w-40">แจ้งเตือนต่ำกว่า :</p>
                    <input
                      type="number"
                      onChange={(e) => setRestock(e.target.value)}
                      placeholder="กรอกแจ้งเตือนสินค้าต่ำกว่า....."
                      value={restock}
                      className="input w-full focus:outline-0"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="w-40">ประเภทสินค้า :</p>
                    <select
                      onChange={(e) => setCategoryId(e.target.value)}
                      value={categoryId}
                      className="select w-full focus:outline-0"
                    >
                      <option value="0">เลือกประเภทสินค้า</option>
                      {Array.isArray(category) &&
                        category.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-center mt-4">
                    <label className="cursor-pointer truncate overflow-hidden whitespace-nowrap bg-secondary text-base-100 py-3 px-6 rounded-full w-full max-w-xs text-center text-lg font-semibold hover:bg-gray-500 transition-all duration-300">
                      {image ? image.name : "เลือกรูปสินค้า"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        name="file"
                        onChange={(e) => chooseFile(e.target.files)}
                        className="hidden"
                        accept="image/*"
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={handleCreate}>
                    เพิ่มสินค้า
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
                <th className="text-center ">รหัสสินค้า</th>
                <th className="text-center w-36">รูปสินค้า</th>
                <th className="text-center w-[30%]">ชื่อสินค้า</th>
                <th className="text-center ">ราคาต้นทุน</th>
                <th className="text-center ">ราคาขาย</th>
                <th className="text-center ">แจ้งเตือนต่ำกว่า</th>
                <th className="text-center ">ประเภทสินค้า</th>
                <th className="text-center ">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {Array.isArray(products) &&
                products.map((product: PorductsInterface, i: number) => (
                  <tr key={product.id} className="hover:bg-base-200">
                    <td className="text-center">
                      {String(product.id).padStart(4, "0")}
                    </td>
                    <td className="text-center h-36">
                      {product?.imageUrl?.startsWith("/") ? (
                        <img
                          src={`${product.imageUrl}`}
                          alt=""
                          className="rounded-xl w-full h-full"
                        />
                      ) : (
                        <p className="flex items-center justify-center text-4xl">
                          <MdHideImage />
                        </p>
                      )}
                    </td>
                    <td className="text-left truncate">{product.name}</td>
                    <td className="text-center">
                      {product.costPrice?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center">
                      {product.salePrice?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center">{product.restock}</td>
                    <td className="text-center">{product.category.name}</td>
                    <td className="text-center">
                      <button
                        onClick={(e) => {
                          handleModal(product);
                        }}
                        className="text-3xl text-yellow-400 mr-2"
                      >
                        <FaUserEdit />
                      </button>
                      <button
                        onClick={(e) => handleDelete(product)}
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
      <dialog id="modalProductEdit" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">แก้ไขข้อมูลสินค้า</h3>
          <form autoComplete="off">
            <div className="flex flex-col mt-2 gap-2">
              <div className="flex items-center">
                <p className="w-40">ชื่อสินค้า :</p>
                <input
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="กรอกชื่อสินค้า....."
                  value={name}
                  className="input w-full focus:outline-0"
                />
              </div>
              <div className="flex items-center">
                <p className="w-40">ราคาต้นทุน :</p>
                <input
                  type="number"
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="กรอกราคาต้นทุน....."
                  value={costPrice}
                  className="input w-full focus:outline-0"
                />
              </div>
              <div className="flex items-center">
                <p className="w-40">ราคาขาย :</p>
                <input
                  type="number"
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="กรอกราคาขาย....."
                  value={salePrice}
                  className="input w-full focus:outline-0"
                />
              </div>
              <div className="flex items-center">
                <p className="w-40">แจ้งเตือนต่ำกว่า :</p>
                <input
                  type="number"
                  onChange={(e) => setRestock(e.target.value)}
                  placeholder="กรอกแจ้งเตือนสินค้าต่ำกว่า....."
                  value={restock}
                  className="input w-full focus:outline-0"
                />
              </div>
              <div className="flex items-center">
                <p className="w-40">ประเภทสินค้า :</p>
                <select
                  onChange={(e) => setCategoryId(e.target.value)}
                  value={categoryId}
                  className="select w-full focus:outline-0"
                >
                  <option value="0">เลือกประเภทสินค้า</option>
                  {Array.isArray(category) &&
                    category.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-center justify-center mt-4">
                <label className="cursor-pointer truncate overflow-hidden whitespace-nowrap bg-secondary text-base-100 py-3 px-6 rounded-full w-full max-w-xs text-center text-lg font-semibold hover:bg-gray-500 transition-all duration-300">
                  {image ? image.name : "เลือกรูปสินค้า"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    onChange={(e) => chooseFile(e.target.files)}
                    className="hidden"
                    accept="image/*"
                    required
                  />
                </label>
              </div>
            </div>
          </form>

          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleUpdate}>
              ยืนยัน
            </button>
            <button onClick={handleCloseModal} className="btn">
              ยกเลิก
            </button>
          </div>
        </div>
      </dialog>
      <div className="w-full flex flex-col md:hidden my-4">
        {Array.isArray(products) &&
          products.map((product: PorductsInterface, i: number) => (
            <div
              key={product.id}
              className="p-4 mt-2 flex flex-col items-center bg-white rounded-xl shadow border-1 border-gray-200"
            >
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                รหัสสินค้า: <p>{String(product.id).padStart(4, "0")}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ชื่อสินค้า: <p>{product.name}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ราคาต้นทุน:{" "}
                <p>
                  {product.costPrice?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ราคาขาย:{" "}
                <p>
                  {product.salePrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                แจ้งเตือนต่ำกว่า: <p>{product.restock}</p>
              </div>
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ประเภทสินค้า: <p>{product.category.name}</p>
              </div>
              <div className="mt-2 text-xl items-center flex flex-row w-full gap-5">
                การจัดการ:
                <div>
                  <button
                    onClick={(e) => {
                      handleModal(product);
                    }}
                    className="text-3xl text-yellow-400 mr-2"
                  >
                    <FaUserEdit />
                  </button>
                  <button
                    onClick={(e) => handleDelete(product)}
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
