import React, { useState, useEffect } from "react";
import Footer from "@/components/footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Coupon from "@/components/payment/Coupon";

// Toast 通知組件
const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-4 right-4 z-50 flex items-center p-4 space-x-4 text-white rounded-lg shadow-lg ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`}
  >
    <span>{message}</span>
    <button
      className="text-white font-bold focus:outline-none"
      onClick={onClose}
    >
      &times;
    </button>
  </div>
);

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem("token");

// Helper function for API requests with token
const fetchData = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "伺服器錯誤");
  return data;
};

// Helper function for sending data to the server
const sendData = (url, method, data) =>
  fetchData(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

// Initial state for payment methods
const initialMethodState = {
  id: null,
  type: "cash",
  cardholderName: "",
  cardNumber: "",
  expiryDate: "",
  cardType: "",
  onlinePaymentService: "",
};

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [currentMethod, setCurrentMethod] = useState(initialMethodState);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null); // 用於顯示通知
  const [errors, setErrors] = useState({}); // 儲存表單錯誤訊息

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // 顯示通知
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null); // 5秒後自動關閉
    }, 3000);
  };

  // Fetch all payment methods for the user
  const fetchPaymentMethods = async () => {
    try {
      const result = await fetchData(
        "http://localhost:3005/api/payment-methods"
      );
      if (result.status === "success") {
        setPaymentMethods(result.data);
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // 設置為預設付款方式
  const setDefaultPaymentMethod = async (id) => {
    try {
      const result = await sendData(
        `http://localhost:3005/api/payment-methods/set-default/${id}`,
        "PUT"
      );
      if (result.status === "success") {
        showToast("已設置為預設付款方式", "success");
        fetchPaymentMethods(); // 重新加載付款方式列表
      }
    } catch (error) {
      showToast("設置預設付款方式失敗", "error");
    }
  };

  // 定義 applyCoupon 函數處理優惠券邏輯
  const applyCoupon = (couponCode) => {
    if (couponCode === "DISCOUNT10") {
      setDiscount(10); // 設置折扣
      showToast("優惠券已成功應用！", "success");
    } else {
      showToast("無效的優惠券代碼", "error");
    }
  };

  // 即時驗證表單欄位
  const validateField = (name, value) => {
    let error = "";
    if (name === "cardNumber" && value.length < 16) {
      error = "信用卡號必須為16位數字";
    } else if (
      name === "expiryDate" &&
      !/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)
    ) {
      error = "到期日格式錯誤，請按照 MM/YY 格式";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentMethod((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  // 表單提交前的數據驗證
  const validateForm = () => {
    const newErrors = {};
    if (currentMethod.type === "creditCard") {
      if (!currentMethod.cardNumber || currentMethod.cardNumber.length !== 16) {
        newErrors.cardNumber = "信用卡卡號格式錯誤，請輸入16位數字";
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(currentMethod.expiryDate)) {
        newErrors.expiryDate = "到期日格式錯誤，請按照MM/YY格式";
      }
    }
    if (
      currentMethod.type === "onlinePayment" &&
      !currentMethod.onlinePaymentService
    ) {
      newErrors.onlinePaymentService = "請選擇線上支付服務";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    let paymentData;
    if (currentMethod.type === "creditCard") {
      paymentData = {
        type: currentMethod.type,
        card_number: currentMethod.cardNumber,
        card_type: currentMethod.cardType,
        expiration_date: currentMethod.expiryDate,
        cardholder_name: currentMethod.cardholderName || "",
        is_default: currentMethod.isDefault || false,
      };
    } else if (currentMethod.type === "onlinePayment") {
      paymentData = {
        type: currentMethod.type,
        online_payment_service: currentMethod.onlinePaymentService,
        is_default: currentMethod.isDefault || false,
      };
    } else if (currentMethod.type === "cash") {
      paymentData = {
        type: currentMethod.type,
        is_default: currentMethod.isDefault || false,
      };
    }

    const method = currentMethod.id ? "PUT" : "POST";
    const url = currentMethod.id
      ? `http://localhost:3005/api/payment-methods/${currentMethod.id}`
      : "http://localhost:3005/api/payment-methods";

    try {
      const result = await sendData(url, method, paymentData);
      if (result.status === "success") {
        showToast("付款方式已成功保存", "success");
        fetchPaymentMethods(); // 重新加載付款方式列表
        setIsModalOpen(false);
      }
    } catch (error) {
      showToast("伺服器錯誤，請稍後再試", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (method) => {
    setIsEditing(true);
    setCurrentMethod({
      id: method.payment_id,
      type: method.payment_type,
      cardholderName: method.cardholder_name || "",
      cardNumber: method.card_number || "",
      cardType: method.card_type || "",
      expiryDate: method.expiration_date || "",
      onlinePaymentService: method.online_payment_service || "",
    });
    setIsModalOpen(true);
  };

  // Delete a payment method
  const handleDelete = async (id) => {
    try {
      const result = await sendData(
        `http://localhost:3005/api/payment-methods/${id}`,
        "DELETE"
      );
      if (result.status === "success") {
        showToast("付款方式已刪除", "success");
        setPaymentMethods((prev) =>
          prev.filter((method) => method.payment_id !== id)
        );
      }
    } catch (error) {
      showToast("伺服器錯誤，請稍後再試", "error");
    }
  };

  const resetForm = () => {
    setCurrentMethod(initialMethodState);
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#003E52] dark:bg-gray-900">
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4">
            <Breadcrumbs />
            <section className="max-w-4xl mx-auto mt-6">
              <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white mb-4">
                我的錢包
              </h2>
            </section>

            <h3 className="text-l font-semibold text-gray-700 capitalize dark:text-white mb-6">
              常用錢包
            </h3>
            <section className="max-w-4xl mx-auto grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
              <TransitionGroup component={null}>
                {paymentMethods.map((method) => (
                  <CSSTransition
                    key={method.payment_id}
                    timeout={300}
                    classNames="fade"
                  >
                    <div className="card bg-base-100 shadow-xl mb-4">
                      <div className="card-body">
                        <h2 className="card-title">付款方式</h2>
                        <p>付款方式: {method.payment_type}</p>
                        {method.card_number && (
                          <p>卡號: {method.card_number}</p>
                        )}
                        {method.expiration_date && (
                          <p>到期日: {method.expiration_date}</p>
                        )}
                        <div className="flex justify-between">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleEdit(method)}
                          >
                            編輯
                          </button>
                          <button
                            className="btn btn-error"
                            onClick={() => handleDelete(method.payment_id)}
                          >
                            刪除
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() =>
                              setDefaultPaymentMethod(method.payment_id)
                            }
                            disabled={method.is_default}
                          >
                            設為預設
                          </button>
                        </div>
                      </div>
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body flex justify-between">
                  <h2 className="card-title">新增錢包</h2>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    新增
                  </button>
                </div>
              </div>
            </section>
            <section className="max-w-4xl mx-auto mt-6">
              <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white mb-4">
                我的優惠券
              </h2>
              <Coupon applyCoupon={applyCoupon} />
              {discount > 0 && (
                <p className="text-green-500 mt-4">優惠券折扣: NT${discount}</p>
              )}
            </section>
          </div>

          {isModalOpen && (
            <dialog open className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">
                  {isEditing ? "編輯錢包" : "新增錢包"}
                </h3>

                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">選擇付款方式</span>
                  </label>
                  <select
                    name="type"
                    value={currentMethod.type}
                    onChange={handleChange}
                    className="select select-bordered"
                  >
                    <option value="creditCard">信用卡付款</option>
                    <option value="cash">現金付款</option>
                    <option value="onlinePayment">線上付款</option>
                  </select>
                </div>

                {currentMethod.type === "creditCard" && (
                  <>
                    <div className="form-control mt-4">
                      <label className="label">
                        <span className="label-text">信用卡卡號</span>
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={currentMethod.cardNumber}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        className="input input-bordered"
                        maxLength="16" // 限制卡號長度
                        required
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="form-control mt-4">
                      <label className="label">
                        <span className="label-text">到期日 (MM/YY)</span>
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={currentMethod.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className="input input-bordered"
                        pattern="\d{2}/\d{2}" // 正則表達式驗證格式
                        required
                      />
                      {errors.expiryDate && (
                        <p className="text-red-500">{errors.expiryDate}</p>
                      )}
                    </div>

                    <div className="form-control mt-4">
                      <label className="label">
                        <span className="label-text">卡片類型</span>
                      </label>
                      <select
                        name="cardType"
                        value={currentMethod.cardType}
                        onChange={handleChange}
                        className="select select-bordered"
                        required
                      >
                        <option value="">選擇卡片類型</option>
                        <option value="Visa">Visa</option>
                        <option value="MasterCard">MasterCard</option>
                        <option value="Amex">Amex</option>
                      </select>
                    </div>
                  </>
                )}

                {currentMethod.type === "onlinePayment" && (
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">選擇線上付款方式</span>
                    </label>
                    <select
                      name="onlinePaymentService"
                      value={currentMethod.onlinePaymentService}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="Line Pay">Line Pay</option>
                      <option value="ECPay">ECPay</option>
                    </select>
                    {errors.onlinePaymentService && (
                      <p className="text-red-500">
                        {errors.onlinePaymentService}
                      </p>
                    )}
                  </div>
                )}

                <div className="modal-action">
                  <button
                    className={`btn btn-success ${isLoading ? "loading" : ""}`}
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isEditing ? "保存修改" : "新增錢包"}
                  </button>
                  <button className="btn" onClick={() => setIsModalOpen(false)}>
                    取消
                  </button>
                </div>
              </div>
            </dialog>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Footer />
    </>
  );
}
