"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import { SaleDetailInterface } from "@/app/interface/SaleDetailInterface";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MdLocalPrintshop } from "react-icons/md";
import { FaCircleXmark } from "react-icons/fa6";
import Swal from "sweetalert2";
import { ImBin } from "react-icons/im";

interface SaleItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  stock: number;
  salePrice: number;
  imageUrl?: string;
}

export default function saleDetailPage() {
  const url = usePathname();
  const id = url.split("/")[4];
  const [saleDetail, setSaleDetail] = useState<SaleDetailInterface>();
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const router = useRouter();

  const fetchSaleDetail = async () => {
    try {
      const url = `/api/salehistory/${id}`;
      const headers = getAuthHeaders();

      const saledetails = await axios.get(url, { headers });

      if (saledetails.status == 200) {
        setSaleDetail(saledetails.data);

        const items = saledetails.data.details.map(
          (item: {
            productId: any;
            product: {
              id: any;
              name: any;
              stock: any;
            };
            quantity: any;
            price: any;
          }) => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            stock: item.product.stock + item.quantity,
          })
        );
        setSelectedItems(items);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  const fetchProducts = async () => {
    try {
      const url = `/api/product`;
      const headers = getAuthHeaders();
      const res = await axios.get(url, { headers });

      if (res.status === 200) {
        setAllProducts(res.data);
      }
    } catch (e) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดรายการสินค้าได้", "error");
    }
  };

  useEffect(() => {
    fetchSaleDetail();
    fetchProducts();
  }, []);

  const handleChangePrice = (productId: number, price: number) => {
    setSelectedItems((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, price } : p))
    );
  };

  const handleChangeQty = (productId: number, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((p) => {
        if (p.productId === productId) {
          const safeQty = Math.min(qty, p.stock); // ✅ ห้ามเกิน stock
          return { ...p, quantity: safeQty };
        }
        return p;
      })
    );
  };

  const handleRemove = (productId: number) => {
    setSelectedItems((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedItems((prev) => {
      const existing = prev.find((p) => p.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > product.stock) return prev; // ❌ ไม่ให้เกิน stock
        return prev.map((p) =>
          p.productId === product.id ? { ...p, quantity: newQty } : p
        );
      } else {
        return [
          ...prev,
          {
            id: product.id, // Add id property
            productId: product.id,
            name: product.name,
            quantity: 1,
            price: product.salePrice ?? 0,
            stock: product.stock, // ✅ เก็บ stock
          },
        ];
      }
    });
  };

  const handleSubmitUpdate = async () => {
    if (!saleDetail) return;

    if (selectedItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "ไม่มีรายการสินค้า",
        text: "กรุณาเลือกรายการสินค้าอย่างน้อย 1 รายการ",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "ยืนยันการแก้ไขคำสั่งซื้อ",
      text: "คุณแน่ใจหรือไม่ว่าต้องการอัปเดตคำสั่งซื้อนี้?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่, ดำเนินการ",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "btn btn-primary mr-2",
        cancelButton: "btn btn-base-100",
      },
      buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    try {
      const url = "/api/sale/update";
      const headers = getAuthHeaders();

      const payload = {
        saleId: saleDetail.id,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await axios.post(url, payload, {
        headers,
      });

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "อัปเดตคำสั่งซื้อเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
        });
        router.push(`/admin/salehistory/detail/${saleDetail.id}`);
      } else {
        throw new Error("เกิดข้อผิดพลาดในการอัปเดต");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถอัปเดตคำสั่งซื้อได้",
        text: error.message || "เกิดข้อผิดพลาด",
      });
    }
  };

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col md:flex md:flex-row justify-between mt-6 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold">แก้ไขคำสั่งซื้อ</h1>
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
                  "dd/MM/yyyy เวลา HH:mm น.",
                  { locale: th }
                )
              : "N/A"}
          </p>
          <p className="text-lg">ลูกค้า: {saleDetail?.customerName}</p>
          <p className="text-lg">พนักงานขาย: {saleDetail?.userName}</p>
        </div>
      </div>

      <div className="md:hidden p-2 mt-4">
        <div className="flex flex-row items-center justify-between">
          <div className="text-2xl font-bold">รายการสินค้า</div>
          <button onClick={handleSubmitUpdate} className="btn btn-primary">
            บันทึกการแก้ไข
          </button>
        </div>
      </div>

      <div className="hidden md:flex md:flex-col bg-base-100 mt-10 p-4 card">
        <div className="flex flex-row items-center justify-between">
          <div className="text-2xl font-bold">รายการสินค้า</div>
          <button onClick={handleSubmitUpdate} className="btn btn-primary">
            บันทึกการแก้ไข
          </button>
        </div>
        <table className="w-full mt-2">
          <thead>
            <tr>
              <th className="text-xl border-b-1 p-4 w-[45%]">ชื่อสินค้า</th>
              <th className="text-xl border-b-1 p-4 w-[20%]">
                ราคาขายต่อหน่วย
              </th>
              <th className="text-xl border-b-1 p-4 w-[20%]">จำนวน</th>
              <th className="text-xl border-b-1 p-4 w-[15%] text-center">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(selectedItems) &&
              selectedItems?.map((item: any) => (
                <tr key={item.productId} className="hover:bg-gray-200">
                  <td className="w-[45%] text-left text-xl p-4">{item.name}</td>
                  <td className="w-[20%] text-center text-xl px-2">
                    <input
                      type="number"
                      className="border px-4 py-2 rounded-xl w-full"
                      value={item.price ?? 0}
                      min={0}
                      onChange={(e) =>
                        handleChangePrice(
                          item.productId,
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td className="w-[20%] text-center text-xl px-2">
                    <input
                      type="number"
                      className="border px-4 py-2 rounded-xl w-full "
                      value={item.quantity}
                      min={1}
                      max={item.stock}
                      onChange={(e) =>
                        handleChangeQty(
                          item.productId,
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </td>
                  <td className="w-[15%] text-center text-xl p-4">
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="btn text-error text-xl"
                    >
                      <ImBin />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div>
          <h2 className="text-2xl font-bold mb-4 mt-4">เพิ่มสินค้าใหม่</h2>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-4">
          {allProducts.filter(
            (p) =>
              p.stock > 0 && !selectedItems.find((item) => item.id === p.id)
          ).length === 0 ? (
            <p className="text-gray-500 text-xl col-span-5 text-center">
              ไม่มีสินค้าที่สามารถเพิ่มได้
            </p>
          ) : (
            allProducts
              .filter(
                (p) =>
                  p.stock > 0 && !selectedItems.find((item) => item.id === p.id)
              )
              .map((product) => (
                <div
                  key={product.id}
                  className="p-4 border rounded-xl hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSelectProduct(product)}
                >
                  <p className="text-xl w-full truncate">{product.name}</p>
                  <p className="text-gray-500">คงเหลือ: {product.stock}</p>
                </div>
              ))
          )}
        </div>
      </div>
      <div className="w-full flex flex-col md:hidden mb-4">
        {Array.isArray(selectedItems) &&
          selectedItems.map((item: any, i: number) => (
            <div
              key={item.productId}
              className="p-4 mt-2 flex flex-col items-center bg-white rounded-xl"
            >
              <div className="flex flex-row w-full gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ชื่อสินค้า: <p>{item.name}</p>
              </div>
              <div className="flex flex-row w-full items-center justify-between gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                ราคาขาย/หน่วย:{" "}
                <p>
                  <input
                    type="number"
                    className="border px-4 py-2 rounded-xl w-full"
                    value={item.price ?? 0}
                    min={0}
                    onChange={(e) =>
                      handleChangePrice(
                        item.productId,
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </p>
              </div>
              <div className="flex flex-row w-full items-center justify-between gap-5 mt-2 text-xl border-b-1 border-gray-200 truncate">
                จำนวน:{" "}
                <p>
                  <input
                    type="number"
                    className="border px-4 py-2 rounded-xl w-full "
                    value={item.quantity}
                    min={1}
                    max={item.stock}
                    onChange={(e) =>
                      handleChangeQty(
                        item.productId,
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                </p>
              </div>
              <div className="mt-2 text-xl items-center flex flex-row w-full gap-5">
                การจัดการ:
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="btn text-error text-xl"
                >
                  <ImBin />
                </button>
              </div>
            </div>
          ))}
        <div className="bg-base-100 p-2 mt-4 card">
          <div>
            <h2 className="text-2xl font-bold mb-2 mt-4">เพิ่มสินค้าใหม่</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {allProducts.filter(
              (p) =>
                p.stock > 0 && !selectedItems.find((item) => item.id === p.id)
            ).length === 0 ? (
              <p className="text-gray-500 text-xl col-span-5 text-center">
                ไม่มีสินค้าที่สามารถเพิ่มได้
              </p>
            ) : (
              allProducts
                .filter(
                  (p) =>
                    p.stock > 0 &&
                    !selectedItems.find((item) => item.id === p.id)
                )
                .map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border rounded-xl hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <p className="text-xl w-full truncate">{product.name}</p>
                    <p className="text-gray-500">คงเหลือ: {product.stock}</p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
