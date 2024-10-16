import React from "react";
import Footer from "@/components/footer";
import HeroSection from "@/components/home/HeroSection";
import AboutUs from "@/components/home/AboutUs";
import PopularProducts from "@/components/home/PopularProducts";
import PopularStores from "@/components/home/PopularStores";
import GroupEvents from "@/components/home/GroupEvents";
import RecommendedGames from "@/components/home/RecommendedGames";
import Test from "@/components/test";
export default function Home() {
  return (
    <>
      <HeroSection /> {/* 首頁大圖區塊 */}
      <AboutUs /> {/* 關於我們區塊 */}
      <RecommendedGames /> {/* 推薦桌遊區塊 */}
      <PopularProducts /> {/* 熱門商品輪播圖 */}
      <GroupEvents /> {/* 桌遊揪團活動 */}
      <PopularStores /> {/* 熱門店家輪播圖 */}
      {/* <Test/> */}
      <Footer />
    </>
  );
}
