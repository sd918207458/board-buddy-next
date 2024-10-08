import { useState, useEffect } from "react";
import GameAccordion from "@/components/GameAccordion/GameAccordion";
import Card from "@/components/card/Card";
import Footer from "@/components/footer";
import Pagination from "@/components/pagination/Pagination";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductSearch from "@/components/ProductSearch/ProductSearch"; // 引入 ProductSearch 組件

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState({}); // 保存每個產品的收藏狀態
  const [filteredProducts, setFilteredProducts] = useState([]); // 存儲篩選後的產品
  const [filterTitle, setFilterTitle] = useState("全部商品"); // 預設為全部商品

  const [showFilter, setShowFilter] = useState(false); // 控制篩選器顯示狀態
  const [showSearch, setShowSearch] = useState(false); // 控制搜尋欄顯示狀態
  // 購物車狀態：保存所有加入購物車的商品
  const [cartItems, setCartItems] = useState([]);

  // Fetch 商品数据
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3005/api/productsGame");
        const data = await response.json();
        setProducts(data.data || []); // 初始化 products
        setFilteredProducts(data.data || []); // 初始化 filteredProducts，與 products 保持一致
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []); // 這裡的空陣列表示只在組件首次加載時執行

  // 切換收藏狀態
  const toggleFavorite = (productId) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [productId]: !prevFavorites[productId], // 切換收藏狀態
    }));
  };

  // 篩選產品
  const filterProducts = (filterType) => {
    let sortedProducts = [...products];
    const cleanPrice = (price) => parseFloat(price.replace(/,/g, ""));

    if (filterType === "popular") {
      sortedProducts.sort((a, b) => b.stock - a.stock);
    } else if (filterType === "priceHigh") {
      sortedProducts.sort((a, b) => cleanPrice(b.price) - cleanPrice(a.price));
    } else if (filterType === "priceLow") {
      sortedProducts.sort((a, b) => cleanPrice(a.price) - cleanPrice(b.price));
    }

    console.log("已篩選產品：", sortedProducts); // 檢查篩選結果
    setFilteredProducts([...sortedProducts]);
  };

  // 點擊篩選器時，同時應用篩選並更新標題
  const handleFilterChange = (filterType) => {
    filterProducts(filterType); // 應用篩選邏輯
    const titleMap = {
      popular: "依照熱門程度",
      priceHigh: "依照價錢由高到低",
      priceLow: "依照價錢由低到高",
    };
    setFilterTitle(titleMap[filterType] || "依照熱門程度");
    console.log(`篩選條件：${filterType}`); // 用於檢查篩選器是否正常觸發
  };

  // 添加商品到購物車的函數
  const addToCart = (product) => {
    const existingProduct = cartItems.find(
      (item) => item.product_id === product.product_id
    );

    if (existingProduct) {
      // 如果商品已經在購物車中，更新數量
      setCartItems((prevCartItems) =>
        prevCartItems.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // 如果商品不在購物車中，添加新商品
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  return (
    <>
      <div className="flex overflow-visible relative overflow-x-hidden">
        {/* Sidebar on the left */}
        <aside className="w-70">
          <Breadcrumbs />
          <GameAccordion />
        </aside>
        {/* Main content on the right */}
        <main className="relative flex flex-col">
          {/* 引入 ProductSearch 組件 */}
          <ProductSearch
            filterTitle={filterTitle}
            setShowFilter={setShowFilter}
            showFilter={showFilter}
            setShowSearch={setShowSearch}
            showSearch={showSearch}
            handleFilterChange={handleFilterChange}
          />

          {/* Product Card and other components */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.product_id}
                product={product}
                toggleFavorite={toggleFavorite}
                isFavorite={favorites[product.product_id]}
                addToCart={addToCart} // 傳遞 addToCart 函數
              />
            ))}
          </div>
          <Pagination />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ProductList;
