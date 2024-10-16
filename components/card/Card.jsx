import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // 引入 Next.js 的 Link 組件
import { useCart } from "@/hooks/useCart"; // 引入購物車上下文
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Card = ({ product, searchQuery }) => {
  const { totalPrice } = useCart(); // 總價
  const { addToCart } = useCart(); // 從購物車上下文中獲取 addToCart 函數
  const [isFavorite, setIsFavorite] = useState(false); // 初始化收藏狀態

  // 檢查商品是否已經在收藏列表中
  useEffect(() => {
    const favoriteItems =
      JSON.parse(localStorage.getItem("favoriteItems")) || [];
    const isAlreadyFavorite = favoriteItems.some(
      (item) => item.product_id === product.product_id
    );
    setIsFavorite(isAlreadyFavorite); // 設定是否為收藏狀態
  }, [product.product_id]); // 當 product_id 改變時重新檢查

  // 將收藏的商品存入 localStorage
  const handleFavoriteClick = (productId) => {
    const favoriteItems =
      JSON.parse(localStorage.getItem("favoriteItems")) || [];

    const isAlreadyFavorite = favoriteItems.some(
      (item) => item.product_id === productId
    );

    let updatedFavorites;
    if (isAlreadyFavorite) {
      updatedFavorites = favoriteItems.filter(
        (item) => item.product_id !== productId
      );
      setIsFavorite(false); // 更新愛心狀態為未收藏
    } else {
      updatedFavorites = [...favoriteItems, product];
      setIsFavorite(true); // 更新愛心狀態為收藏
    }

    localStorage.setItem("favoriteItems", JSON.stringify(updatedFavorites)); // 更新 localStorage
    console.log("Updated favorite items in localStorage:", updatedFavorites); // 日誌檢查更新後的收藏資料
  };
  const handleAddToCart = () => {
    // 清除價格中的逗號並轉換為數字
    const cleanPrice = parseFloat(product.price.replace(/,/g, ""));
    const productWithQuantity = {
      ...product,
      price: cleanPrice, // 使用處理過的價格
      quantity: 1,
    };
    addToCart(productWithQuantity); // 將商品加入購物車
  };
  // 如果產品名稱不包含搜尋內容，則不顯示該產品
  if (searchQuery && !product.product_name.includes(searchQuery)) {
    return null; // 不顯示該產品
  }
  return (
    <Link
      href={`/product/${product.product_id}`} // 使用動態路由
      className="relative flex flex-col group"
    >
      <div className="relative rounded-lg overflow-hidden">
        <Image
          className="transition-all duration-300 group-hover:blur-md rounded-lg"
          src={product.image}
          width={400}
          height={400}
          alt={product.product_name}
        />
      </div>

      <div className="absolute inset-0 bg-[#003E52] bg-opacity-80 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
        <h1 className="text-xl font-bold mb-4 text-white">
          {product.product_name}
        </h1>
        <p className="text-lg font-semibold mb-4 text-white">
          ${product.price}
        </p>
        <div className="flex space-x-2">

          <button
            onClick={(e) => {
              e.preventDefault(); // 防止跳轉到商品詳細頁面
              console.log("Before add to cart");
              handleAddToCart(); // 調用加入購物車的邏輯
              toast.success("商品已加入購物車！", {
                position: "top-right",
                autoClose: 2000, // 2秒後自動關閉
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }}
            className="py-1.5 px-4 text-white border border-white rounded-lg hover:bg-white hover:text-[#003E52] transition-all"
          >
            加入購物車
          </button>

          <button
            onClick={(e) => {
              e.preventDefault(); // 防止跳轉到商品詳細頁面
              handleFavoriteClick(product.product_id); // 更新收藏狀態
            }}
            className="py-1.5 px-4 text-white border border-white rounded-lg hover:bg-white hover:text-[#003E52] transition-all"
          >
            {isFavorite ? "取消收藏" : "加入收藏"}
          </button>
        </div>
      </div>

      <div className="pt-3 flex items-center justify-between transition-all duration-300 group-hover:blur-md">
        <p>{product.product_name}</p>
        <svg
          className={`h-6 w-6 fill-current ${
            isFavorite ? "text-red-500" : "text-gray-500"
          } hover:text-red-500`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            d={
              isFavorite
                ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                : "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM7.5 5C5.57 5 4 6.57 4 8.5c0 2.54 2.5 5.1 7.55 9.44 5.05-4.34 7.55-6.9 7.55-9.44C20 6.57 18.43 5 16.5 5c-1.54 0-3.04.99-3.57 2.36h-1.87C10.04 5.99 8.54 5 7.5 5z"
            }
          />
        </svg>
      </div>
      <p className="pt-1 text-white-900 font-bold transition-all duration-300 group-hover:blur-md">
        ${product.price}
      </p>
    </Link>
  );
};

export default Card;
