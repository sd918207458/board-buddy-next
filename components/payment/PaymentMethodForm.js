
import React from "react";


const PaymentMethodForm = ({
  currentMethod,
  isEditing,
  isLoading,
  handleSubmit,
  handleChange,
  closeModal,
}) => {
  // 簡單的表單驗證（驗證卡號和到期日）
  const validateForm = () => {
    const cardNumberRegex = /^\d{4} \d{4} \d{4} \d{4}$/;
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

    if (!cardNumberRegex.test(currentMethod.cardNumber)) {
      alert("請輸入有效的信用卡卡號 (0000 0000 0000 0000)");
      return false;
    }

    if (!expiryDateRegex.test(currentMethod.expiryDate)) {
      alert("請輸入有效的到期日 (MM/YY)");
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 確定卡片類型
    const getCardType = (cardNumber) => {
      const firstDigit = cardNumber.charAt(0);
      if (firstDigit === "4") return "Visa";
      if (firstDigit === "5") return "MasterCard";
      if (firstDigit === "3") return "Amex";
      return "Unknown";
    };

    // 格式化到期日（將 MM/YY 轉換為 date 格式）
    const convertToDate = (expiryDate) => {
      const [month, year] = expiryDate.split("/");
      if (!month || !year) return null; // 檢查是否有效
      return new Date(`20${year}-${month}-01`); // 格式化為 YYYY-MM-DD
    };

    // 表單驗證邏輯
    if (validateForm()) {
      setIsLoading(true);

      try {
        const paymentData = {
          member_id: localStorage.getItem("member_id"), // 確保 localStorage 中存儲了正確的 member_id
          card_number: currentMethod.cardNumber.replace(/\s/g, "").slice(-4), // 處理卡號
          card_type: getCardType(currentMethod.cardNumber), // 卡片類型
          expiration_date: convertToDate(currentMethod.expiryDate), // 到期日轉換
          cardholder_name: currentMethod.cardholderName, // 持卡人姓名
        };

        const response = await fetch(
          "http://localhost:3005/api/payment-methods",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
          }
        );

        const result = await response.json();
        if (result.status === "success") {
          alert("付款方式已成功添加");
          closeModal();
        } else {
          alert("提交失敗，請重試");
        }
      } catch (error) {
        console.error("提交失敗", error);
        alert("伺服器錯誤，請稍後再試");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <dialog id="my_modal_4" className="modal">
      <form className="modal-box" onSubmit={handleFormSubmit}>

        <h3 className="font-bold text-lg">
          {isEditing ? "編輯錢包" : "新增錢包"}
        </h3>

        <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
          {/* Credit Card Number */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">信用卡卡號</span>
            </label>
            <input
              type="text"
              name="cardNumber"
              value={currentMethod.cardNumber}
              onChange={handleChange}
              placeholder="0000 0000 0000 0000"
              className="input input-bordered w-full"

              required

            />
          </div>

          {/* Expiry Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">到期日</span>
            </label>
            <input
              type="text"
              name="expiryDate"
              value={currentMethod.expiryDate}
              onChange={handleChange}
              placeholder="MM/YY"
              className="input input-bordered w-full"

              required

            />
          </div>
        </div>

        {/* Set Default Payment Method */}
        <div className="form-control mt-4">
          <label className="cursor-pointer label">
            <input
              type="checkbox"
              name="isDefault"
              checked={currentMethod.isDefault}
              onChange={handleChange}
              className="checkbox"
            />
            <span className="label-text ml-2">設為我的預設付款方式</span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="modal-action">
          <button

            type="submit"
            className={`btn btn-success ${isLoading ? "loading" : ""}`}

            disabled={isLoading}
          >
            {isEditing ? "保存修改" : "新增錢包"}
          </button>

          <button type="button" className="btn" onClick={closeModal}>
            取消
          </button>
        </div>
      </form>

    </dialog>
  );
};

export default PaymentMethodForm;
