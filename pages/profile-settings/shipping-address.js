import React, { useState, useEffect } from "react";
import Footer from "@/components/footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import AddressCard from "@/components/address/AddressCard";
import AddressForm from "@/components/address/AddressForm";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export default function ShippingAddress() {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    city: "",
    area: "",
    street: "", // 確保這裡與後端的 `address` 一致
    detailed_address: "", // 確保這裡與後端的 `detailed_address` 一致
    isDefault: false,
    address_id: null,
    deliveryMethod: "homeDelivery",
    storeType: "",
    storeName: "",
  });
  const [userData, setUserData] = useState(null); // 存儲用戶資料
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 取得存取令牌
  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("http://localhost:3005/api/users/check", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        credentials: "include",
      });

      const userDataResponse = await response.json();
      console.log("用戶資料: ", userDataResponse);

      if (userDataResponse?.data?.user) {
        // 設定使用者資料
        setUserData(userDataResponse.data.user);

        // 將用戶資料填入表單中
        setFormData((prevFormData) => ({
          ...prevFormData,
          username: userDataResponse.data.user.username || "",
          phone: userDataResponse.data.user.phone_number || "",
        }));
      }
    } catch (error) {
      console.error("無法加載用戶資料:", error);
      setErrorMessage("無法加載用戶資料");
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchAddresses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `http://localhost:3005/api/shipment/addresses/${formData.address_id}`
        : "http://localhost:3005/api/shipment/addresses";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error("Failed to submit address");
      }

      setAddresses((prevAddresses) => {
        if (!Array.isArray(prevAddresses)) {
          prevAddresses = [];
        }

        if (isEditing) {
          return prevAddresses.map((addr) =>
            addr.address_id === formData.address_id ? result.data : addr
          );
        }
        return [...prevAddresses, result.data];
      });

      resetForm();
      closeModal();
    } catch (error) {
      console.error("Error submitting address:", error);
      setErrorMessage("提交地址失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (address) => {
    setIsEditing(true);
    setFormData({
      username: address.username || userData?.username,
      phone: address.phone || userData?.phone_number,
      city: address.city,
      area: address.area,
      street: address.street,
      detailed_address: address.detailed_address || "", // 使用 detailed_address
      isDefault: address.isDefault,
      address_id: address.address_id,
      deliveryMethod: address.deliveryMethod || "homeDelivery",
      storeType: address.storeType || "",
      storeName: address.storeName || "",
    });
    document.getElementById("my_modal_1").showModal();
  };

  const handleDelete = async (addressId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3005/api/shipment/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to delete address");

      setAddresses((prevAddresses) =>
        prevAddresses.filter((addr) => addr.address_id !== addressId)
      );
    } catch (error) {
      console.error("Error deleting address:", error);
      setErrorMessage("刪除地址失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await fetch(
        `http://localhost:3005/api/shipment/addresses/${addressId}/default`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to set default address");

      setAddresses((prevAddresses) =>
        prevAddresses.map((addr) => ({
          ...addr,
          isDefault: addr.address_id === addressId,
        }))
      );
    } catch (error) {
      console.error("Error setting default address:", error);
      setErrorMessage("設定預設地址失敗");
    }
  };

  const resetForm = () => {
    setFormData({
      username: userData?.username || "",
      phone: userData?.phone_number || "",
      city: "",
      area: "",
      street: "",
      detailed_address: "", // 使用 detailed_address
      isDefault: false,
      id: null,
      deliveryMethod: "homeDelivery",
      storeType: "",
      storeName: "",
    });
    setIsEditing(false);
  };

  const openModal = () => {
    if (!isEditing) {
      resetForm(); // 只在新增時重置表單
    }
    document.getElementById("my_modal_1").showModal();
  };

  const closeModal = () => {
    document.getElementById("my_modal_1").close();
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch(
        "http://localhost:3005/api/shipment/addresses",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch addresses");

      const data = await response.json();
      setAddresses(data.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setErrorMessage("無法加載地址數據");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#003E52] dark:bg-gray-900">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4">
          <Breadcrumbs />

          <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white mb-4">
            我的地址
          </h2>

          <section className="max-w-4xl mx-auto grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            {addresses && addresses.length > 0 ? (
              <TransitionGroup component={null}>
                {addresses.map((address) => (
                  <CSSTransition
                    key={address.address_id}
                    timeout={300}
                    classNames="fade"
                  >
                    <AddressCard
                      address={address}
                      handleEdit={() => handleEdit(address)}
                      handleDelete={() => handleDelete(address.address_id)}
                      handleSetDefault={() =>
                        handleSetDefault(address.address_id)
                      }
                    />
                  </CSSTransition>
                ))}
              </TransitionGroup>
            ) : (
              <div className="card text-center p-4 text-gray-800 col-span-2">
                <p>您目前沒有地址，請新增地址。</p>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body flex justify-between">
                <h2 className="card-title">新增地址</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsEditing(false);
                    openModal();
                  }}
                >
                  新增
                </button>
              </div>
            </div>
          </section>
        </div>

        <TransitionGroup>
          <CSSTransition timeout={300} classNames="fade">
            <dialog id="my_modal_1" className="modal">
              <div className="modal-box">
                <AddressForm
                  formData={formData}
                  handleChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  handleSubmit={handleSubmit}
                  isEditing={isEditing}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                  closeModal={closeModal}
                />
              </div>
            </dialog>
          </CSSTransition>
        </TransitionGroup>
      </div>
      <Footer />
    </div>
  );
}
