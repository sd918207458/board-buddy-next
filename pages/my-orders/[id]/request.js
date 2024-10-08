import React, { useState, useEffect } from "react";
import Footer from "@/components/footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 可重用的輸入欄位組件
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
}) => (
  <div className="form-control">
    <label htmlFor={name} className="label text-gray-700 dark:text-gray-300">
      <span className="label-text">{label}</span>
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="input input-bordered border-[#036672] focus:border-[#024c52]"
      placeholder={`請輸入${label}`}
      required={required}
    />
  </div>
);

export default function Request() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orderNumber: "",
    orderDate: "",
    productName: "",
    productModel: "",
    productQuantity: "",
    returnReason: "",
  });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // 獲取存取令牌
  const getToken = () => localStorage.getItem("token");

  const fetchWithToken = async (url, options = {}) => {
    const token = getToken();
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers, credentials: "include" });
  };

  useEffect(() => {
    setIsMounted(true);

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const response = await fetchWithToken(
          "http://localhost:3005/api/orders",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          setOrders(result.data);
        } else {
          toast.error("無法載入訂單資料");
        }
      } catch (error) {
        console.error("獲取訂單失敗:", error);
        toast.error("無法載入訂單資料");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderChange = (e) => {
    const selectedOrder = orders.find(
      (order) => order.order_id === Number(e.target.value)
    );
    setFormData({
      ...formData,
      orderNumber: selectedOrder.order_id,
      orderDate: selectedOrder.order_date,
      productName: selectedOrder.product_name,
    });
  };

  const validateForm = () => {
    const {
      name,
      email,
      phone,
      orderNumber,
      orderDate,
      productQuantity,
      returnReason,
    } = formData;
    if (
      !name ||
      !email ||
      !phone ||
      !orderNumber ||
      !orderDate ||
      !productQuantity ||
      !returnReason
    ) {
      return "請填寫所有必填欄位";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "請輸入有效的電子郵件地址";
    }
    if (!/^\d{10,12}$/.test(phone)) {
      return "請輸入有效的手機號碼";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetchWithToken(
        "http://localhost:3005/api/request/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: formData.orderNumber,
            member_id: 1,
            order_date: formData.orderDate,
            product_name: formData.productName,
            product_model: formData.productModel,
            product_quantity: formData.productQuantity,
            reason: formData.returnReason,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setFormData({
          name: "",
          email: "",
          phone: "",
          orderNumber: "",
          orderDate: "",
          productName: "",
          productModel: "",
          productQuantity: "",
          returnReason: "",
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("提交失敗，請稍後重試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || loadingOrders) return <div>載入訂單資料中...</div>;

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#003E52]">
        <div className="card w-full max-w-lg mx-auto overflow-hidden bg-white dark:bg-gray-800 shadow-lg lg:max-w-4xl rounded-lg">
          <div className="w-full p-4">
            <Breadcrumbs />
          </div>

          <section className="p-6">
            <h2 className="text-2xl font-semibold text-[#003E52] dark:text-white text-center">
              退換貨處理
            </h2>
          </section>

          <form onSubmit={handleSubmit} className="m-4">
            <h2 className="text-xl font-semibold text-[#003E52] dark:text-white text-center">
              訂單資料
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="姓名"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                required
              />
              <InputField
                label="信箱"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="手機號碼"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                required
              />

              {/* 使用者選擇訂單 */}
              <div className="form-control">
                <label
                  htmlFor="orderNumber"
                  className="label text-gray-700 dark:text-gray-300"
                >
                  <span className="label-text">訂單編號</span>
                </label>
                <select
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleOrderChange}
                  className="select select-bordered border-[#036672] focus:border-[#024c52]"
                  required
                >
                  <option value="">請選擇訂單</option>
                  {orders.map((order) => (
                    <option key={order.order_id} value={order.order_id}>
                      {`訂單編號: ${order.order_id} 日期: ${order.order_date}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="訂單日期"
                name="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                required
              />
              <InputField
                label="商品名稱"
                name="productName"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="商品型號"
                name="productModel"
                value={formData.productModel}
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                required
              />
              <InputField
                label="商品數量"
                name="productQuantity"
                type="number"
                value={formData.productQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label
                htmlFor="returnReason"
                className="label text-gray-700 dark:text-gray-300"
              >
                <span className="label-text">退貨原因</span>
              </label>
              <textarea
                id="returnReason"
                name="returnReason"
                value={formData.returnReason}
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                className="textarea textarea-bordered border-[#036672] focus:border-[#024c52]"
                placeholder="請輸入退貨原因"
                required
              ></textarea>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary bg-[#036672] hover:bg-[#024c52] border-none ${
                  isSubmitting ? "loading" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "提交中..." : "提交表單"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ToastContainer for toast notifications */}
      <ToastContainer />
      <Footer />
    </>
  );
}
