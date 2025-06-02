"use client";

import { getAuthHeaders } from "@/app/component/Headers";
import { useNumericKeyListener } from "@/app/component/useNumericKeyListener";
import { CategoryInterface } from "@/app/interface/CategoryInterface";
import { PorductsInterface } from "@/app/interface/ProductsInterface";
import { UsersInterface } from "@/app/interface/UsersInterface";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { ImBin } from "react-icons/im";
import { MdEditSquare, MdRemoveShoppingCart } from "react-icons/md";
import Swal from "sweetalert2";

interface SaleItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  stock: number;
}

export interface SaleReportType {
  data: {
    saleId: number;
    customerName: string;
    employeeName: string;
    total: number;
    note?: string;
    saleType: string;
    paymentType: string;
    createdAt: string;
    items: {
      productId: string;
      productName: string;
      barcode?: string;
      quantity: number;
      price: number;
      total: number;
      lots: {
        lotId: number;
        quantity: number;
        price: number;
        receivedAt: string;
      }[];
    }[];
  };
}

export default function posPage() {
  const [products, setProducts] = useState<PorductsInterface[]>([]);
  const [category, setCategory] = useState<CategoryInterface[]>([]);
  const [users, setUsers] = useState<UsersInterface[]>([]);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">(0);
  const [amount, setAmount] = useState("");
  const [change, setChange] = useState<number>();
  const [image, setImage] = useState<File | null>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [payToCash, setPayToCash] = useState(true);
  const [payToQr, setPayToQr] = useState(false);
  const [payToBorrow, setPayToBorrow] = useState(false);
  const [note, setNote] = useState("");
  const [customername, setCustomerName] = useState("");
  const [saleReport, setSaleReport] = useState<SaleReportType | null>(null);
  const [customerModal, setCustomerModal] = useState(false);
  const [cartModal, setCartModal] = useState(false);

  const fetchProducts = async () => {
    try {
      const url = "/api/product";
      const headers = getAuthHeaders();

      const product = await axios.get(url, { headers });

      if (product.status == 200) {
        setProducts(product.data);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  const fetchCategory = async () => {
    try {
      const url = "/api/category";
      const headers = getAuthHeaders();

      const category = await axios.get(url, { headers });

      if (category.status == 200) {
        setCategory(category.data);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  const fetchUsers = async () => {
    try {
      const url = "/api/customer";
      const headers = getAuthHeaders();

      const users = await axios.get(url, { headers });

      if (users.status == 200) {
        setUsers(users.data);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  const fetchNewProduct = async (item: any) => {
    if (item == "all") {
      fetchProducts();
      return;
    }
    try {
      const url = `/api/product/category/${item.id}`;

      const headers = getAuthHeaders();

      const newProduct = await axios.get(url, { headers });

      if (newProduct.status == 200) {
        setProducts(newProduct.data);
      }
    } catch (error: unknown) {
      const e = error as Error;
      return e;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategory();
    fetchUsers();
  }, []);

  const handleSelectProduct = (product: PorductsInterface) => {
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

  const handleRemove = (productId: number) => {
    setSelectedItems((prev) => prev.filter((p) => p.productId !== productId));
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

  const handleChangePrice = (productId: number, price: number) => {
    setSelectedItems((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, price } : p))
    );
  };

  const openmadalpay = () => {
    if (selectedItems.length === 0) {
      Swal.fire({
        title: "กรุณาเลือกสินค้าก่อนชำระเงิน",
        icon: "warning",
        showConfirmButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "btn btn-primary",
        },
      });
      return;
    }
    const modal = document.getElementById(
      "modalpay"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const resetamount = () => {
    setAmount("");
  };

  const tabpay = async (payto: string) => {
    if (payto == "Qr") {
      setPayToQr(true);
      setPayToCash(false);
      setPayToBorrow(false);
    } else if (payto == "Cash") {
      setPayToCash(true);
      setPayToQr(false);
      setPayToBorrow(false);
    } else if (payto == "Borrow") {
      setPayToBorrow(true);
      setPayToCash(false);
      setPayToQr(false);
    }
  };

  const chooseFile = (files: any) => {
    if (files.length > 0) {
      const file: File = files[0];
      setImage(file);
    }
  };

  const clearImage = () => {
    setImage(null); // <<< เคลียร์ state
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // <<< รีเซ็ต input ด้วย
    }
  };

  useEffect(() => {
    if (amount) {
      const i = selectedItems.reduce((sum, i) => sum + i.quantity * i.price, 0);
      const a = parseInt(amount);
      const x = a - i;
      setChange(x);
    }
  }, [amount]);

  useNumericKeyListener("modalpay", (key: string) => {
    setAmount((prev) => {
      if (key === "back") {
        return prev.slice(0, -1);
      }

      if (key === "enter") {
        console.log("ยืนยันจำนวนเงิน:", prev);
        return prev;
      }

      // กันจุดซ้ำ
      if (key === "." && prev.includes(".")) {
        return prev;
      }

      // กันทศนิยมเกิน 2 หลัก
      if (prev.includes(".")) {
        const [intPart, decimalPart] = prev.split(".");
        if (decimalPart.length >= 2) {
          return prev;
        }
      }

      // ถ้าเริ่มด้วย 0 แล้วตามด้วยตัวเลขไม่ใช่จุด ก็ไม่ให้ต่อ เช่น 01 02
      if (prev === "0" && key !== ".") {
        return key;
      }

      return prev + key;
    });
  });

  const handleAmountButtonClick = (value: string) => {
    const numericAmount = parseFloat(amount) || 0;

    if (["1000", "500", "100", "50"].includes(value)) {
      // บวกเพิ่ม
      const added = numericAmount + parseFloat(value);
      setAmount(added.toString());
    } else if (value === "ลบ") {
      // ลบตัวสุดท้าย
      setAmount((prev) => prev.slice(0, -1));
    } else if (value === "เต็ม") {
      // ตัวอย่าง: ตั้งค่าเต็มจำนวนจากยอดที่ต้องจ่าย (เช่น 20000)
      const total = selectedItems.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
      );
      setAmount(total.toString());
    } else {
      // ต่อท้ายเลข (ตัวเลข 0-9)
      setAmount((prev) => prev + value);
    }
  };

  const handleSubmitSale = async () => {
    const modal = document.getElementById(
      "modalpay"
    ) as HTMLDialogElement | null;
    modal?.close();

    const i = selectedItems.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const a = parseFloat(amount);

    if (payToCash == true) {
      if (a < i || !a) {
        Swal.fire({
          title: "ยอดเงินไม่พอ",
          text: "กรุณาใส่จำนวนเงินให้มากกว่ายอดรวมสุทธิ",
          icon: "warning",
          showConfirmButton: true,
          buttonsStyling: false,
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });
        resetamount();
        return;
      }
    } else if (payToQr == true) {
      if (!image) {
        Swal.fire({
          title: "ไม่พบหลักฐานการชำระเงิน!",
          text: "กรุณาเลือกรูปหลักฐานการชำระเงิน",
          icon: "warning",
          showConfirmButton: true,
          buttonsStyling: false,
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });
        resetamount();
        return;
      }
    }

    try {
      const headers = getAuthHeaders();

      const itemWithZeroPrice = selectedItems.find((item) => item.price === 0);

      if (itemWithZeroPrice && !payToBorrow) {
        Swal.fire({
          icon: "warning",
          title: "กรุณาตั้งราคาขาย",
          text: `คุณยังไม่ได้ตั้งราคาขายสำหรับ "${itemWithZeroPrice.name}"`,
          confirmButtonText: "ตกลง",
        });
        return;
      }

      if (payToCash == true || payToQr == true) {
        let paymentType = null;

        if (payToCash == true) {
          paymentType = "CASH";
        } else if (payToQr == true) {
          paymentType = "TRANSFER";
        }

        const data = new FormData();

        data.append("image", image as Blob);
        data.append("customerId", selectedCustomerId.toString());
        data.append(
          "total",
          selectedItems
            .reduce((sum, i) => sum + i.quantity * i.price, 0)
            .toString()
        );
        data.append("paymentType", String(paymentType));
        data.append("note", "ขายหน้าร้าน");
        data.append(
          "items",
          JSON.stringify(
            selectedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            }))
          )
        );
        const url = "/api/pos/sale";
        const res = await axios.post(url, data, { headers });

        if (!res) throw new Error("เกิดข้อผิดพลาดในการขาย");

        const data2 = await res.data;
        let change2 = null;
        if (parseFloat(String(change)) < 0) {
          change2 = 0;
        } else {
          change2 = change;
        }

        Swal.fire({
          title: `เงินทอน: ${parseFloat(String(change2)).toLocaleString(
            "en-US",
            { minimumFractionDigits: 2 }
          )} ฿ `,
          text: "บันทึกคำสั่งซื้อเรียบร้อย",
          icon: "success",
          showConfirmButton: true,
          confirmButtonText: "ปริ้นใบเสร็จ",
          customClass: {
            confirmButton: "btn btn-primary mr-2",
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.isConfirmed) {
            setSelectedItems([]);
            setSelectedCustomerId(0);
            setCustomerName("");
            clearImage();
            resetamount();
            fetchProducts();
            handlePrintDiv(data2.saleId);
          }
        });
      } else if (payToBorrow == true) {
        if (selectedCustomerId == 0 || !selectedCustomerId) {
          Swal.fire({
            title: "ไม่พบสมาชิก!",
            text: "กรุณาเลือกสมาชิกที่ยืมสินค้า",
            icon: "warning",
            showConfirmButton: true,
            buttonsStyling: false,
            customClass: {
              confirmButton: "btn btn-primary",
            },
          });
          resetamount();
          return;
        }

        const payload = {
          customerId: selectedCustomerId,
          total: selectedItems.reduce(
            (sum, i) => sum + i.quantity * i.price,
            0
          ),
          paymentType: "CASH",
          note: note,
          items: selectedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        };
        const url = "/api/pos/borrow";
        const res = await axios.post(url, payload, { headers });

        if (!res) throw new Error("เกิดข้อผิดพลาดในการขาย");

        const data2 = await res.data;

        Swal.fire({
          title: `ยืมสินค้าเสร็จสิ้น`,
          text: "บันทึกคำสั่งซื้อเรียบร้อย",
          icon: "success",
          showConfirmButton: true,
          confirmButtonText: "ปริ้นใบยืมสินค้า",
          customClass: {
            confirmButton: "btn btn-primary mr-2",
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.isConfirmed) {
            setSelectedItems([]);
            setSelectedCustomerId(0);
            setCustomerName("");
            clearImage();
            resetamount();
            fetchProducts();
            handlePrintDiv(data2.saleId);
          }
        });
      }

      // ล้างตะกร้า
      resetamount();
      setSelectedItems([]);
      setSelectedCustomerId(0);
      clearImage();
      fetchProducts();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "ขายไม่สำเร็จ",
        text: "กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        showConfirmButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "btn btn-primary",
        },
      });
    }
  };

  const handlePrintDiv = (saleId: any) => {
    window.open(
      `/report/pos-sale/${saleId}`,
      "popupWindow",
      "width=600,height=800,left=200,top=100"
    );
  };

  return (
    <>
      <div className="hidden md:flex flex-row w-full gap-1 h-[85vh]">
        <div className="flex flex-col w-4/6 p-4 rounded-2xl bg-base-100 col-span-2 overflow-y-auto">
          <div className="flex flex-row pb-4 gap-2 w-full overflow-x-auto overflow-y-hidden">
            <button
              className="btn btn-primary w-32"
              onClick={(e) => fetchNewProduct("all")}
            >
              ทั้งหมด
            </button>
            {category.map((item) => (
              <button
                key={item.id}
                className="btn btn-primary w-32"
                onClick={(e) => fetchNewProduct(item)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="grid p-2 grid-cols-2 xl:grid-cols-4 gap-2 max-h-full mt-2 overflow-y-auto overflow-x-hidden">
            {Array.isArray(products) &&
              products
                .filter((productdata) => productdata.stock > 0)
                .map((productdata: PorductsInterface, i: number) => (
                  <button
                    onClick={() => handleSelectProduct(productdata)}
                    key={productdata.id}
                    className="card w-auto pb-2 bg-white border-2 border-gray-200 shadow hover:scale-105 transition-transform duration-700"
                  >
                    <div className="card-body p-0">
                      <img
                        src={productdata.imageUrl}
                        alt="product"
                        className="w-full rounded-t-xl h-40"
                      />
                      <div className="flex flex-col p-2">
                        <h1 className="text-left text-xl w-full truncate">
                          {productdata.name}
                        </h1>
                        <div className="grid grid-cols-2 mt-2 gap-1 justify-between">
                          <p className="text-lg">คงเหลือ</p>
                          <p className="text-lg">ราคา</p>
                          <p className="text-lg">
                            {productdata.stock.toLocaleString()}
                          </p>
                          <p className="text-lg">
                            {productdata.salePrice.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
          </div>
        </div>
        <div className="flex flex-col w-2/6 p-4 gap-2 rounded-2xl bg-base-100 col-span-2 overflow-y-auto">
          <div className="flex justify-center items-center flex-col gap-2">
            <h1 className="text-2xl">เลือกสมาชิก</h1>
            <select
              className="select w-full focus:outline-0"
              value={selectedCustomerId}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                setSelectedCustomerId(id);

                const selected = users.find((c) => c.id === id);
                setCustomerName(selected?.name || "");
              }}
            >
              <option value={""}>---- กดเพื่อเลือกสมาชิก ----</option>
              {users.map((user: UsersInterface) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <h1 className="text-2xl font-bold">ยอดรวมสุทธิ</h1>
              <div className="text-2xl font-bold">
                {selectedItems.length > 0 ? (
                  <p className="text-2xl font-bold">
                    {selectedItems
                      .reduce((sum, i) => sum + i.quantity * i.price, 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                    ฿
                  </p>
                ) : (
                  <p className="text-2xl font-bold">0.00 ฿</p>
                )}
              </div>
            </div>
            <div>
              <button
                className="btn btn-primary h-16 w-full text-2xl font-bold"
                onClick={openmadalpay}
              >
                ชำระเงิน
              </button>
            </div>
          </div>
          <div className="h-[75%] flex flex-col gap-2">
            <h1 className="text-xl">รายการสินค้าที่เลือก</h1>
            <div className="card h-full p-4 bg-gray-100 overflow-x-hidden overflow-y-auto">
              {selectedItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-3 w-full items-center justify-between mb-3 bg-base-100 p-4 shadow rounded-2xl"
                >
                  <div className="flex flex-row w-full gap-2 justify-between items-center">
                    <div className="flex items-center w-1/2">
                      <h1 className="truncate w-full">{item.name}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="truncate w-full">
                        {(item.quantity * item.price).toLocaleString()} ฿
                      </p>
                      <button
                        className="btn text-warning"
                        onClick={() => {
                          const modal = document.getElementById(
                            `PriceMd-${item.productId}`
                          ) as HTMLDialogElement | null;
                          modal?.showModal();
                        }}
                      >
                        <MdEditSquare />
                      </button>
                      <dialog
                        id={`PriceMd-${item.productId}`}
                        className="modal"
                      >
                        <div className="modal-box">
                          <p className="text-xl">ราคาต่อหน่วย</p>
                          <input
                            type="number"
                            className="border px-4 py-2 rounded-xl w-full mt-5"
                            value={item.price ?? 0}
                            min={0}
                            onChange={(e) =>
                              handleChangePrice(
                                item.productId,
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <form method="dialog" className="modal-backdrop">
                          <button>close</button>
                        </form>
                      </dialog>
                    </div>
                  </div>
                  <div className="flex w-full justify-between">
                    <button
                      className="btn text-error"
                      onClick={() => handleRemove(item.productId)}
                    >
                      <ImBin />
                    </button>
                    <button
                      className="btn text-primary"
                      onClick={() => {
                        const modal = document.getElementById(
                          `Qty-${item.productId}`
                        ) as HTMLDialogElement | null;
                        modal?.showModal();
                      }}
                    >
                      X{item.quantity}
                    </button>
                    <dialog id={`Qty-${item.productId}`} className="modal">
                      <div className="modal-box">
                        <p className="text-xl">จำนวน</p>
                        <input
                          type="number"
                          className="border px-4 py-2 rounded-xl w-full mt-5"
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
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`flex flex-col md:hidden w-full h-[90vh] bg-base-100
        ${cartModal == true ? "hidden" : "flex"}`}
      >
        <div className="flex pb-4 mt-2 gap-1 overflow-x-auto">
          <button
            className="btn btn-primary w-32"
            onClick={(e) => fetchNewProduct("all")}
          >
            ทั้งหมด
          </button>
          {category.map((item) => (
            <button
              key={item.id}
              className="btn btn-primary w-32"
              onClick={(e) => fetchNewProduct(item)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="w-full grid grid-cols-2 gap-1 mt-2 mb-32 p-2 overflow-y-auto overflow-hidden">
          {Array.isArray(products) &&
            products
              .filter((productdata) => productdata.stock > 0)
              .map((productdata: PorductsInterface, i: number) => (
                <button
                  onClick={() => handleSelectProduct(productdata)}
                  key={productdata.id}
                  className="card w-auto pb-2 bg-white border-2 border-gray-200 shadow hover:scale-105 transition-transform duration-700"
                >
                  <div className="card-body p-0">
                    <img
                      src={productdata.imageUrl}
                      alt="product"
                      className="w-full rounded-t-xl h-40"
                    />
                    <div className="flex flex-col p-2">
                      <h1 className="text-left text-xl w-full truncate">
                        {productdata.name}
                      </h1>
                      <div className="grid grid-cols-2 mt-2 gap-1 justify-between">
                        <p className="text-lg">คงเหลือ</p>
                        <p className="text-lg">ราคา</p>
                        <p className="text-lg">
                          {productdata.stock.toLocaleString()}
                        </p>
                        <p className="text-lg">
                          {productdata.salePrice.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
        </div>
        <div className="h-32 w-full flex flex-col items-center bg-white fixed bottom-0">
          <div className="w-full flex justify-between px-6 mt-4">
            <button
              onClick={() => setCustomerModal((prev) => !prev)}
              className="text-xl"
            >
              เลือกลูกค้า
            </button>
            <button
              onClick={() => setCustomerModal((prev) => !prev)}
              className="text-xl"
            >
              ^
            </button>
          </div>
          <div className="flex items-center justify-center w-full gap-1 mt-3">
            <button
              onClick={openmadalpay}
              className="btn btn-primary text-3xl py-6 w-[80%]"
            >
              {selectedItems.length === 0 && (
                <p className="text-2xl font-bold">ชำระเงิน</p>
              )}
              {selectedItems.length > 0 && (
                <p className="text-2xl font-bold">
                  {selectedItems
                    .reduce((sum, i) => sum + i.quantity * i.price, 0)
                    .toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                  ฿
                </p>
              )}
            </button>
            <button
              onClick={() => setCartModal((prev) => !prev)}
              className="btn py-6 "
            >
              <FaShoppingCart />
            </button>
          </div>
        </div>
        <div
          className={`h-20 mb-26 w-full flex flex-col items-center bg-white ${
            customerModal == true ? "flex" : "hidden"
          }`}
        >
          <div className="w-full mt-4 p-2">
            <div className="flex flex-col items-center justify-between">
              <select
                className="select w-full focus:outline-0"
                value={selectedCustomerId}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  setSelectedCustomerId(id);

                  const selected = users.find((c) => c.id === id);
                  setCustomerName(selected?.name || "");
                }}
              >
                <option value={""}>---- กดเพื่อเลือกสมาชิก ----</option>
                {users.map((user: UsersInterface) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`h-full w-full flex flex-col md:hidden items-center bg-gray-200 ${
          cartModal == true ? "flex" : "hidden"
        }`}
      >
        <div className="p-4 w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl">สินค้าที่เลือก</h1>
            <button
              onClick={() => setCartModal((prev) => !prev)}
              className="btn text-2xl"
            >
              X
            </button>
          </div>
          <div className="mt-6 flex flex-col overflow-y-auto h-full">
            {selectedItems.length === 0 && (
              <p className=" text-8xl">
                <MdRemoveShoppingCart />
              </p>
            )}
            {selectedItems.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col w-full items-center justify-between mb-3 bg-base-100 p-4 shadow rounded-2xl"
              >
                <div className="flex flex-row w-full justify-between items-center">
                  <p className="text-xl truncate">{item.name}</p>
                  <div className="flex flex-row items-center gap-4">
                    <p className="text-xl">
                      {(item.quantity * item.price).toLocaleString()} ฿
                    </p>
                    <button
                      className="btn text-warning text-xl"
                      onClick={() => {
                        const modal = document.getElementById(
                          `PriceSm-${item.productId}`
                        ) as HTMLDialogElement | null;
                        modal?.showModal();
                      }}
                    >
                      <MdEditSquare />
                    </button>

                    <dialog id={`PriceSm-${item.productId}`} className="modal">
                      <div className="modal-box">
                        <p className="text-xl">ราคาต่อหน่วย</p>
                        <input
                          type="number"
                          className="border px-4 py-2 rounded-xl w-full mt-5"
                          value={item.price ?? 0}
                          min={0}
                          onChange={(e) =>
                            handleChangePrice(
                              item.productId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                  </div>
                </div>
                <div className="flex flex-row w-full mt-2 justify-between items-center">
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="btn text-error text-xl"
                  >
                    <ImBin />
                  </button>
                  <button
                    className="btn text-primary text-xl"
                    onClick={() => {
                      const modal = document.getElementById(
                        `QtySm-${item.productId}`
                      ) as HTMLDialogElement | null;
                      modal?.showModal();
                    }}
                  >
                    X{item.quantity}
                  </button>

                  <dialog id={`QtySm-${item.productId}`} className="modal">
                    <div className="modal-box">
                      <p className="text-xl">จำนวน</p>
                      <input
                        type="number"
                        className="border px-4 py-2 rounded-xl w-full mt-5"
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
                    </div>
                    <form method="dialog" className="modal-backdrop">
                      <button>close</button>
                    </form>
                  </dialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <dialog id="modalpay" className="modal">
        <div className="modal-box h-4/7">
          <div className="h-full w-full">
            <div className="flex h-1/10 flex-row mb-4 items-center justify-between">
              <h3 className="font-bold text-xl">ชำระเงิน</h3>
              <form method="dialog">
                <button onClick={resetamount} className="btn btn-base">
                  X
                </button>
              </form>
            </div>
            <div className="flex flex-row w-full h-1/10 justify-between bg-base-300">
              <button
                onClick={() => tabpay("Cash")}
                className={`${
                  payToCash == true
                    ? "text-center w-1/3 text-xl bg-primary py-3 text-base-100"
                    : "text-center w-1/3 text-xl  py-3 hover:bg-accent"
                }`}
              >
                เงินสด
              </button>
              <button
                onClick={() => tabpay("Qr")}
                className={`${
                  payToQr == true
                    ? "text-center w-1/3 text-xl bg-primary py-3 text-base-100"
                    : "text-center w-1/3 text-xl border-x-2 border-gray-300 py-3 hover:bg-accent"
                }`}
              >
                เงินโอน
              </button>
              <button
                onClick={() => tabpay("Borrow")}
                className={`${
                  payToBorrow == true
                    ? "text-center w-1/3 text-xl bg-primary py-3 text-base-100"
                    : "text-center w-1/3 text-xl  py-3 hover:bg-accent"
                }`}
              >
                ยืมสินค้า
              </button>
            </div>
            <div className="h-6/10 flex items-center justify-center">
              {payToQr == true && (
                <div className=" mb-2 px-4 flex justify-center flex-col gap-10">
                  <div className="flex flex-col w-full items-center justify-center">
                    <h1 className="text-2xl">ยอดรวมสุทธิ</h1>
                    {selectedItems.length > 0 ? (
                      <p className="text-3xl font-bold">
                        {selectedItems
                          .reduce((sum, i) => sum + i.quantity * i.price, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}{" "}
                        ฿
                      </p>
                    ) : (
                      <p className="text-2xl font-bold">0.00 ฿</p>
                    )}
                  </div>
                  <label className="cursor-pointer truncate overflow-hidden whitespace-nowrap bg-secondary text-base-100 py-6 px-6 rounded-full w-full max-w-xs text-center text-lg font-semibold hover:bg-gray-500 transition-all duration-300">
                    {image ? image.name : "เลือกรูปหลักฐานการชำระเงิน"}
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
              )}
              {payToCash == true && (
                <div className="w-full">
                  <p className="w-full h-16 items-end justify-end flex text-4xl text-end">
                    {amount === ""
                      ? "0.00"
                      : parseFloat(amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                  </p>
                  <div className="grid grid-cols-4 mt-2">
                    {[
                      "7",
                      "8",
                      "9",
                      "1000",
                      "4",
                      "5",
                      "6",
                      "500",
                      "1",
                      "2",
                      "3",
                      "100",
                      "ลบ",
                      "0",
                      "เต็ม",
                      "50",
                    ].map((val) => (
                      <button
                        key={val}
                        className={`btn h-14 text-2xl ${
                          ["1000", "500", "100", "50"].includes(val)
                            ? "text-primary"
                            : val === "ลบ"
                            ? "text-error"
                            : val === "เต็ม"
                            ? "text-success"
                            : ""
                        }`}
                        onClick={() => handleAmountButtonClick(val)}
                      >
                        {val === "1000" ? "1,000" : val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {payToBorrow == true && (
                <div className="w-full flex flex-col items-center justify-center">
                  <p className="text-xl mb-4">ผู้ยืมสินค้า</p>
                  <p className="text-3xl">{customername}</p>
                </div>
              )}
            </div>
            <div className="modal-action h-1/10">
              <button
                onClick={handleSubmitSale}
                className="btn btn-primary w-full text-3xl py-7"
              >
                ชำระเงิน
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
